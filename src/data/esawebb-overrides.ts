/**
 * Real ESA/Webb images for /explore tiles whose original image showed a different object
 * (see docs/explore/image-audit.json). ESA/Webb images are CC BY 4.0, so the credit is shown
 * with each one. Illustrations are marked as such in the credit.
 */
export interface EsaWebbOverride {
  /** ESA/Webb image id, e.g. weic2403d */
  esaId: string
  credit: string
}

/**
 * Tiles hidden from /explore: the original image showed a different object and no genuine image
 * of the target was found (docs/explore/image-audit.json). Remove an id once a real image is added.
 */
export const HIDDEN_TILE_IDS: ReadonlySet<string> = new Set([
  'jwst-ngc3603', 'jwst-m81-bodes', 'jwst-m33-triangulum', 'jwst-ngc253-sculptor',
  'jwst-ngc4631-whale', 'jwst-ngc891', 'jwst-ngc4826-blackeye', 'jwst-ngc6946-fireworks',
  'jwst-ngc2903', 'jwst-ic342', 'jwst-glass-field', 'jwst-io', 'jwst-ganymede',
  'hubble-whirlpool-galaxy', 'hubble-antennae-galaxies', 'hubble-bubble-nebula',
])

/** Hubble tiles whose original image showed a different object: real NASA Hubble image + credit. */
export const HUBBLE_IMAGE_OVERRIDES: Record<string, { url: string; credit: string }> = {
  'hubble-westerlund-2': {
    url: 'https://cdn.esawebb.org/archives/images/large/potm2512b.jpg',
    credit: 'NASA, ESA, the Hubble Heritage Team (STScI/AURA), A. Nota (ESA/STScI), and the Westerlund 2 Science Team',
  },
  'hubble-lagoon-nebula': {
    url: 'https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e001955/GSFC_20171208_Archive_e001955~medium.jpg',
    credit: 'NASA, ESA, and the Hubble Space Telescope team',
  },
}

export const ESAWEBB_IMAGE_BASE ='https://cdn.esawebb.org/archives/images'

export const ESAWEBB_OVERRIDES: Record<string, EsaWebbOverride> = {
  'jwst-phantom-galaxy': { esaId: 'weic2403c', credit: 'NASA, ESA, CSA, STScI, J. Lee (STScI), T. Williams (Oxford), PHANGS Team' },
  'jwst-ic5332': { esaId: 'weic2403b', credit: 'NASA, ESA, CSA, STScI, J. Lee (STScI), T. Williams (Oxford), PHANGS Team' },
  'jwst-ngc1087': { esaId: 'weic2403d', credit: 'NASA, ESA, CSA, STScI, J. Lee (STScI), T. Williams (Oxford), PHANGS Team' },
  'jwst-ngc1300': { esaId: 'weic2403e', credit: 'NASA, ESA, CSA, STScI, J. Lee (STScI), T. Williams (Oxford), PHANGS Team' },
  'jwst-ngc1365': { esaId: 'weic2403f', credit: 'NASA, ESA, CSA, STScI, J. Lee (STScI), T. Williams (Oxford), PHANGS Team' },
  'jwst-ngc1385': { esaId: 'weic2403g', credit: 'NASA, ESA, CSA, STScI, J. Lee (STScI), T. Williams (Oxford), PHANGS Team' },
  'jwst-ngc1433': { esaId: 'weic2403h', credit: 'NASA, ESA, CSA, STScI, J. Lee (STScI), T. Williams (Oxford), PHANGS Team' },
  'jwst-ngc1512': { esaId: 'weic2403i', credit: 'NASA, ESA, CSA, STScI, J. Lee (STScI), T. Williams (Oxford), PHANGS Team' },
  'jwst-ngc1566': { esaId: 'weic2403j', credit: 'NASA, ESA, CSA, STScI, J. Lee (STScI), T. Williams (Oxford), PHANGS Team' },
  'jwst-ngc1672': { esaId: 'weic2403k', credit: 'NASA, ESA, CSA, STScI, J. Lee (STScI), T. Williams (Oxford), PHANGS Team' },
  'jwst-ngc2835': { esaId: 'weic2403l', credit: 'NASA, ESA, CSA, STScI, J. Lee (STScI), T. Williams (Oxford), PHANGS Team' },
  'jwst-ngc3351': { esaId: 'weic2403m', credit: 'NASA, ESA, CSA, STScI, J. Lee (STScI), T. Williams (Oxford), PHANGS Team' },
  'jwst-ngc3627': { esaId: 'weic2403n', credit: 'NASA, ESA, CSA, STScI, J. Lee (STScI), T. Williams (Oxford), PHANGS Team' },
  'jwst-ngc4254': { esaId: 'weic2403o', credit: 'NASA, ESA, CSA, STScI, J. Lee (STScI), T. Williams (Oxford), PHANGS Team' },
  'jwst-ngc4303': { esaId: 'weic2403p', credit: 'NASA, ESA, CSA, STScI, J. Lee (STScI), T. Williams (Oxford), PHANGS Team' },
  'jwst-ngc4321': { esaId: 'weic2403q', credit: 'NASA, ESA, CSA, STScI, J. Lee (STScI), T. Williams (Oxford), PHANGS Team' },
  'jwst-ngc4535': { esaId: 'weic2403r', credit: 'NASA, ESA, CSA, STScI, J. Lee (STScI), T. Williams (Oxford), PHANGS Team' },
  'jwst-ngc5068': { esaId: 'weic2403s', credit: 'NASA, ESA, CSA, STScI, J. Lee (STScI), T. Williams (Oxford), PHANGS Team' },
  'jwst-ngc7496': { esaId: 'weic2403t', credit: 'NASA, ESA, CSA, STScI, J. Lee (STScI), T. Williams (Oxford), PHANGS Team' },
  'jwst-butterfly-nebula': { esaId: 'weic2517b', credit: 'NASA, ESA, CSA, STScI' },
  'jwst-ngc346': { esaId: 'weic2301a', credit: 'NASA, ESA, CSA, STScI, A. Pagan (STScI)' },
  'jwst-wr140': { esaId: 'weic2501d', credit: 'NASA, ESA, CSA, STScI' },
  'jwst-hh46-47': { esaId: 'weic2319a', credit: 'NASA, ESA, CSA, J. DePasquale (STScI)' },
  'jwst-ngc604': { esaId: 'weic2407a', credit: 'NASA, ESA, CSA, STScI' },
  'jwst-pandoras-cluster': { esaId: 'weic2305a', credit: 'NASA, ESA, CSA, STScI' },
  'jwst-europa': { esaId: 'weic2323a', credit: 'NASA, ESA, CSA, STScI' },
  'jwst-titan': { esaId: 'titan2', credit: 'NASA, ESA, CSA, A. Pagan (STScI), JWST Titan GTO Team' },
  'jwst-enceladus': { esaId: 'weic2314a', credit: 'NASA, ESA, CSA, STScI' },
  'jwst-comet-238p': { esaId: 'weic2313b', credit: 'NASA, ESA, CSA, STScI' },
  'jwst-wasp39b': { esaId: 'weic2213a', credit: 'NASA, ESA, CSA, and J. Olmsted (STScI) (illustration)' },
  'jwst-vhs1256b': { esaId: 'weic2308a', credit: 'NASA, ESA, CSA, J. Olmsted (STScI) (illustration)' },
  'jwst-lhs475b': { esaId: 'weic2302b', credit: 'NASA, ESA, CSA, L. Hustak (STScI) (illustration)' },
  'jwst-southern-ring': { esaId: 'weic2207b', credit: 'NASA, ESA, CSA, STScI, and the Webb ERO Production Team' },
  'jwst-stephans-quintet': { esaId: 'weic2208a', credit: 'NASA, ESA, CSA, and STScI' },
  'jwst-l1527': { esaId: 'weic2219a', credit: 'NASA, ESA, CSA, and STScI, J. DePasquale (STScI)' },
  'jwst-fomalhaut': { esaId: 'weic2312a', credit: 'NASA, ESA, CSA, A. Pagan (STScI), A. Gáspár (University of Arizona)' },
  'jwst-didymos': { esaId: 'weic2215c', credit: 'NASA, ESA, CSA, and STScI' },
  'jwst-cosmos-web': { esaId: 'weic2603c', credit: 'NASA, ESA, CSA, STScI, R. Naidu (MIT), Image Processing: J. DePasquale (STScI)' },
  'jwst-m51-whirlpool': { esaId: 'potm2308b', credit: 'ESA/Webb, NASA & CSA, A. Adamo (Stockholm University) and the FEAST JWST team' },
  'jwst-ngc1559': { esaId: 'potm2402a', credit: 'ESA/Webb, NASA & CSA, A. Leroy, J. Lee and the PHANGS Team' },
  'jwst-arp220': { esaId: 'arp220a', credit: 'NASA, ESA, CSA, K. Pontoppidan (STScI), A. Pagan (STScI)' },
  'jwst-ngc7469': { esaId: 'potm2212a', credit: 'ESA/Webb, NASA & CSA, L. Armus, A. S. Evans' },
  'jwst-ngc1068': { esaId: 'potm2604b', credit: 'ESA/Webb, NASA & CSA, A. Leroy' },
  'jwst-hip65426b': { esaId: 'HIP-65426b', credit: 'NASA/ESA/CSA, A Carter (UCSC), the ERS 1386 team, and A. Pagan (STScI)' },
  'jwst-wr124': { esaId: 'weic2307d', credit: 'NASA, ESA, CSA, STScI, Webb ERO Production Team' },
}
