import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchRequests, fetchCollabDetails, fetchGroupRequests, fetchGroupDetailsForMembers } from '../../../../redux/Slice/profileSlice';
import { AppDispatch } from '../../../../redux/store';

const RequestStatusHandler = ({ currentUser }) => {
  const dispatch = useDispatch<AppDispatch>();

  const refreshRequestStatus = async () => {
    if (!currentUser) return;

    // Fetch latest request status
    await dispatch(fetchRequests({
      userId: currentUser._id,
      role: currentUser.role,
      mentorId: currentUser.mentorId
    }));

    // Fetch latest collaboration status
    await dispatch(fetchCollabDetails({
      userId: currentUser._id,
      role: currentUser.role
    }));

    // Fetch latest group request status
    await dispatch(fetchGroupRequests(currentUser._id));

    //fetch group membership details
    dispatch(fetchGroupDetailsForMembers(currentUser._id))
  };

  // Set up an interval to refresh status
  useEffect(() => {
    refreshRequestStatus();
    
    // Refresh every 30 seconds
    const intervalId = setInterval(refreshRequestStatus, 30000);
    
    return () => clearInterval(intervalId);
  }, [currentUser]);

  return null; 
};

export default RequestStatusHandler;