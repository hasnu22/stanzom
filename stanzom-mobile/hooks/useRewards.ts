import { useRewardsStore } from '../store/rewardsStore';

export const useRewards = () => {
  const { totalPoints, toastVisible, toastPoints, toastMessage, addPoints, hideToast } =
    useRewardsStore();

  return {
    totalPoints,
    addPoints,
    toastVisible,
    toastPoints,
    toastMessage,
    hideToast,
  };
};
