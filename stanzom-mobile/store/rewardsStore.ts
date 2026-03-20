import { create } from 'zustand';

interface RewardsState {
  totalPoints: number;
  toastVisible: boolean;
  toastPoints: number;
  toastMessage: string;
  addPoints: (points: number, message: string) => void;
  hideToast: () => void;
  setTotalPoints: (points: number) => void;
}

export const useRewardsStore = create<RewardsState>((set) => ({
  totalPoints: 0,
  toastVisible: false,
  toastPoints: 0,
  toastMessage: '',

  addPoints: (points, message) =>
    set((state) => ({
      totalPoints: state.totalPoints + points,
      toastVisible: true,
      toastPoints: points,
      toastMessage: message,
    })),

  hideToast: () =>
    set({ toastVisible: false, toastPoints: 0, toastMessage: '' }),

  setTotalPoints: (points) =>
    set({ totalPoints: points }),
}));
