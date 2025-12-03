/**
 * Cosmos Collective - Global State Store
 * Using Zustand for lightweight, performant state management
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  Observation,
  ObjectCategory,
  TelescopeSource,
  WavelengthBand,
  SearchFilters,
  AstronomicalEvent,
  UserStats,
  ClassificationTask,
} from '@/types'

// ============================================
// Store Types
// ============================================

interface ViewState {
  currentView: 'gallery' | 'viewer' | 'sky-map' | 'events' | 'citizen-science'
  sidebarOpen: boolean
  selectedObservationId: string | null
  comparisonObservationIds: string[]
}

interface FilterState {
  searchQuery: string
  categories: ObjectCategory[]
  sources: TelescopeSource[]
  wavelengthBands: WavelengthBand[]
  dateRange: { start: string; end: string } | null
  sortBy: 'date' | 'name' | 'popularity' | 'relevance'
  sortOrder: 'asc' | 'desc'
}

interface DataState {
  observations: Observation[]
  featuredObservations: Observation[]
  events: AstronomicalEvent[]
  classificationTasks: ClassificationTask[]
  isLoading: boolean
  error: string | null
}

interface UserPreferences {
  theme: 'dark' | 'light' | 'system'
  coordinateFormat: 'decimal' | 'sexagesimal'
  showFeatureOverlays: boolean
  autoplayAnimations: boolean
  reducedMotion: boolean
  highContrast: boolean
  fontSize: 'small' | 'medium' | 'large'
  showTutorials: boolean
}

interface UserState {
  isAuthenticated: boolean
  favorites: string[]
  recentlyViewed: string[]
  preferences: UserPreferences
  stats: UserStats | null
}

interface CosmosStore extends ViewState, FilterState, DataState, UserState {
  // View actions
  setCurrentView: (view: ViewState['currentView']) => void
  toggleSidebar: () => void
  selectObservation: (id: string | null) => void
  addToComparison: (id: string) => void
  removeFromComparison: (id: string) => void
  clearComparison: () => void

  // Filter actions
  setSearchQuery: (query: string) => void
  setCategories: (categories: ObjectCategory[]) => void
  toggleCategory: (category: ObjectCategory) => void
  setSources: (sources: TelescopeSource[]) => void
  toggleSource: (source: TelescopeSource) => void
  setWavelengthBands: (bands: WavelengthBand[]) => void
  toggleWavelengthBand: (band: WavelengthBand) => void
  setDateRange: (range: { start: string; end: string } | null) => void
  setSortBy: (sortBy: FilterState['sortBy']) => void
  setSortOrder: (order: FilterState['sortOrder']) => void
  clearFilters: () => void

  // Data actions
  setObservations: (observations: Observation[]) => void
  addObservations: (observations: Observation[]) => void
  setFeaturedObservations: (observations: Observation[]) => void
  setEvents: (events: AstronomicalEvent[]) => void
  setClassificationTasks: (tasks: ClassificationTask[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // User actions
  setAuthenticated: (authenticated: boolean) => void
  toggleFavorite: (observationId: string) => void
  clearFavorites: () => void
  addToRecentlyViewed: (observationId: string) => void
  setPreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void
  setUserStats: (stats: UserStats) => void

  // Computed getters
  getFilteredObservations: () => Observation[]
  getSelectedObservation: () => Observation | undefined
  getFavoriteObservations: () => Observation[]
  getComparisonObservations: () => Observation[]
}

// ============================================
// Default Values
// ============================================

const defaultPreferences: UserPreferences = {
  theme: 'dark',
  coordinateFormat: 'sexagesimal',
  showFeatureOverlays: true,
  autoplayAnimations: true,
  reducedMotion: false,
  highContrast: false,
  fontSize: 'medium',
  showTutorials: true,
}

const defaultFilters: FilterState = {
  searchQuery: '',
  categories: [],
  sources: [],
  wavelengthBands: [],
  dateRange: null,
  sortBy: 'date',
  sortOrder: 'desc',
}

// ============================================
// Store Implementation
// ============================================

export const useCosmosStore = create<CosmosStore>()(
  persist(
    (set, get) => ({
      // Initial view state
      currentView: 'gallery',
      sidebarOpen: true,
      selectedObservationId: null,
      comparisonObservationIds: [],

      // Initial filter state
      ...defaultFilters,

      // Initial data state
      observations: [],
      featuredObservations: [],
      events: [],
      classificationTasks: [],
      isLoading: false,
      error: null,

      // Initial user state
      isAuthenticated: false,
      favorites: [],
      recentlyViewed: [],
      preferences: defaultPreferences,
      stats: null,

      // View actions
      setCurrentView: (view) => set({ currentView: view }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      selectObservation: (id) => {
        set({ selectedObservationId: id })
        if (id) {
          get().addToRecentlyViewed(id)
        }
      },
      addToComparison: (id) =>
        set((state) => ({
          comparisonObservationIds: state.comparisonObservationIds.includes(id)
            ? state.comparisonObservationIds
            : [...state.comparisonObservationIds, id].slice(0, 4), // Max 4 comparisons
        })),
      removeFromComparison: (id) =>
        set((state) => ({
          comparisonObservationIds: state.comparisonObservationIds.filter((i) => i !== id),
        })),
      clearComparison: () => set({ comparisonObservationIds: [] }),

      // Filter actions
      setSearchQuery: (query) => set({ searchQuery: query }),
      setCategories: (categories) => set({ categories }),
      toggleCategory: (category) =>
        set((state) => ({
          categories: state.categories.includes(category)
            ? state.categories.filter((c) => c !== category)
            : [...state.categories, category],
        })),
      setSources: (sources) => set({ sources }),
      toggleSource: (source) =>
        set((state) => ({
          sources: state.sources.includes(source)
            ? state.sources.filter((s) => s !== source)
            : [...state.sources, source],
        })),
      setWavelengthBands: (bands) => set({ wavelengthBands: bands }),
      toggleWavelengthBand: (band) =>
        set((state) => ({
          wavelengthBands: state.wavelengthBands.includes(band)
            ? state.wavelengthBands.filter((b) => b !== band)
            : [...state.wavelengthBands, band],
        })),
      setDateRange: (range) => set({ dateRange: range }),
      setSortBy: (sortBy) => set({ sortBy }),
      setSortOrder: (order) => set({ sortOrder: order }),
      clearFilters: () => set(defaultFilters),

      // Data actions
      setObservations: (observations) => set({ observations }),
      addObservations: (observations) =>
        set((state) => ({
          observations: [...state.observations, ...observations],
        })),
      setFeaturedObservations: (observations) => set({ featuredObservations: observations }),
      setEvents: (events) => set({ events }),
      setClassificationTasks: (tasks) => set({ classificationTasks: tasks }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      // User actions
      setAuthenticated: (authenticated) => set({ isAuthenticated: authenticated }),
      toggleFavorite: (observationId) =>
        set((state) => ({
          favorites: state.favorites.includes(observationId)
            ? state.favorites.filter((id) => id !== observationId)
            : [...state.favorites, observationId],
        })),
      clearFavorites: () => set({ favorites: [] }),
      addToRecentlyViewed: (observationId) =>
        set((state) => ({
          recentlyViewed: [
            observationId,
            ...state.recentlyViewed.filter((id) => id !== observationId),
          ].slice(0, 20), // Keep last 20
        })),
      setPreference: (key, value) =>
        set((state) => ({
          preferences: { ...state.preferences, [key]: value },
        })),
      setUserStats: (stats) => set({ stats }),

      // Computed getters
      getFilteredObservations: () => {
        const state = get()
        let filtered = [...state.observations]

        // Search query filter
        if (state.searchQuery) {
          const query = state.searchQuery.toLowerCase()
          filtered = filtered.filter(
            (obs) =>
              obs.targetName.toLowerCase().includes(query) ||
              obs.description?.toLowerCase().includes(query) ||
              obs.aliases?.some((alias) => alias.toLowerCase().includes(query))
          )
        }

        // Category filter
        if (state.categories.length > 0) {
          filtered = filtered.filter((obs) => state.categories.includes(obs.category))
        }

        // Source filter
        if (state.sources.length > 0) {
          filtered = filtered.filter((obs) => state.sources.includes(obs.source))
        }

        // Wavelength band filter
        if (state.wavelengthBands.length > 0) {
          filtered = filtered.filter((obs) =>
            state.wavelengthBands.includes(obs.wavelengthBand)
          )
        }

        // Date range filter
        if (state.dateRange) {
          const start = new Date(state.dateRange.start)
          const end = new Date(state.dateRange.end)
          filtered = filtered.filter((obs) => {
            const obsDate = new Date(obs.observationDate)
            return obsDate >= start && obsDate <= end
          })
        }

        // Sorting
        filtered.sort((a, b) => {
          let comparison = 0

          switch (state.sortBy) {
            case 'date':
              comparison =
                new Date(b.observationDate).getTime() -
                new Date(a.observationDate).getTime()
              break
            case 'name':
              comparison = a.targetName.localeCompare(b.targetName)
              break
            case 'popularity':
              // Assuming popularity could be based on features count or favorites
              comparison = (b.features?.length || 0) - (a.features?.length || 0)
              break
            case 'relevance':
              // For search relevance, keep original order
              break
          }

          return state.sortOrder === 'desc' ? comparison : -comparison
        })

        return filtered
      },

      getSelectedObservation: () => {
        const state = get()
        return state.observations.find((obs) => obs.id === state.selectedObservationId)
      },

      getFavoriteObservations: () => {
        const state = get()
        return state.observations.filter((obs) => state.favorites.includes(obs.id))
      },

      getComparisonObservations: () => {
        const state = get()
        return state.comparisonObservationIds
          .map((id) => state.observations.find((obs) => obs.id === id))
          .filter((obs): obs is Observation => obs !== undefined)
      },
    }),
    {
      name: 'cosmos-collective-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist user preferences and favorites, not observation data
      partialize: (state) => ({
        favorites: state.favorites,
        recentlyViewed: state.recentlyViewed,
        preferences: state.preferences,
        currentView: state.currentView,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
)

// ============================================
// Selector Hooks for Performance
// ============================================

export const useCurrentView = () => useCosmosStore((state) => state.currentView)
export const useSelectedObservation = () => useCosmosStore((state) => state.getSelectedObservation())
export const useFilteredObservations = () => useCosmosStore((state) => state.getFilteredObservations())
export const useFavorites = () => useCosmosStore((state) => state.favorites)
export const usePreferences = () => useCosmosStore((state) => state.preferences)
export const useIsLoading = () => useCosmosStore((state) => state.isLoading)
export const useEvents = () => useCosmosStore((state) => state.events)
