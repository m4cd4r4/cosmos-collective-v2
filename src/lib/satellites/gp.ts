/**
 * CelesTrak GP (OMM JSON) records, plus the compact wire format the
 * /api/satellites route sends to the browser.
 *
 * The full ACTIVE group is ~14k records. As verbose JSON objects that is
 * several MB; as positional rows it is roughly a third of that before gzip.
 */

/** The subset of a CelesTrak GP JSON record that SGP4 needs. */
export interface GpRecord {
  OBJECT_NAME: string
  OBJECT_ID: string
  EPOCH: string
  MEAN_MOTION: number
  ECCENTRICITY: number
  INCLINATION: number
  RA_OF_ASC_NODE: number
  ARG_OF_PERICENTER: number
  MEAN_ANOMALY: number
  EPHEMERIS_TYPE: number
  CLASSIFICATION_TYPE: string
  NORAD_CAT_ID: number
  ELEMENT_SET_NO: number
  REV_AT_EPOCH: number
  BSTAR: number
  MEAN_MOTION_DOT: number
  MEAN_MOTION_DDOT: number
}

/** [name, objectId, epoch, n, e, i, raan, argp, ma, ephType, class, norad, setNo, rev, bstar, ndot, nddot] */
export type CompactGp = [
  string, string, string,
  number, number, number, number, number, number,
  number, string, number, number, number,
  number, number, number,
]

export interface SatellitePayload {
  /** ISO time the server last got this data from CelesTrak. */
  fetchedAt: string
  /** 'live' from CelesTrak, 'snapshot' when the bundled fallback was used. */
  source: 'live' | 'snapshot'
  rows: CompactGp[]
}

export function compactGp(r: GpRecord): CompactGp {
  return [
    r.OBJECT_NAME, r.OBJECT_ID, r.EPOCH,
    r.MEAN_MOTION, r.ECCENTRICITY, r.INCLINATION, r.RA_OF_ASC_NODE, r.ARG_OF_PERICENTER, r.MEAN_ANOMALY,
    r.EPHEMERIS_TYPE, r.CLASSIFICATION_TYPE, r.NORAD_CAT_ID, r.ELEMENT_SET_NO, r.REV_AT_EPOCH,
    r.BSTAR, r.MEAN_MOTION_DOT, r.MEAN_MOTION_DDOT,
  ]
}

export function expandGp(c: CompactGp): GpRecord {
  return {
    OBJECT_NAME: c[0], OBJECT_ID: c[1], EPOCH: c[2],
    MEAN_MOTION: c[3], ECCENTRICITY: c[4], INCLINATION: c[5],
    RA_OF_ASC_NODE: c[6], ARG_OF_PERICENTER: c[7], MEAN_ANOMALY: c[8],
    EPHEMERIS_TYPE: c[9], CLASSIFICATION_TYPE: c[10], NORAD_CAT_ID: c[11],
    ELEMENT_SET_NO: c[12], REV_AT_EPOCH: c[13],
    BSTAR: c[14], MEAN_MOTION_DOT: c[15], MEAN_MOTION_DDOT: c[16],
  }
}

/** A record is usable only if every numeric element is a finite number. */
export function isValidGp(r: Partial<GpRecord>): r is GpRecord {
  return (
    typeof r.OBJECT_NAME === 'string' &&
    typeof r.EPOCH === 'string' &&
    [r.MEAN_MOTION, r.ECCENTRICITY, r.INCLINATION, r.RA_OF_ASC_NODE, r.ARG_OF_PERICENTER, r.MEAN_ANOMALY, r.BSTAR, r.NORAD_CAT_ID]
      .every((v) => typeof v === 'number' && Number.isFinite(v))
  )
}
