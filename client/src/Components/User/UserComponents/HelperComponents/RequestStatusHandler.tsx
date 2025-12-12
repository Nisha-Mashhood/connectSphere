import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchRequests, fetchCollabDetails, fetchGroupRequests, fetchGroupDetailsForMembers } from '../../../../redux/Slice/profileSlice';
import { AppDispatch } from '../../../../redux/store';

const RequestStatusHandler = ({ currentUser }) => {
  const dispatch = useDispatch<AppDispatch>();

  const refreshRequestStatus = useCallback(async () => {
    if (!currentUser) return;

    await dispatch(fetchRequests({
      userId: currentUser._id,
      role: currentUser.role,
      mentorId: currentUser.mentorId
    }));

    await dispatch(fetchCollabDetails({
      userId: currentUser._id,
      role: currentUser.role
    }));
    await dispatch(fetchGroupRequests(currentUser._id));
    dispatch(fetchGroupDetailsForMembers(currentUser._id))
  },[currentUser, dispatch]);

  useEffect(() => {
    refreshRequestStatus();
    const intervalId = setInterval(refreshRequestStatus, 30000);
    
    return () => clearInterval(intervalId);
  }, [currentUser, refreshRequestStatus]);

  return null; 
};

export default RequestStatusHandler;