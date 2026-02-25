import { create } from 'zustand';

export type Mode = 'developer' | 'student' | 'enquiry' | 'everyday' | 'system';

interface ModeState {
  activeMode: Mode;
  prevMode: Mode | null;
  setMode: (mode: Mode) => void;
}

export const useModeStore = create<ModeState>((set) => ({
  activeMode: 'system',
  prevMode: null,
  setMode: (mode) =>
    set((state) => ({ activeMode: mode, prevMode: state.activeMode })),
}));
