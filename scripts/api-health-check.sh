#!/bin/bash
# ============================================
# Cosmos Collective — External API Health Check
# Deploy to Donnacha VPS as a cron job:
#   0 6,18 * * * /opt/cosmos-health/api-health-check.sh
# ============================================

set -euo pipefail

ALERT_EMAIL="${ALERT_EMAIL:-macdara5000@gmail.com}"
LOG_DIR="${LOG_DIR:-/var/log/cosmos-health}"
BRAIN_API="https://45.77.233.102/api/brain/memories"
TIMEOUT=15
FAILED=()
RESULTS=()

mkdir -p "$LOG_DIR"
LOGFILE="$LOG_DIR/$(date +%Y-%m-%d).log"

log() {
  echo "[$(date '+%H:%M:%S')] $1" | tee -a "$LOGFILE"
}

check_api() {
  local name="$1"
  local url="$2"
  local method="${3:-GET}"
  local data="${4:-}"
  local content_type="${5:-}"

  local curl_args=(-s -o /dev/null -w "%{http_code}" --max-time "$TIMEOUT")

  if [ "$method" = "POST" ]; then
    curl_args+=(-X POST)
    if [ -n "$data" ]; then
      curl_args+=(-d "$data")
    fi
    if [ -n "$content_type" ]; then
      curl_args+=(-H "Content-Type: $content_type")
    fi
  fi

  local status
  status=$(curl "${curl_args[@]}" "$url" 2>/dev/null || echo "000")

  if [ "$status" = "200" ]; then
    log "OK    $name ($status)"
    RESULTS+=("$name: OK")
  else
    log "FAIL  $name ($status)"
    RESULTS+=("$name: FAIL ($status)")
    FAILED+=("$name ($status)")
  fi
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

log "=== Check Complete: ${#FAILED[@]} failures out of ${#RESULTS[@]} APIs ==="

# ============================================
# Alert if any failures
# ============================================

if [ ${#FAILED[@]} -gt 0 ]; then
  FAIL_LIST=$(printf '  - %s\n' "${FAILED[@]}")
  SUBJECT="[Cosmos] API Health Alert: ${#FAILED[@]} API(s) down"
  BODY="Cosmos Collective API Health Check detected failures:

$FAIL_LIST

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
fi

exit 0
