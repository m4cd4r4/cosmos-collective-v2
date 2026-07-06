/**
 * Curated NASA imagery used as card/hero backgrounds.
 * Extracted from the retired HeroSection component.
 */

export const PLANET_HERO_IMAGES = {
  mars: {
    url: 'https://images-assets.nasa.gov/image/PIA24420/PIA24420~orig.jpg',
    name: 'Mars',
    description: 'JWST first images of Mars showing the Red Planet in infrared',
    credit: 'NASA/ESA/CSA/STScI',
  },
  marsOlympia: {
    url: 'https://images-assets.nasa.gov/image/PIA24546/PIA24546~orig.jpg',
    name: 'Mars Olympia',
    description: 'Mars surface from Perseverance rover',
    credit: 'NASA/JPL-Caltech',
  },
  jupiter: {
    url: 'https://images-assets.nasa.gov/image/PIA22949/PIA22949~orig.jpg',
    name: 'Jupiter',
    description: 'Jupiter in infrared from JWST showing auroras and storms',
    credit: 'NASA/ESA/CSA/STScI',
  },
  jupiterJuno: {
    url: 'https://images-assets.nasa.gov/image/PIA21973/PIA21973~orig.jpg',
    name: 'Jupiter Juno',
    description: 'Jupiter from Juno spacecraft showing swirling clouds',
    credit: 'NASA/JPL-Caltech/SwRI/MSSS',
  },
  saturn: {
    url: 'https://images-assets.nasa.gov/image/PIA12567/PIA12567~orig.jpg',
    name: 'Saturn',
    description: 'Saturn portrait from Cassini spacecraft',
    credit: 'NASA/JPL-Caltech/SSI',
  },
  saturnRings: {
    url: 'https://images-assets.nasa.gov/image/PIA21046/PIA21046~orig.jpg',
    name: 'Saturn Rings',
    description: 'Saturn with backlit rings from Cassini',
    credit: 'NASA/JPL-Caltech/SSI',
  },
  earth: {
    url: 'https://images-assets.nasa.gov/image/PIA18033/PIA18033~orig.jpg',
    name: 'Earth',
    description: 'Earth from Saturn - the Pale Blue Dot',
    credit: 'NASA/JPL-Caltech/SSI',
  },
  earthBlueMarble: {
    url: 'https://images-assets.nasa.gov/image/PIA00342/PIA00342~orig.jpg',
    name: 'Blue Marble',
    description: 'Full Earth from space showing oceans and continents',
    credit: 'NASA',
  },
  neptune: {
    url: 'https://images-assets.nasa.gov/image/PIA01492/PIA01492~orig.jpg',
    name: 'Neptune',
    description: 'Neptune from Voyager 2 showing the Great Dark Spot',
    credit: 'NASA/JPL',
  },
  uranus: {
    url: 'https://images-assets.nasa.gov/image/PIA18182/PIA18182~orig.jpg',
    name: 'Uranus',
    description: 'Uranus showing rings and atmospheric features',
    credit: 'NASA/JPL/Voyager',
  },
  carina: {
    url: 'https://images-assets.nasa.gov/image/carina_nebula/carina_nebula~large.jpg',
    name: 'Carina Nebula',
    description: 'JWST Cosmic Cliffs in the Carina Nebula',
    credit: 'NASA/ESA/CSA/STScI',
  },
  pillars: {
    url: 'https://images-assets.nasa.gov/image/PIA17563/PIA17563~orig.jpg',
    name: 'Pillars of Creation',
    description: 'The iconic Pillars of Creation in the Eagle Nebula',
    credit: 'NASA/ESA/Hubble',
  },
  deepField: {
    url: 'https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e002151/GSFC_20171208_Archive_e002151~orig.jpg',
    name: 'Deep Field',
    description: 'Hubble Ultra Deep Field showing thousands of galaxies',
    credit: 'NASA/ESA/Hubble',
  },
} as const

export type PlanetHeroKey = keyof typeof PLANET_HERO_IMAGES
