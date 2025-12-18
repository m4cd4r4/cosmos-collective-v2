/**
 * Age mode for content adaptation
 * - explorer: 5-8 years old (simple, wonder-focused)
 * - cadet: 9-13 years old (educational, contextual) - DEFAULT
 * - missionControl: 14+ years old (detailed, technical)
 */
export type AgeMode = 'explorer' | 'cadet' | 'missionControl';

/**
 * Age-adapted content structure
 * All user-facing content should provide variants for each age mode
 */
export interface AgeAdaptedContent {
  explorer: string; // Simple, wonder-focused (5-8)
  cadet: string; // Educational, contextual (9-13)
  missionControl: string; // Detailed, technical (14+)
}

/**
 * Paginated API response structure
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * API error structure
 */
export interface APIError {
  message: string;
  code?: string;
  status?: number;
}

/**
 * Loading state enum
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
