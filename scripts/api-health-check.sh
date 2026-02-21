#!/bin/bash
# ============================================
# Cosmos Collective — External API Health Check
# With auto-remediation: retry, cache warm, fallback activation
#
# Deploy to Donnacha VPS as a cron job:
#   0 6,18 * * * /opt/cosmos-health/api-health-check.sh
# ============================================

set -uo pipefail

ALERT_EMAIL="${ALERT_EMAIL:-macdara5000@gmail.com}"
LOG_DIR="${LOG_DIR:-/var/log/cosmos-health}"
CACHE_DIR="${CACHE_DIR:-/var/cache/cosmos-health}"
BRAIN_API="https://45.77.233.102/api/brain/memories"
TIMEOUT=15
MAX_RETRIES=3
RETRY_DELAY=10

FAILED=()
RESULTS=()
REMEDIATED=()

mkdir -p "$LOG_DIR" "$CACHE_DIR"
LOGFILE="$LOG_DIR/$(date +%Y-%m-%d).log"
STATUS_FILE="$CACHE_DIR/last-status.json"

log() {
  echo "[$(date '+%H:%M:%S')] $1" | tee -a "$LOGFILE"
}

# ============================================
# Core: check_api with automatic retry
# ============================================

check_api() {
  local name="$1"
  local url="$2"
  local method="${3:-GET}"
  local data="${4:-}"
  local content_type="${5:-}"

  local curl_args=(-s -w "%{http_code}" --max-time "$TIMEOUT")

  if [ "$method" = "POST" ]; then
    curl_args+=(-X POST)
    [ -n "$data" ] && curl_args+=(-d "$data")
    [ -n "$content_type" ] && curl_args+=(-H "Content-Type: $content_type")
  fi

  local status="000"
  local body=""
  local attempt=1

  while [ "$attempt" -le "$MAX_RETRIES" ]; do
    # Capture body + status code (last 3 chars)
    local raw
    raw=$(curl "${curl_args[@]}" "$url" 2>/dev/null) || true
    status="${raw: -3}"
    body="${raw:0:${#raw}-3}"

    if [ "$status" = "200" ]; then
      break
    fi

    if [ "$attempt" -lt "$MAX_RETRIES" ]; then
      # Auto-remediation: retry with backoff
      local wait=$((RETRY_DELAY * attempt))
      log "RETRY $name (attempt $attempt/$MAX_RETRIES, status=$status, wait=${wait}s)"
      sleep "$wait"
    fi

    attempt=$((attempt + 1))
  done

  if [ "$status" = "200" ]; then
    log "OK    $name ($status)"
    RESULTS+=("$name: OK")

    # Cache successful response for fallback
    if [ -n "$body" ] && [ ${#body} -lt 500000 ]; then
      echo "$body" > "$CACHE_DIR/${name// /-}.json" 2>/dev/null || true
    fi

    if [ "$attempt" -gt 1 ]; then
      REMEDIATED+=("$name: recovered after $((attempt - 1)) retries")
    fi
  else
    log "FAIL  $name ($status after $MAX_RETRIES attempts)"
    RESULTS+=("$name: FAIL ($status)")
    FAILED+=("$name ($status)")

    # Try auto-remediation based on failure type
    remediate "$name" "$status" "$url"
  fi
}

# ============================================
# Auto-Remediation Logic
# ============================================

remediate() {
  local name="$1"
  local status="$2"
  local url="$3"

  case "$name" in
    "NASA APOD"|"NASA NEO")
      # 429 = rate limited on DEMO_KEY. Remediation: note to use real key
      if [ "$status" = "429" ]; then
        log "REMEDY $name: Rate limited on DEMO_KEY — set NEXT_PUBLIC_NASA_API_KEY in .env"
        REMEDIATED+=("$name: rate-limited (429). Need real NASA API key from https://api.nasa.gov")
      # 503 = NASA maintenance. Cached data exists.
      elif [ "$status" = "503" ] || [ "$status" = "000" ]; then
        if [ -f "$CACHE_DIR/${name// /-}.json" ]; then
          log "REMEDY $name: API down, cached response available"
          REMEDIATED+=("$name: serving cached fallback")
        fi
      fi
      ;;

    "ISS Position")
      # ISS API goes down occasionally. Check backup.
      if [ "$status" != "200" ]; then
        local backup_status
        backup_status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 \
          "http://api.open-notify.org/iss-now.json" 2>/dev/null || echo "000")
        if [ "$backup_status" = "200" ]; then
          log "REMEDY $name: Primary down, backup API (open-notify) is UP"
          REMEDIATED+=("$name: backup API available at open-notify.org")
        else
          log "REMEDY $name: Both ISS APIs are down"
        fi
      fi
      ;;

    "CASDA TAP")
      # CASDA has scheduled maintenance. Try SIA endpoint as alternative.
      if [ "$status" != "200" ]; then
        local sia_status
        sia_status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 \
          "https://casda.csiro.au/votools/sia2/query?POS=CIRCLE+180+-45+1&FORMAT=json" 2>/dev/null || echo "000")
        if [ "$sia_status" = "200" ]; then
          log "REMEDY $name: TAP down but SIA endpoint is UP"
          REMEDIATED+=("$name: SIA endpoint working as alternative")
        else
          log "REMEDY $name: Both CASDA endpoints are down (likely maintenance)"
          REMEDIATED+=("$name: likely scheduled maintenance — site uses fallback data")
        fi
      fi
      ;;

    "MAST Archive")
      # MAST sometimes has long cold-starts. A second delayed attempt often works.
      if [ "$status" = "000" ] || [ "$status" = "504" ]; then
        log "REMEDY $name: Timeout/gateway error — attempting warm-up ping"
        # Send a lightweight request to wake the service
        curl -s -o /dev/null --max-time 30 \
          -X POST "https://mast.stsci.edu/api/v0/invoke" \
          -H "Content-Type: application/x-www-form-urlencoded" \
          -d 'request={"service":"Mast.Name.Lookup","params":{"input":"M31"}}' 2>/dev/null || true
        sleep 5
        local retry_status
        retry_status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 20 \
          -X POST "https://mast.stsci.edu/api/v0/invoke" \
          -H "Content-Type: application/x-www-form-urlencoded" \
          -d 'request={"service":"Mast.Name.Lookup","params":{"input":"M31"}}' 2>/dev/null || echo "000")
        if [ "$retry_status" = "200" ]; then
          log "REMEDY $name: Warm-up successful — service recovered"
          REMEDIATED+=("$name: recovered after warm-up ping")
          # Fix the FAILED array — remove this entry
          local new_failed=()
          for f in "${FAILED[@]}"; do
            [[ "$f" != "MAST Archive"* ]] && new_failed+=("$f")
          done
          FAILED=("${new_failed[@]+"${new_failed[@]}"}")
        fi
      fi
      ;;

    "Zooniverse")
      # Zooniverse occasionally 503s during deploys. Usually recovers in minutes.
      if [ "$status" = "503" ]; then
        log "REMEDY $name: 503 likely deployment — will self-recover"
        REMEDIATED+=("$name: 503 during likely deploy — transient, no action needed")
      fi
      ;;

    *)
      # Generic: check if we have a cached response
      if [ -f "$CACHE_DIR/${name// /-}.json" ]; then
        local age
        age=$(( $(date +%s) - $(stat -c %Y "$CACHE_DIR/${name// /-}.json" 2>/dev/null || echo 0) ))
        local age_hours=$(( age / 3600 ))
        log "REMEDY $name: Cached response available (${age_hours}h old)"
        REMEDIATED+=("$name: cached fallback available (${age_hours}h old)")
      fi
      ;;
  esac
}

# ============================================
log "=== API Health Check Start ==="

# 1. ISS Tracking
check_api "ISS Position" \
  "https://api.wheretheiss.at/v1/satellites/25544"

# 2. NOAA Solar Weather
check_api "NOAA Solar" \
  "https://services.swpc.noaa.gov/json/goes/primary/xrays-7-day.json"

# 3. NASA APOD
check_api "NASA APOD" \
  "https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY"

# 4. NASA NEO
TODAY=$(date +%Y-%m-%d)
check_api "NASA NEO" \
  "https://api.nasa.gov/neo/rest/v1/feed?start_date=$TODAY&end_date=$TODAY&api_key=DEMO_KEY"

# 5. NASA Images
check_api "NASA Images" \
  "https://images-api.nasa.gov/search?q=jwst&media_type=image&page_size=1"

# 6. MAST Archive
check_api "MAST Archive" \
  "https://mast.stsci.edu/api/v0/invoke" \
  "POST" \
  'request={"service":"Mast.Name.Lookup","params":{"input":"M31"}}' \
  "application/x-www-form-urlencoded"

# 7. CASDA TAP
check_api "CASDA TAP" \
  "https://casda.csiro.au/votools/tap/sync?REQUEST=doQuery&LANG=ADQL&QUERY=SELECT+TOP+1+*+FROM+ivoa.obscore&FORMAT=json"

# 8. ALeRCE
check_api "ALeRCE" \
  "https://api.alerce.online/ztf/v1/objects/?classifier=lc_classifier&class_name=SNIa&ndet=1&page_size=1"

# 9. Zooniverse
check_api "Zooniverse" \
  "https://www.zooniverse.org/api/projects/zookeeper/galaxy-zoo"

# 10. Exoplanet Archive
check_api "Exoplanet Archive" \
  "https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=SELECT+TOP+1+pl_name+FROM+ps&format=json"

# 11. GCN Circulars
check_api "GCN Circulars" \
  "https://gcn.nasa.gov/circulars"

log "=== Check Complete: ${#FAILED[@]} failures, ${#REMEDIATED[@]} remediations, out of ${#RESULTS[@]} APIs ==="

# ============================================
# Write machine-readable status file
# ============================================

{
  echo "{"
  echo "  \"timestamp\": \"$(date -u '+%Y-%m-%dT%H:%M:%SZ')\","
  echo "  \"total\": ${#RESULTS[@]},"
  echo "  \"failed\": ${#FAILED[@]},"
  echo "  \"remediated\": ${#REMEDIATED[@]},"
  echo "  \"all_ok\": $([ ${#FAILED[@]} -eq 0 ] && echo 'true' || echo 'false')"
  echo "}"
} > "$STATUS_FILE"

# ============================================
# Alert if any un-remediated failures remain
# ============================================

if [ ${#FAILED[@]} -gt 0 ]; then
  FAIL_LIST=$(printf '  - %s\n' "${FAILED[@]}")
  REMEDY_LIST=""
  if [ ${#REMEDIATED[@]} -gt 0 ]; then
    REMEDY_LIST="
Auto-remediation actions taken:
$(printf '  - %s\n' "${REMEDIATED[@]}")"
  fi

  SUBJECT="[Cosmos] API Health Alert: ${#FAILED[@]} API(s) down"
  BODY="Cosmos Collective API Health Check detected failures:

$FAIL_LIST
$REMEDY_LIST

Full results:
$(printf '  %s\n' "${RESULTS[@]}")

Time: $(date -u '+%Y-%m-%d %H:%M UTC')
Host: $(hostname)"

  # Method 1: Log to Donnacha Brain API
  ESCAPED_BODY=$(echo "$BODY" | sed 's/\\/\\\\/g; s/"/\\"/g; s/$/\\n/' | tr -d '\n')
  curl -sk -X POST "$BRAIN_API" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer dev_key" \
    -d "{\"memory_type\":\"insight\",\"content\":\"$ESCAPED_BODY\",\"project_name\":\"cosmos-collective-v2\",\"importance\":\"high\"}" \
    2>/dev/null || log "WARN: Could not log to Brain API"

  # Method 2: Send email via Gmail MCP token (if python3 + google libs available)
  if command -v python3 &>/dev/null; then
    python3 - "$ALERT_EMAIL" "$SUBJECT" "$BODY" <<'PYEOF'
import sys, os, base64
try:
    from email.mime.text import MIMEText
    from google.oauth2.credentials import Credentials
    from googleapiclient.discovery import build

    token_path = os.path.expanduser('~/.claude/mcp-servers/gmail-server/token.json')
    if not os.path.exists(token_path):
        print("No Gmail token found, skipping email alert")
        sys.exit(0)

    creds = Credentials.from_authorized_user_file(
        token_path, ['https://www.googleapis.com/auth/gmail.send'])
    service = build('gmail', 'v1', credentials=creds)

    msg = MIMEText(sys.argv[3])
    msg['to'] = sys.argv[1]
    msg['from'] = 'macdara5000@gmail.com'
    msg['subject'] = sys.argv[2]

    raw = base64.urlsafe_b64encode(msg.as_bytes()).decode()
    service.users().messages().send(userId='me', body={'raw': raw}).execute()
    print("Alert email sent")
except Exception as e:
    print(f"Email alert failed: {e}")
PYEOF
  fi

elif [ ${#REMEDIATED[@]} -gt 0 ]; then
  # All failures were remediated — log as informational, no email
  log "INFO: All failures were auto-remediated:"
  for r in "${REMEDIATED[@]}"; do
    log "  $r"
  done

  ESCAPED_BODY="API health check: all ${#REMEDIATED[@]} issues auto-remediated at $(date -u '+%H:%M UTC')"
  curl -sk -X POST "$BRAIN_API" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer dev_key" \
    -d "{\"memory_type\":\"insight\",\"content\":\"$ESCAPED_BODY\",\"project_name\":\"cosmos-collective-v2\",\"importance\":\"low\"}" \
    2>/dev/null || true

else
  log "INFO: All 11 APIs healthy"
fi

exit 0
