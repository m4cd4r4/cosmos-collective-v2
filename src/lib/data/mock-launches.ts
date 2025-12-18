import type { Launch } from '@/types/launch';

/**
 * Mock launch data for development and testing
 * This data represents realistic launch information in the correct format
 */
export const mockLaunches: Launch[] = [
  {
    id: 'mock-1',
    name: 'Falcon 9 Block 5 | Starlink Group 6-34',
    slug: 'falcon-9-block-5-starlink-group-6-34',
    status: {
      id: '3',
      name: 'Success',
      abbrev: 'Success',
      description: 'The launch was successful',
    },
    net: '2025-12-20T10:30:00.000Z',
    windowStart: '2025-12-20T10:30:00.000Z',
    windowEnd: '2025-12-20T14:30:00.000Z',
    provider: {
      id: '121',
      name: 'SpaceX',
      logo: 'https://thespacedevs-prod.nyc3.digitaloceanspaces.com/media/images/spacex_logo_20220826094313.png',
      countryCode: 'USA',
    },
    vehicle: {
      id: '80',
      name: 'Falcon 9 Block 5',
      provider: 'SpaceX',
    },
    launchSite: {
      id: '87',
      name: 'Space Launch Complex 40',
      location: 'Cape Canaveral Space Force Station, FL, USA',
      countryCode: 'USA',
      latitude: 28.5618571,
      longitude: -80.577366,
    },
    mission: {
      id: 'mission-1',
      name: 'Starlink Group 6-34',
      type: 'Communications',
      orbit: {
        name: 'Low Earth Orbit',
        abbrev: 'LEO',
      },
      description: {
        explorer: 'SpaceX is launching more Starlink satellites to help people get internet from space! These satellites will orbit Earth and beam internet down to people who need it.',
        cadet: 'SpaceX is launching 23 Starlink satellites into low Earth orbit. These satellites are part of the Starlink constellation that provides global internet coverage, especially to remote areas.',
        missionControl: 'SpaceX Falcon 9 Block 5 will launch 23 Starlink satellites to low Earth orbit (LEO) as part of the Starlink mega-constellation. The satellites will be deployed at approximately 530 km altitude and will use krypton-fueled Hall thrusters to reach their operational orbit of 550 km.',
      },
    },
    image: 'https://thespacedevs-prod.nyc3.digitaloceanspaces.com/media/images/falcon2520925_image_20230807133459.jpeg',
    webcastUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    webcastLive: false,
    probability: 90,
    description: {
      explorer: 'SpaceX is launching more satellites to help people get internet from space!',
      cadet: 'This Falcon 9 rocket will carry Starlink satellites to orbit, expanding global internet coverage.',
      missionControl: 'Falcon 9 Block 5 launch vehicle will deploy a batch of Starlink V2 Mini satellites to low Earth orbit for the Starlink broadband constellation.',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mock-2',
    name: 'Electron | NROL-162',
    slug: 'electron-nrol-162',
    status: {
      id: '2',
      name: 'TBD',
      abbrev: 'TBD',
      description: 'To Be Determined',
    },
    net: '2025-12-22T15:00:00.000Z',
    windowStart: '2025-12-22T15:00:00.000Z',
    windowEnd: '2025-12-22T18:00:00.000Z',
    provider: {
      id: '147',
      name: 'Rocket Lab',
      logo: 'https://thespacedevs-prod.nyc3.digitaloceanspaces.com/media/images/rocket2520lab_logo_20190207032501.png',
      countryCode: 'USA',
    },
    vehicle: {
      id: '134',
      name: 'Electron',
      provider: 'Rocket Lab',
    },
    launchSite: {
      id: '27',
      name: 'Rocket Lab Launch Complex 1A',
      location: 'Mahia Peninsula, New Zealand',
      countryCode: 'NZL',
      latitude: -39.2614095,
      longitude: 177.8645029,
    },
    mission: {
      id: 'mission-2',
      name: 'NROL-162',
      type: 'Government/Top Secret',
      orbit: {
        name: 'Low Earth Orbit',
        abbrev: 'LEO',
      },
      description: {
        explorer: 'Rocket Lab is launching a secret satellite for the U.S. National Reconnaissance Office!',
        cadet: 'This mission will deploy a classified satellite for the National Reconnaissance Office (NRO), which operates spy satellites for U.S. national security.',
        missionControl: 'Rocket Lab Electron launch vehicle will deploy a classified NRO payload to low Earth orbit. Mission details are restricted. This represents continued partnership between Rocket Lab and the U.S. intelligence community.',
      },
    },
    image: 'https://thespacedevs-prod.nyc3.digitaloceanspaces.com/media/images/electron_image_20190207032619.jpeg',
    webcastLive: false,
    probability: 80,
    description: {
      explorer: 'A special rocket launch with a secret satellite!',
      cadet: 'Rocket Lab will launch a classified satellite for U.S. national security purposes.',
      missionControl: 'Electron launch vehicle deploying NRO reconnaissance payload to LEO in support of national security objectives.',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mock-3',
    name: 'Starship | Flight Test',
    slug: 'starship-flight-test',
    status: {
      id: '8',
      name: 'TBD',
      abbrev: 'TBD',
      description: 'To be determined - awaiting confirmation',
    },
    net: '2025-12-25T14:00:00.000Z',
    windowStart: '2025-12-25T14:00:00.000Z',
    windowEnd: '2025-12-25T16:00:00.000Z',
    provider: {
      id: '121',
      name: 'SpaceX',
      logo: 'https://thespacedevs-prod.nyc3.digitaloceanspaces.com/media/images/spacex_logo_20220826094313.png',
      countryCode: 'USA',
    },
    vehicle: {
      id: '815',
      name: 'Starship',
      provider: 'SpaceX',
    },
    launchSite: {
      id: '143',
      name: 'Starbase Orbital Launch Mount A',
      location: 'Boca Chica, Texas, USA',
      countryCode: 'USA',
      latitude: 25.997116,
      longitude: -97.157211,
    },
    mission: {
      id: 'mission-3',
      name: 'Starship Flight Test',
      type: 'Test Flight',
      orbit: {
        name: 'Suborbital',
        abbrev: 'Sub',
      },
      description: {
        explorer: "SpaceX's biggest rocket ever is doing a test flight! Starship is so big it could carry 100 people to space someday!",
        cadet: 'SpaceX is testing Starship, the most powerful rocket ever built. This test flight will help prove the rocket can work before it carries astronauts to the Moon and Mars.',
        missionControl: 'SpaceX Starship/Super Heavy integrated flight test. Objectives include full-duration ascent burn of all 33 Raptor engines, hot-stage separation, Starship engine relight demonstration, controlled reentry, and attempted soft ocean landing of both stages. This test advances development toward full and rapid reusability.',
      },
    },
    image: 'https://thespacedevs-prod.nyc3.digitaloceanspaces.com/media/images/starship_mk1_image_20191223095810.jpeg',
    webcastUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    webcastLive: false,
    probability: 70,
    description: {
      explorer: 'The biggest rocket ever is going to space! Watch it fly!',
      cadet: 'SpaceX Starship test flight - testing the most powerful rocket ever built for future Moon and Mars missions.',
      missionControl: 'Starship integrated flight test (IFT) validating Super Heavy booster performance, hot-stage separation, Starship orbital insertion capability, and controlled reentry profiles for both stages.',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mock-4',
    name: 'Ariane 6 | Juice',
    slug: 'ariane-6-juice',
    status: {
      id: '2',
      name: 'TBD',
      abbrev: 'TBD',
      description: 'To Be Determined',
    },
    net: '2025-12-28T09:00:00.000Z',
    windowStart: '2025-12-28T09:00:00.000Z',
    windowEnd: '2025-12-28T11:00:00.000Z',
    provider: {
      id: '115',
      name: 'Arianespace',
      logo: 'https://thespacedevs-prod.nyc3.digitaloceanspaces.com/media/images/arianespace_logo_20190207032425.png',
      countryCode: 'FRA',
    },
    vehicle: {
      id: '194',
      name: 'Ariane 6',
      provider: 'Arianespace',
    },
    launchSite: {
      id: '15',
      name: 'Ensemble de Lancement Ariane 4',
      location: 'Kourou, French Guiana',
      countryCode: 'GUF',
      latitude: 5.239,
      longitude: -52.768,
    },
    mission: {
      id: 'mission-4',
      name: 'JUICE',
      type: 'Planetary Science',
      orbit: {
        name: 'Heliocentric Orbit',
        abbrev: 'HEO',
      },
      description: {
        explorer: "Europe is sending a spacecraft to Jupiter! It's going to visit Jupiter's icy moons to look for alien oceans!",
        cadet: 'JUICE (Jupiter Icy Moons Explorer) will travel to Jupiter to study three of its largest moons: Ganymede, Callisto, and Europa. Scientists think these moons might have oceans under their icy surfaces!',
        missionControl: 'Jupiter Icy Moons Explorer (JUICE) mission by ESA. Primary objectives include detailed characterization of Ganymede, Europa, and Callisto; investigation of subsurface oceans; analysis of potential habitability; and comprehensive study of Jupiter system dynamics. Mission duration: 8 years including gravity assists.',
      },
    },
    image: 'https://thespacedevs-prod.nyc3.digitaloceanspaces.com/media/images/ariane2062520-2520va264_image_20210609103028.jpg',
    webcastLive: false,
    probability: 85,
    description: {
      explorer: 'A spacecraft is going to Jupiter to explore icy moons!',
      cadet: 'European mission to Jupiter to study its icy moons and search for signs of life.',
      missionControl: 'ESA JUICE mission launch via Ariane 6 to Jupiter system for comprehensive investigation of Ganymede, Europa, and Callisto with focus on subsurface ocean characterization.',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mock-5',
    name: 'Falcon Heavy | ViaSat-3 Americas',
    slug: 'falcon-heavy-viasat-3',
    status: {
      id: '2',
      name: 'TBD',
      abbrev: 'TBD',
      description: 'To Be Determined',
    },
    net: '2026-01-05T20:00:00.000Z',
    windowStart: '2026-01-05T20:00:00.000Z',
    windowEnd: '2026-01-05T23:00:00.000Z',
    provider: {
      id: '121',
      name: 'SpaceX',
      logo: 'https://thespacedevs-prod.nyc3.digitaloceanspaces.com/media/images/spacex_logo_20220826094313.png',
      countryCode: 'USA',
    },
    vehicle: {
      id: '15',
      name: 'Falcon Heavy',
      provider: 'SpaceX',
    },
    launchSite: {
      id: '16',
      name: 'Kennedy Space Center LC-39A',
      location: 'Kennedy Space Center, FL, USA',
      countryCode: 'USA',
      latitude: 28.6080585,
      longitude: -80.6039558,
    },
    mission: {
      id: 'mission-5',
      name: 'ViaSat-3 Americas',
      type: 'Communications',
      orbit: {
        name: 'Geostationary Transfer Orbit',
        abbrev: 'GTO',
      },
      description: {
        explorer: 'The biggest rocket at SpaceX (with three boosters!) is launching a huge internet satellite!',
        cadet: 'Falcon Heavy will launch the ViaSat-3 satellite, one of the most powerful communications satellites ever built. It will provide high-speed internet to North and South America.',
        missionControl: 'Falcon Heavy launch of ViaSat-3 Americas, a next-generation ultra-high-capacity satellite. Payload mass: ~6,400 kg to GTO. The satellite features Ka-band multi-spot beam architecture with total throughput exceeding 1 Tbps, serving aviation, maritime, residential, and enterprise markets.',
      },
    },
    image: 'https://thespacedevs-prod.nyc3.digitaloceanspaces.com/media/images/falcon_heavy_image_20230415110438.jpg',
    webcastUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    webcastLive: false,
    probability: 88,
    description: {
      explorer: 'Three rockets attached together launching a big satellite!',
      cadet: 'Falcon Heavy launching ViaSat-3, a powerful communications satellite for internet service across the Americas.',
      missionControl: 'Falcon Heavy GTO insertion mission deploying ViaSat-3 Americas communications payload with 1+ Tbps throughput capacity for continental coverage.',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/**
 * Get the next upcoming launch (soonest NET date)
 */
export function getNextLaunch(): Launch | null {
  const now = new Date();
  const upcomingLaunches = mockLaunches
    .filter((launch) => new Date(launch.net) > now)
    .sort((a, b) => new Date(a.net).getTime() - new Date(b.net).getTime());

  return upcomingLaunches[0] || null;
}

/**
 * Get upcoming launches with pagination
 */
export function getUpcomingLaunches(limit = 10, offset = 0): Launch[] {
  const now = new Date();
  const upcomingLaunches = mockLaunches
    .filter((launch) => new Date(launch.net) > now)
    .sort((a, b) => new Date(a.net).getTime() - new Date(b.net).getTime());

  return upcomingLaunches.slice(offset, offset + limit);
}
