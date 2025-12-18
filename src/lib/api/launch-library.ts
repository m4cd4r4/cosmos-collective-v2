import type { LL2LaunchResponse, LL2Launch } from '@/types/launch';
import type { LL2AgencyResponse, LL2Agency } from '@/types/agency';
import type { LL2VehicleResponse, LL2Vehicle } from '@/types/vehicle';

const LL2_BASE_URL = 'https://ll.thespacedevs.com/2.2.0';

interface LL2Config {
  apiKey?: string;
}

interface LL2Params {
  limit?: number;
  offset?: number;
  [key: string]: string | number | undefined;
}

/**
 * Launch Library 2 API Client
 * Documentation: https://thespacedevs.com/llapi
 */
export function getLaunchLibraryClient(config?: LL2Config) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add API key if provided (for paid tier)
  if (config?.apiKey) {
    headers['Authorization'] = `Token ${config.apiKey}`;
  }

  async function fetchLL2<T>(endpoint: string, params?: LL2Params): Promise<T> {
    const url = new URL(`${LL2_BASE_URL}${endpoint}`);

    // Add query parameters
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(url.toString(), {
      headers,
      next: { revalidate: 60 }, // Cache for 1 minute
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Launch Library 2 API error (${response.status}): ${errorText}`
      );
    }

    return response.json();
  }

  return {
    // Launch endpoints
    getUpcomingLaunches: (params?: LL2Params) =>
      fetchLL2<LL2LaunchResponse>('/launch/upcoming/', params),

    getLaunch: (id: string) => fetchLL2<LL2Launch>(`/launch/${id}/`),

    getPreviousLaunches: (params?: LL2Params) =>
      fetchLL2<LL2LaunchResponse>('/launch/previous/', params),

    // Agency endpoints
    getAgencies: (params?: LL2Params) =>
      fetchLL2<LL2AgencyResponse>('/agencies/', params),

    getAgency: (id: string) => fetchLL2<LL2Agency>(`/agencies/${id}/`),

    // Vehicle endpoints (launcher configurations)
    getVehicles: (params?: LL2Params) =>
      fetchLL2<LL2VehicleResponse>('/config/launcher/', params),

    getVehicle: (id: string) => fetchLL2<LL2Vehicle>(`/config/launcher/${id}/`),
  };
}

/**
 * Get Launch Library 2 client with API key from environment
 */
export function getLL2Client() {
  return getLaunchLibraryClient({
    apiKey: process.env.LL2_API_KEY,
  });
}
