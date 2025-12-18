import { APIClientError } from './errors';

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

/**
 * Base API client for internal API routes
 */
export async function apiClient<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;

  // Build URL with query parameters
  let url = `/api${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });
    url += `?${searchParams.toString()}`;
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIClientError(
        errorData.message || `API request failed: ${response.statusText}`,
        response.status,
        errorData.code
      );
    }

    return response.json();
  } catch (error) {
    if (error instanceof APIClientError) {
      throw error;
    }

    throw new APIClientError(
      error instanceof Error ? error.message : 'Network error',
      0
    );
  }
}
