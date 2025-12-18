import type { LL2Launch } from '@/types/launch';
import type { Launch, LaunchStatus, Mission, LaunchSiteSummary } from '@/types/launch';
import type { AgencySummary } from '@/types/agency';
import type { VehicleSummary } from '@/types/vehicle';
import type { AgeAdaptedContent } from '@/types/common';

/**
 * Generate age-adapted content from a base description
 * In production, this would use AI or a content management system
 */
function generateAgeAdaptedContent(baseDescription: string): AgeAdaptedContent {
  // Simplified version - in production, use AI or pre-written content
  const explorer = baseDescription
    .replace(/[^.!?]+[.!?]/g, (sentence) => {
      // Keep first sentence simplified
      return sentence.split(' ').slice(0, 10).join(' ') + '...';
    })
    .slice(0, 150);

  const cadet = baseDescription.slice(0, 300);
  const missionControl = baseDescription;

  return {
    explorer: explorer || 'An exciting space mission!',
    cadet: cadet || baseDescription.slice(0, 200),
    missionControl: missionControl || baseDescription,
  };
}

/**
 * Transform LL2 Launch to our Launch type
 */
export function transformLaunch(ll2Launch: LL2Launch): Launch {
  const status: LaunchStatus = {
    id: String(ll2Launch.status.id),
    name: ll2Launch.status.name as LaunchStatus['name'],
    abbrev: ll2Launch.status.abbrev,
    description: ll2Launch.status.description,
  };

  const provider: AgencySummary = {
    id: String(ll2Launch.launch_service_provider.id),
    name: ll2Launch.launch_service_provider.name,
    logo: ll2Launch.launch_service_provider.logo_url || '',
    countryCode: ll2Launch.launch_service_provider.country_code,
  };

  const vehicle: VehicleSummary = {
    id: String(ll2Launch.rocket.configuration.id),
    name: ll2Launch.rocket.configuration.name,
    image: ll2Launch.rocket.configuration.image_url || undefined,
    provider: ll2Launch.launch_service_provider.name,
  };

  const launchSite: LaunchSiteSummary = {
    id: String(ll2Launch.pad.id),
    name: ll2Launch.pad.name,
    location: ll2Launch.pad.location.name,
    countryCode: ll2Launch.pad.location.country_code,
    latitude: ll2Launch.pad.latitude ? parseFloat(ll2Launch.pad.latitude) : undefined,
    longitude: ll2Launch.pad.longitude ? parseFloat(ll2Launch.pad.longitude) : undefined,
  };

  const mission: Mission | undefined = ll2Launch.mission
    ? {
        id: String(ll2Launch.mission.id),
        name: ll2Launch.mission.name,
        type: ll2Launch.mission.type,
        orbit: ll2Launch.mission.orbit
          ? {
              name: ll2Launch.mission.orbit.name,
              abbrev: ll2Launch.mission.orbit.abbrev,
            }
          : undefined,
        description: generateAgeAdaptedContent(ll2Launch.mission.description),
      }
    : undefined;

  // Get webcast URL from vidURLs (highest priority)
  const webcastUrl =
    ll2Launch.vidURLs && ll2Launch.vidURLs.length > 0
      ? ll2Launch.vidURLs.sort((a, b) => a.priority - b.priority)[0].url
      : undefined;

  return {
    id: ll2Launch.id,
    name: ll2Launch.name,
    slug: ll2Launch.slug,
    status,
    net: ll2Launch.net,
    windowStart: ll2Launch.window_start || undefined,
    windowEnd: ll2Launch.window_end || undefined,
    holdReason: ll2Launch.hold_reason || undefined,
    provider,
    vehicle,
    launchSite,
    mission,
    image: ll2Launch.image || undefined,
    webcastUrl,
    webcastLive: ll2Launch.webcast_live,
    probability: ll2Launch.probability || undefined,
    description: generateAgeAdaptedContent(
      ll2Launch.mission?.description || `${ll2Launch.name} mission`
    ),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
