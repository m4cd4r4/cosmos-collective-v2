import { create } from 'zustand'

interface MCStore {
  open: boolean
  toggle: () => void
  close: () => void
}

export const useMCStore = create<MCStore>(set => ({
  open: false,
  toggle: () => set(s => ({ open: !s.open })),
  close: () => set({ open: false }),
}))
