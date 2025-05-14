import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../redux/store';
import { openReviewModal } from '../redux/Slice/reviewSlice';

export const useReviewModalTimer = (needsReviewPrompt: boolean, isAdminRoute: boolean) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    let timer: number;
    if (needsReviewPrompt && !isAdminRoute) {
      console.log("[useReviewModalTimer] Scheduling review modal in 5 minutes");
      timer = setTimeout(() => {
        dispatch(openReviewModal());
        setIsModalOpen(true);
      }, 5 * 60 * 1000); // 5 minutes
    }
    return () => clearTimeout(timer);
  }, [needsReviewPrompt, isAdminRoute, dispatch]);

  return { isModalOpen, setIsModalOpen };
};