import { create } from 'zustand';

interface UIState {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;

  activeModal: string | null;
  modalData: unknown;
  openModal: (modalId: string, data?: unknown) => void;
  closeModal: () => void;

  tickerPaused: boolean;
  setTickerPaused: (paused: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  mobileMenuOpen: false,
  activeModal: null,
  modalData: null,
  tickerPaused: false,

  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
  openModal: (modalId, data) => set({ activeModal: modalId, modalData: data }),
  closeModal: () => set({ activeModal: null, modalData: null }),
  setTickerPaused: (paused) => set({ tickerPaused: paused }),
}));
