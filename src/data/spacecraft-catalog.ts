export type SpacecraftCategory = 'space-telescope' | 'radio-telescope' | 'space-station' | 'planetary-probe'
export type SpacecraftStatus = 'active' | 'retired' | 'under-construction'

export interface SpacecraftSpec {
  label: string
  value: string
}

export interface SpacecraftEntry {
  id: string
  name: string
  shortName: string
  category: SpacecraftCategory
  status: SpacecraftStatus
  agency: string
  launchDate: string | null
  imageUrl: string
  thumbnailUrl: string
  summary: string
  specs: SpacecraftSpec[]
  highlights: string[]
  orbitType?: string
  distanceFromEarth?: string
  wavelengthRange?: string
  instruments?: string[]
  externalLinks: { label: string; url: string }[]
}

export const CATEGORY_LABELS: Record<SpacecraftCategory, string> = {
  'space-telescope': 'Space Telescopes',
  'radio-telescope': 'Radio Telescopes',
  'space-station': 'Space Stations',
  'planetary-probe': 'Planetary Probes',
}

export const STATUS_COLORS: Record<SpacecraftStatus, string> = {
  active: '#22c55e',
  retired: '#6b7280',
  'under-construction': '#f59e0b',
}

export const SPACECRAFT_CATALOG: SpacecraftEntry[] = [
  // ============================================
  // Space Telescopes
  // ============================================
  {
    id: 'jwst',
    name: 'James Webb Space Telescope',
    shortName: 'JWST',
    category: 'space-telescope',
    status: 'active',
    agency: 'NASA / ESA / CSA',
    launchDate: '2021-12-25',
    imageUrl: 'https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e002172/GSFC_20171208_Archive_e002172~medium.jpg',
    thumbnailUrl: 'https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e002172/GSFC_20171208_Archive_e002172~small.jpg',
    summary:
      'The largest and most powerful space telescope ever built. JWST observes the universe in infrared, peering through dust clouds to study the earliest galaxies, star formation, and exoplanet atmospheres. Its 6.5-meter gold-coated primary mirror is composed of 18 hexagonal beryllium segments.',
    specs: [
      { label: 'Primary Mirror', value: '6.5 m (18 hexagonal segments)' },
      { label: 'Sunshield', value: '21.2 m x 14.2 m (tennis court sized)' },
      { label: 'Mass', value: '6,161 kg' },
      { label: 'Operating Temperature', value: '-233 C (40 K)' },
      { label: 'Mission Duration', value: '20+ years (fuel budget)' },
      { label: 'Cost', value: 'US$10 billion' },
    ],
    highlights: [
      'Captured the deepest infrared image of the universe (SMACS 0723)',
      'Detected atmospheric CO2 on exoplanet WASP-39 b for the first time',
      'Revealed unexpected structure in the Pillars of Creation',
      'Orbits the Sun-Earth L2 Lagrange point, 1.5 million km from Earth',
    ],
    orbitType: 'L2 halo orbit (Sun-Earth Lagrange Point 2)',
    distanceFromEarth: '1.5 million km',
    wavelengthRange: '0.6 - 28.5 um (near-infrared to mid-infrared)',
    instruments: ['NIRCam', 'MIRI', 'NIRSpec', 'NIRISS', 'FGS'],
    externalLinks: [
      { label: 'NASA JWST Home', url: 'https://webb.nasa.gov' },
      { label: 'ESA Webb Portal', url: 'https://esawebb.org' },
      { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/James_Webb_Space_Telescope' },
    ],
  },
  {
    id: 'hubble',
    name: 'Hubble Space Telescope',
    shortName: 'Hubble',
    category: 'space-telescope',
    status: 'active',
    agency: 'NASA / ESA',
    launchDate: '1990-04-24',
    imageUrl: 'https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e000139/GSFC_20171208_Archive_e000139~medium.jpg',
    thumbnailUrl: 'https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e000139/GSFC_20171208_Archive_e000139~small.jpg',
    summary:
      'One of the most productive scientific instruments ever built. Hubble has been observing the universe in ultraviolet, visible, and near-infrared light since 1990. Serviced five times by Space Shuttle crews, it continues to produce groundbreaking science after 35+ years in orbit.',
    specs: [
      { label: 'Primary Mirror', value: '2.4 m' },
      { label: 'Orbital Altitude', value: '~547 km (LEO)' },
      { label: 'Orbital Period', value: '95 minutes' },
      { label: 'Mass', value: '11,110 kg' },
      { label: 'Length', value: '13.2 m' },
      { label: 'Servicing Missions', value: '5 (1993-2009)' },
    ],
    highlights: [
      'Determined the rate of expansion of the universe (Hubble constant)',
      'Provided evidence that supermassive black holes exist at galaxy centers',
      'Hubble Deep Field images revealed thousands of galaxies in a tiny patch of sky',
      'Over 1.5 million observations and 19,000+ peer-reviewed papers',
      'Initial spherical aberration in primary mirror corrected by SM1 in 1993',
    ],
    orbitType: 'Low Earth Orbit (LEO)',
    distanceFromEarth: '~547 km altitude',
    wavelengthRange: '0.115 - 1.7 um (UV, visible, near-infrared)',
    instruments: ['WFC3', 'ACS', 'COS', 'STIS'],
    externalLinks: [
      { label: 'NASA Hubble Home', url: 'https://hubblesite.org' },
      { label: 'ESA Hubble', url: 'https://esahubble.org' },
      { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Hubble_Space_Telescope' },
    ],
  },
  {
    id: 'chandra',
    name: 'Chandra X-ray Observatory',
    shortName: 'Chandra',
    category: 'space-telescope',
    status: 'active',
    agency: 'NASA',
    launchDate: '1999-07-23',
    imageUrl: 'https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e001327/GSFC_20171208_Archive_e001327~medium.jpg',
    thumbnailUrl: 'https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e001327/GSFC_20171208_Archive_e001327~small.jpg',
    summary:
      "NASA's flagship X-ray observatory, named after Nobel laureate Subrahmanyan Chandrasekhar. Chandra detects X-ray emissions from extremely hot regions of the universe such as exploded stars, galaxy clusters, and matter around black holes. Its angular resolution of 0.5 arcseconds is unmatched in X-ray astronomy.",
    specs: [
      { label: 'Mirror Length', value: '0.83 m (4 nested pairs)' },
      { label: 'Focal Length', value: '10 m' },
      { label: 'Angular Resolution', value: '0.5 arcseconds' },
      { label: 'Mass', value: '4,790 kg' },
      { label: 'Length', value: '13.8 m' },
      { label: 'Orbit Apogee', value: '~133,000 km' },
    ],
    highlights: [
      'First X-ray image of the shock wave around a supernova remnant (Cassiopeia A)',
      'Discovered X-ray jets extending from supermassive black holes',
      'Mapped the distribution of dark matter in galaxy cluster collisions (Bullet Cluster)',
      'Over 25 years of continuous X-ray observations',
    ],
    orbitType: 'Highly elliptical orbit (16,000 - 133,000 km)',
    distanceFromEarth: '16,000 - 133,000 km (variable)',
    wavelengthRange: '0.1 - 10 keV (X-ray)',
    instruments: ['ACIS (Advanced CCD Imaging Spectrometer)', 'HRC (High Resolution Camera)', 'HETGS', 'LETGS'],
    externalLinks: [
      { label: 'Chandra X-ray Center', url: 'https://chandra.harvard.edu' },
      { label: 'NASA Chandra', url: 'https://www.nasa.gov/mission/chandra-x-ray-observatory/' },
      { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Chandra_X-ray_Observatory' },
    ],
  },
  {
    id: 'spitzer',
    name: 'Spitzer Space Telescope',
    shortName: 'Spitzer',
    category: 'space-telescope',
    status: 'retired',
    agency: 'NASA',
    launchDate: '2003-08-25',
    imageUrl: '/images/spacecraft/spitzer.jpg',
    thumbnailUrl: '/images/spacecraft/spitzer-thumb.jpg',
    summary:
      "NASA's infrared Great Observatory, Spitzer operated for over 16 years before decommissioning on 2020-01-30. It observed the universe in infrared light, revealing cool objects invisible to optical telescopes including brown dwarfs, exoplanets, and distant dusty galaxies. Its cryogenic helium supply was exhausted in 2009 but it continued in warm mode.",
    specs: [
      { label: 'Primary Mirror', value: '0.85 m' },
      { label: 'Mass', value: '861 kg' },
      { label: 'Cryogen Lifetime', value: '5.5 years (exhausted May 2009)' },
      { label: 'Warm Mission', value: '2009-2020 (3.6 and 4.5 um channels)' },
      { label: 'Decommissioned', value: '2020-01-30' },
      { label: 'Cost', value: 'US$720 million' },
    ],
    highlights: [
      'Detected light directly from exoplanets for the first time (HD 209458 b and TrES-1)',
      'Discovered the largest known ring around Saturn (Phoebe ring)',
      'Mapped the full structure of the Milky Way including the central bar',
      'Key role in characterizing the TRAPPIST-1 seven-planet system',
    ],
    orbitType: 'Earth-trailing heliocentric orbit',
    distanceFromEarth: 'Drifted ~260 million km from Earth by end of mission',
    wavelengthRange: '3 - 180 um (infrared)',
    instruments: ['IRAC (Infrared Array Camera)', 'IRS (Infrared Spectrograph)', 'MIPS (Multiband Imaging Photometer)'],
    externalLinks: [
      { label: 'NASA Spitzer Home', url: 'https://www.spitzer.caltech.edu' },
      { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Spitzer_Space_Telescope' },
    ],
  },
  {
    id: 'kepler',
    name: 'Kepler Space Telescope',
    shortName: 'Kepler/K2',
    category: 'space-telescope',
    status: 'retired',
    agency: 'NASA',
    launchDate: '2009-03-07',
    imageUrl: '/images/spacecraft/kepler.jpg',
    thumbnailUrl: '/images/spacecraft/kepler-thumb.jpg',
    summary:
      'Kepler revolutionized exoplanet science by discovering thousands of planets beyond our solar system using the transit method. After two reaction wheels failed in 2013, the mission was reinvented as K2, using solar radiation pressure for stabilization. Decommissioned on 2018-10-30 after running out of fuel.',
    specs: [
      { label: 'Primary Mirror', value: '1.4 m (Schmidt corrector)' },
      { label: 'Field of View', value: '115 square degrees' },
      { label: 'CCD Array', value: '95 megapixels (42 CCDs)' },
      { label: 'Photometric Precision', value: '~20 ppm over 6.5 hours' },
      { label: 'Decommissioned', value: '2018-10-30' },
      { label: 'Cost', value: 'US$600 million' },
    ],
    highlights: [
      'Discovered 2,662 confirmed exoplanets (plus thousands of candidates)',
      'Revealed that small planets are far more common than gas giants',
      'Found the first Earth-sized planet in a habitable zone (Kepler-186f)',
      'K2 extended mission observed 500,000+ stars across the ecliptic',
      'Showed that roughly 20% of Sun-like stars host Earth-sized habitable zone planets',
    ],
    orbitType: 'Earth-trailing heliocentric orbit',
    distanceFromEarth: 'Drifted ~150 million km from Earth by end of mission',
    wavelengthRange: '420 - 900 nm (visible light photometry)',
    instruments: ['Photometer (single instrument - 42 CCD array)'],
    externalLinks: [
      { label: 'NASA Kepler/K2', url: 'https://www.nasa.gov/mission/kepler/' },
      { label: 'NASA Exoplanet Archive', url: 'https://exoplanetarchive.ipac.caltech.edu' },
      { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Kepler_space_telescope' },
    ],
  },
  {
    id: 'tess',
    name: 'Transiting Exoplanet Survey Satellite',
    shortName: 'TESS',
    category: 'space-telescope',
    status: 'active',
    agency: 'NASA',
    launchDate: '2018-04-18',
    imageUrl: '/images/spacecraft/tess.jpg',
    thumbnailUrl: '/images/spacecraft/tess-thumb.jpg',
    summary:
      "TESS is surveying the entire sky for exoplanets orbiting bright, nearby stars using the transit photometry method. Unlike Kepler's deep stare at one field, TESS scans 85% of the sky with four wide-field cameras. It targets stars 30-100 times brighter than Kepler's, making follow-up spectroscopy far easier.",
    specs: [
      { label: 'Cameras', value: '4 wide-field CCD cameras' },
      { label: 'Field of View', value: '24 x 96 degrees (per sector)' },
      { label: 'Sky Coverage', value: '~85% of the sky' },
      { label: 'Orbital Period', value: '13.7 days (lunar resonance P/2)' },
      { label: 'Mass', value: '362 kg' },
      { label: 'CCD Pixels', value: '16.8 megapixels per camera' },
    ],
    highlights: [
      'Discovered over 400 confirmed exoplanets with thousands of candidates',
      'Found the first Earth-sized planet in a habitable zone (TOI-700 d)',
      'Detected the first planet orbiting two stars via TESS data (TOI-1338 b)',
      'Monitors ~200,000 brightest stars with 2-minute cadence',
    ],
    orbitType: 'Lunar resonance orbit (P/2, 13.7-day period)',
    distanceFromEarth: '108,000 - 376,000 km (variable)',
    wavelengthRange: '600 - 1000 nm (red-optical to near-infrared)',
    instruments: ['4 x Wide-Field Cameras (MIT Lincoln Laboratory CCDs)'],
    externalLinks: [
      { label: 'NASA TESS', url: 'https://tess.mit.edu' },
      { label: 'TESS at MAST', url: 'https://archive.stsci.edu/tess/' },
      { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Transiting_Exoplanet_Survey_Satellite' },
    ],
  },

  // ============================================
  // Radio Telescopes (Australian)
  // ============================================
  {
    id: 'askap',
    name: 'Australian Square Kilometre Array Pathfinder',
    shortName: 'ASKAP',
    category: 'radio-telescope',
    status: 'active',
    agency: 'CSIRO',
    launchDate: null,
    imageUrl: '/images/spacecraft/askap.jpg',
    thumbnailUrl: '/images/spacecraft/askap-thumb.jpg',
    summary:
      'ASKAP is a next-generation radio interferometer at the Murchison Radio-astronomy Observatory in Western Australia. Its 36 identical 12-metre dishes use innovative phased array feed (PAF) receivers that give each antenna a 30 square degree field of view, enabling rapid wide-field surveys of the radio sky.',
    specs: [
      { label: 'Dishes', value: '36 x 12 m antennas' },
      { label: 'Frequency Range', value: '700 MHz - 1.8 GHz' },
      { label: 'Field of View', value: '30 sq deg (per beam)' },
      { label: 'Max Baseline', value: '6 km' },
      { label: 'Location', value: 'Murchison, Western Australia' },
      { label: 'Receiver Type', value: 'Phased Array Feed (PAF)' },
    ],
    highlights: [
      'Produced the Rapid ASKAP Continuum Survey (RACS) covering the entire southern sky',
      'Key pathfinder for SKA technology including phased array feeds',
      'WALLABY survey mapping neutral hydrogen in hundreds of thousands of galaxies',
      'EMU survey aims to catalogue ~70 million radio sources',
    ],
    wavelengthRange: '70 cm - 3 cm (700 MHz - 1.8 GHz)',
    instruments: ['Phased Array Feed receivers (188 elements per antenna)'],
    externalLinks: [
      { label: 'CSIRO ASKAP', url: 'https://www.csiro.au/en/about/facilities-collections/atnf/askap-radio-telescope' },
      { label: 'CASDA Data Archive', url: 'https://research.csiro.au/casda/' },
      { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Australian_Square_Kilometre_Array_Pathfinder' },
    ],
  },
  {
    id: 'mwa',
    name: 'Murchison Widefield Array',
    shortName: 'MWA',
    category: 'radio-telescope',
    status: 'active',
    agency: 'International Consortium (Curtin University lead)',
    launchDate: null,
    imageUrl: '/images/spacecraft/mwa.jpg',
    thumbnailUrl: '/images/spacecraft/mwa-thumb.jpg',
    summary:
      'The MWA is a low-frequency radio telescope and SKA-Low precursor located at the Murchison Radio-astronomy Observatory. It uses 4,096 dual-polarization dipole antenna tiles spread across several km to observe the sky between 80-300 MHz. Key science goals include detecting the Epoch of Reionization, surveying the radio sky, and monitoring solar and space weather.',
    specs: [
      { label: 'Antenna Elements', value: '4,096 dipole tiles' },
      { label: 'Frequency Range', value: '80 - 300 MHz' },
      { label: 'Field of View', value: '~600 sq deg at 150 MHz' },
      { label: 'Angular Resolution', value: '~2 arcminutes at 150 MHz' },
      { label: 'Max Baseline', value: '~5.3 km (extended config)' },
      { label: 'Location', value: 'Murchison, Western Australia' },
    ],
    highlights: [
      'Precursor and pathfinder for the SKA-Low telescope',
      'GLEAM survey produced the widefield low-frequency sky catalogue',
      'Searching for the 21 cm signal from the Epoch of Reionization',
      'Real-time monitoring of solar activity and space weather',
    ],
    wavelengthRange: '3.5 m - 80 cm (80 - 300 MHz)',
    instruments: ['4,096 dual-polarization dipole antenna tiles', '128-tile correlator (extended to 256)'],
    externalLinks: [
      { label: 'MWA Telescope', url: 'https://www.mwatelescope.org' },
      { label: 'GLEAM Survey', url: 'https://www.mwatelescope.org/science/gleam' },
      { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Murchison_Widefield_Array' },
    ],
  },
  {
    id: 'parkes',
    name: 'Parkes Radio Telescope (Murriyang)',
    shortName: 'Parkes',
    category: 'radio-telescope',
    status: 'active',
    agency: 'CSIRO',
    launchDate: null,
    imageUrl: '/images/spacecraft/parkes.jpg',
    thumbnailUrl: '/images/spacecraft/parkes-thumb.jpg',
    summary:
      'One of the most iconic radio telescopes in the world, Murriyang (its Wiradjuri name) has been operating since 1961. Its 64-metre dish famously received the Apollo 11 moonwalk TV broadcast. It remains a world-leading instrument for pulsar timing, fast radio burst detection, and spectral line surveys thanks to its new ultra-wideband receiver.',
    specs: [
      { label: 'Dish Diameter', value: '64 m' },
      { label: 'Frequency Range', value: '0.7 - 4 GHz (UWL receiver)' },
      { label: 'Legacy Frequency Range', value: '0.5 - 24 GHz (all receivers)' },
      { label: 'Surface Accuracy', value: '~2 mm RMS' },
      { label: 'Location', value: 'Parkes, New South Wales' },
      { label: 'Commissioned', value: '1961' },
    ],
    highlights: [
      'Received the TV broadcast of the Apollo 11 moonwalk (1969)',
      'Discovered more than half of all known pulsars',
      'Detected the first fast radio burst (FRB 010724, the Lorimer Burst)',
      'Ultra-Wideband Low (UWL) receiver installed 2018 covers 0.7-4 GHz in one band',
      'Given the Wiradjuri name Murriyang in 2020',
    ],
    wavelengthRange: '60 cm - 1.3 cm (0.5 - 24 GHz)',
    instruments: ['Ultra-Wideband Low (UWL) receiver', 'Multibeam receiver (legacy)', '10/50 cm receiver (legacy)'],
    externalLinks: [
      { label: 'CSIRO Parkes', url: 'https://www.csiro.au/en/about/facilities-collections/atnf/parkes-radio-telescope' },
      { label: 'Parkes Pulsar Catalogue', url: 'https://www.atnf.csiro.au/research/pulsar/psrcat/' },
      { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Parkes_Observatory' },
    ],
  },
  {
    id: 'atca',
    name: 'Australia Telescope Compact Array',
    shortName: 'ATCA',
    category: 'radio-telescope',
    status: 'active',
    agency: 'CSIRO',
    launchDate: null,
    imageUrl: '/images/spacecraft/atca.jpg',
    thumbnailUrl: '/images/spacecraft/atca-thumb.jpg',
    summary:
      'ATCA is a radio interferometer near Narrabri in New South Wales, consisting of six 22-metre dishes on a 6 km east-west baseline plus a north-south spur. Five dishes move along a rail track to vary the array configuration. It operates from centimetre to millimetre wavelengths and is the most versatile radio interferometer in the southern hemisphere.',
    specs: [
      { label: 'Dishes', value: '6 x 22 m antennas' },
      { label: 'Frequency Range', value: '1.1 - 105 GHz' },
      { label: 'Max Baseline', value: '6 km' },
      { label: 'Movable Antennas', value: '5 on rail track (1 fixed)' },
      { label: 'Location', value: 'Narrabri, New South Wales' },
      { label: 'Commissioned', value: '1988' },
    ],
    highlights: [
      'Millimetre-wave capability unique among southern hemisphere interferometers',
      'Key facility for transient follow-up including gravitational wave counterparts',
      'Monitored SN 1987A in the Large Magellanic Cloud for decades',
      'Supports VLBI observations as part of the Australian Long Baseline Array',
    ],
    wavelengthRange: '25 cm - 3 mm (1.1 - 105 GHz)',
    instruments: ['CABB (Compact Array Broadband Backend)', '16 cm / 4 cm / 15 mm / 7 mm / 3 mm receivers'],
    externalLinks: [
      { label: 'CSIRO ATCA', url: 'https://www.narrabri.atnf.csiro.au' },
      { label: 'ATCA Users Guide', url: 'https://www.narrabri.atnf.csiro.au/observing/users_guide/html/atug.html' },
      { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Australia_Telescope_Compact_Array' },
    ],
  },
  {
    id: 'ska',
    name: 'Square Kilometre Array',
    shortName: 'SKA',
    category: 'radio-telescope',
    status: 'under-construction',
    agency: 'SKAO (International)',
    launchDate: null,
    imageUrl: '/images/spacecraft/ska.jpg',
    thumbnailUrl: '/images/spacecraft/ska-thumb.jpg',
    summary:
      "The SKA will be the world's largest and most sensitive radio telescope, split across two sites: SKA-Low (low-frequency dipole antennas) in Western Australia and SKA-Mid (dish antennas) in South Africa. Construction began in 2022, with first science expected around 2027. It will address fundamental questions about dark energy, gravitational waves, cosmic magnetism, and the origins of life.",
    specs: [
      { label: 'SKA-Low Antennas', value: '131,072 dipole antennas (512 stations)' },
      { label: 'SKA-Mid Dishes', value: '197 dishes (including 64 MeerKAT)' },
      { label: 'SKA-Low Frequency', value: '50 - 350 MHz' },
      { label: 'SKA-Mid Frequency', value: '350 MHz - 15.4 GHz' },
      { label: 'Total Collecting Area', value: '~1 sq km (combined)' },
      { label: 'Expected First Light', value: '~2027' },
    ],
    highlights: [
      'Will be 50x more sensitive than any existing radio telescope',
      'Construction began December 2022 at both sites simultaneously',
      'SKA-Low site at Murchison overlaps with ASKAP and MWA locations',
      'Will generate ~710 PB of data per year at full capacity',
      'Managed by the SKA Observatory (SKAO), an intergovernmental organization',
    ],
    wavelengthRange: '4 m - 1.5 cm (50 MHz - 20 GHz, combined)',
    instruments: ['SKA-Low dipole antenna stations', 'SKA-Mid dish receivers', 'Central Signal Processor', 'Science Data Processor'],
    externalLinks: [
      { label: 'SKAO', url: 'https://www.skao.int' },
      { label: 'SKA-Low Australia', url: 'https://www.csiro.au/en/about/facilities-collections/atnf/ska' },
      { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Square_Kilometre_Array' },
    ],
  },

  // ============================================
  // Space Stations
  // ============================================
  {
    id: 'iss',
    name: 'International Space Station',
    shortName: 'ISS',
    category: 'space-station',
    status: 'active',
    agency: 'NASA / Roscosmos / ESA / JAXA / CSA',
    launchDate: '1998-11-20',
    imageUrl: 'https://images-assets.nasa.gov/image/iss064e048983/iss064e048983~medium.jpg',
    thumbnailUrl: 'https://images-assets.nasa.gov/image/iss064e048983/iss064e048983~small.jpg',
    summary:
      'The largest modular space station in low Earth orbit, continuously occupied since November 2000. A joint project among five space agencies, it serves as a microgravity laboratory for research in biology, physics, astronomy, and technology. Over 270 people from 21 countries have visited the station.',
    specs: [
      { label: 'Pressurized Volume', value: '916 m3' },
      { label: 'Truss Span', value: '~109 m' },
      { label: 'Mass', value: '~420,000 kg' },
      { label: 'Orbital Altitude', value: '~408 km (LEO)' },
      { label: 'Orbital Speed', value: '7.66 km/s (~27,600 km/h)' },
      { label: 'Orbital Period', value: '~92 minutes' },
    ],
    highlights: [
      'Longest continuous human presence in space (since Nov 2, 2000)',
      'Over 3,000 scientific experiments conducted across disciplines',
      'Visible to the naked eye as the third-brightest object in the night sky',
      'Assembly required more than 40 missions and 160+ spacewalks',
      "Planned deorbit via NASA's US Deorbit Vehicle around 2030",
    ],
    orbitType: 'Low Earth Orbit (LEO)',
    distanceFromEarth: '~408 km altitude',
    externalLinks: [
      { label: 'NASA ISS', url: 'https://www.nasa.gov/international-space-station/' },
      { label: 'Spot the Station', url: 'https://spotthestation.nasa.gov' },
      { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/International_Space_Station' },
    ],
  },

  // ============================================
  // Planetary Probes
  // ============================================
  {
    id: 'voyager-1',
    name: 'Voyager 1',
    shortName: 'Voyager 1',
    category: 'planetary-probe',
    status: 'active',
    agency: 'NASA / JPL',
    launchDate: '1977-09-05',
    imageUrl: 'https://images-assets.nasa.gov/image/PIA21474/PIA21474~medium.jpg',
    thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA21474/PIA21474~small.jpg',
    summary:
      'The most distant human-made object in existence. Voyager 1 flew past Jupiter (1979) and Saturn (1980) before heading toward interstellar space, which it entered in August 2012. Still transmitting data back to Earth via its 23-watt radio, it carries a Golden Record with sounds and images of life on Earth.',
    specs: [
      { label: 'Mass', value: '825.5 kg' },
      { label: 'Power Source', value: 'RTG (3 x MHW-RTG, plutonium-238)' },
      { label: 'Current Power', value: '~220 watts (declining ~4 W/year)' },
      { label: 'Radio Dish', value: '3.7 m high-gain antenna' },
      { label: 'Signal Travel Time', value: '~22.5 hours one-way' },
      { label: 'Speed', value: '~17 km/s (relative to Sun)' },
    ],
    highlights: [
      'Most distant human-made object - over 24 billion km from Earth',
      'Crossed into interstellar space on August 25, 2012',
      'Took the famous Pale Blue Dot photo of Earth from 6 billion km',
      "Discovered volcanic activity on Jupiter's moon Io",
      'Carries the Voyager Golden Record for potential extraterrestrial contact',
    ],
    orbitType: 'Interstellar trajectory (heliocentric escape)',
    distanceFromEarth: '~24.5 billion km (163+ AU)',
    instruments: ['Plasma Science (PLS)', 'Low-Energy Charged Particles (LECP)', 'Cosmic Ray Subsystem (CRS)', 'Magnetometer (MAG)'],
    externalLinks: [
      { label: 'NASA Voyager', url: 'https://voyager.jpl.nasa.gov' },
      { label: 'Voyager Mission Status', url: 'https://voyager.jpl.nasa.gov/mission/status/' },
      { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Voyager_1' },
    ],
  },
  {
    id: 'voyager-2',
    name: 'Voyager 2',
    shortName: 'Voyager 2',
    category: 'planetary-probe',
    status: 'active',
    agency: 'NASA / JPL',
    launchDate: '1977-08-20',
    imageUrl: 'https://images-assets.nasa.gov/image/PIA21474/PIA21474~medium.jpg',
    thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA21474/PIA21474~small.jpg',
    summary:
      'The only spacecraft to have visited all four giant planets - Jupiter, Saturn, Uranus, and Neptune. Launched 16 days before Voyager 1, it took a slower trajectory that enabled the Grand Tour flybys. Voyager 2 crossed into interstellar space on November 5, 2018, and continues to return science data.',
    specs: [
      { label: 'Mass', value: '825.5 kg' },
      { label: 'Power Source', value: 'RTG (3 x MHW-RTG, plutonium-238)' },
      { label: 'Current Power', value: '~215 watts (declining ~4 W/year)' },
      { label: 'Radio Dish', value: '3.7 m high-gain antenna' },
      { label: 'Signal Travel Time', value: '~19 hours one-way' },
      { label: 'Speed', value: '~15.3 km/s (relative to Sun)' },
    ],
    highlights: [
      'Only spacecraft to visit Uranus (1986) and Neptune (1989)',
      'Discovered 16 moons across the four giant planets',
      'Crossed into interstellar space on November 5, 2018',
      "Revealed Neptune's Great Dark Spot and active weather",
      "Found geysers on Neptune's moon Triton",
    ],
    orbitType: 'Interstellar trajectory (heliocentric escape)',
    distanceFromEarth: '~20.5 billion km (137+ AU)',
    instruments: ['Plasma Science (PLS)', 'Low-Energy Charged Particles (LECP)', 'Cosmic Ray Subsystem (CRS)', 'Magnetometer (MAG)', 'Plasma Wave Subsystem (PWS)'],
    externalLinks: [
      { label: 'NASA Voyager', url: 'https://voyager.jpl.nasa.gov' },
      { label: 'Voyager Mission Status', url: 'https://voyager.jpl.nasa.gov/mission/status/' },
      { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Voyager_2' },
    ],
  },
  {
    id: 'perseverance',
    name: 'Perseverance Rover',
    shortName: 'Perseverance',
    category: 'planetary-probe',
    status: 'active',
    agency: 'NASA / JPL',
    launchDate: '2020-07-30',
    imageUrl: 'https://images-assets.nasa.gov/image/PIA23764/PIA23764~medium.jpg',
    thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA23764/PIA23764~small.jpg',
    summary:
      "NASA's Mars 2020 rover, exploring Jezero Crater - a 45 km wide ancient lake bed. Perseverance is searching for signs of ancient microbial life, characterizing Mars' geology and climate, and collecting rock/soil samples for future return to Earth. It carried the Ingenuity helicopter, which demonstrated powered flight on another planet.",
    specs: [
      { label: 'Mass', value: '1,025 kg' },
      { label: 'Dimensions', value: '3 m long, 2.7 m wide, 2.2 m tall' },
      { label: 'Power Source', value: 'MMRTG (plutonium-238, ~110 W)' },
      { label: 'Landing Date', value: '2021-02-18 (Jezero Crater)' },
      { label: 'Top Speed', value: '152 m/hr (0.15 km/h)' },
      { label: 'Sample Tubes', value: '43 titanium tubes (for Mars Sample Return)' },
    ],
    highlights: [
      'Deployed Ingenuity - first powered flight on another planet (April 19, 2021)',
      'Collected and cached rock core samples for future Mars Sample Return mission',
      'MOXIE experiment produced oxygen from Martian CO2 atmosphere',
      'Mastcam-Z provides 3D panoramic and telephoto imaging',
      'SuperCam laser can analyze rock composition from 7 meters away',
    ],
    orbitType: 'Mars surface (Jezero Crater, 18.4N 77.5E)',
    distanceFromEarth: '~225 million km (average Mars-Earth distance)',
    instruments: ['Mastcam-Z', 'SuperCam', 'PIXL', 'SHERLOC', 'MOXIE', 'MEDA', 'RIMFAX'],
    externalLinks: [
      { label: 'NASA Mars 2020', url: 'https://mars.nasa.gov/mars2020/' },
      { label: 'Mars Raw Images', url: 'https://mars.nasa.gov/mars2020/multimedia/raw-images/' },
      { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Perseverance_(rover)' },
    ],
  },
  {
    id: 'curiosity',
    name: 'Curiosity Rover',
    shortName: 'Curiosity',
    category: 'planetary-probe',
    status: 'active',
    agency: 'NASA / JPL',
    launchDate: '2011-11-26',
    imageUrl: 'https://images-assets.nasa.gov/image/PIA16239/PIA16239~medium.jpg',
    thumbnailUrl: 'https://images-assets.nasa.gov/image/PIA16239/PIA16239~small.jpg',
    summary:
      "NASA's Mars Science Laboratory rover, exploring Gale Crater since landing on August 6, 2012. Curiosity's primary mission was to determine if Mars ever had conditions suitable for microbial life - a question it answered affirmatively within its first year. It has been climbing Mount Sharp (Aeolis Mons) since 2014, reading billions of years of Martian geological history in its layered sediments.",
    specs: [
      { label: 'Mass', value: '899 kg' },
      { label: 'Dimensions', value: '3 m long, 2.7 m wide, 2.1 m tall' },
      { label: 'Power Source', value: 'MMRTG (plutonium-238, ~110 W at launch)' },
      { label: 'Landing Date', value: '2012-08-06 (Gale Crater)' },
      { label: 'Distance Driven', value: '32+ km (as of 2024)' },
      { label: 'Operating Time', value: '12+ years on Mars' },
    ],
    highlights: [
      'Found evidence that Gale Crater once had a habitable freshwater lake',
      'Detected seasonal methane fluctuations in the Martian atmosphere',
      'Discovered organic molecules in 3-billion-year-old mudstone',
      'Pioneered the sky-crane landing system reused by Perseverance',
      'Climbed over 800 meters up Mount Sharp reading geological history',
    ],
    orbitType: 'Mars surface (Gale Crater, 4.6S 137.4E)',
    distanceFromEarth: '~225 million km (average Mars-Earth distance)',
    instruments: ['Mastcam', 'ChemCam', 'SAM (Sample Analysis at Mars)', 'CheMin', 'REMS', 'RAD', 'DAN', 'MAHLI', 'APXS'],
    externalLinks: [
      { label: 'NASA Curiosity', url: 'https://mars.nasa.gov/msl/' },
      { label: 'Curiosity Raw Images', url: 'https://mars.nasa.gov/msl/multimedia/raw-images/' },
      { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Curiosity_(rover)' },
    ],
  },
]
