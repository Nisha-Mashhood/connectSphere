import { User, Group, UserConnection, CompleteMentorDetails, Mentor, CollabDetails, Request, GroupMemberships, GroupRequest } from '../../../../redux/types';

export interface ButtonConfig {
  disabled: boolean;
  hidden?: boolean;
  text: string;
}

export const getUserButtonConfig = (
  targetUser: User,
  userConnections: { sent: UserConnection[]; received: UserConnection[] }
): ButtonConfig => {
  const sentRequest = userConnections.sent?.find(
    (conn) => conn.recipient.id === targetUser.id
  );
  const receivedRequest = userConnections.received?.find(
    (conn) => conn.requester.id === targetUser.id
  );

  if (
    sentRequest?.connectionStatus === 'Connected' ||
    receivedRequest?.connectionStatus === 'Connected'
  ) {
    return { disabled: true, text: 'Connected' };
  }
  if (sentRequest?.requestStatus === 'Pending') {
    return { disabled: true, text: 'Request Pending' };
  }
  if (receivedRequest?.requestStatus === 'Pending') {
    return { disabled: true, text: 'Accept Request' };
  }
  if (
    sentRequest?.requestStatus === 'Rejected' ||
    sentRequest?.connectionStatus === 'Disconnected'
  ) {
    return { disabled: false, text: 'Connect Again' };
  }
  return { disabled: false, text: 'Connect' };
};

export const getMentorButtonConfig = (mentor: CompleteMentorDetails, mentorDetails: Mentor, collabDetails: CollabDetails, req: Request): ButtonConfig => {
  if (mentorDetails?.id === mentor.id) {
    return { disabled: true, hidden: true, text: 'Your Card' };
  }
  const ongoingCollab = collabDetails?.data?.find(
    (collab) =>
      collab.mentorId === mentor.id && !collab.isCancelled && !collab.isCompleted
  );
  if (ongoingCollab) {
    return { disabled: true, hidden: false, text: 'Ongoing Collaboration' };
  }
  const pendingRequest = req?.sentRequests?.find(
    (request) => request.mentorId === mentor.id
  );
  if (pendingRequest && pendingRequest.isAccepted !== 'Rejected') {
    const requestStatus: { [key: string]: string } = {
      Pending: 'Request Pending',
      Accepted: 'Request Accepted',
      Rejected: 'Request Rejected',
    };
    return {
      disabled: true,
      hidden: false,
      text: requestStatus[pendingRequest.isAccepted] || 'Request Pending',
    };
  }
  return { disabled: false, hidden: false, text: 'Book Session' };
};

export const getGroupButtonConfig = (group: Group, groupMemberships: GroupMemberships, groupRequests: GroupRequest[]) => {
  const isMember = groupMemberships?.groups?.some(
    (membership) => membership.id === group.id
  );
  if (isMember) {
    return { disabled: true, text: 'Member' };
  }
  const totalMembers = group.maxMembers;
  const currentMembers = group.members?.length || 0;
  if (currentMembers >= totalMembers) {
    return { disabled: true, text: 'Group Full' };
  }
  const existingRequest = groupRequests?.find(
    (request) => request.groupId.id === group.id
  );
  if (existingRequest) {
    const requestStatus: { [key: string]: string } = {
      Pending: 'Request Pending',
      Accepted: 'Request Accepted',
      Rejected: 'Join Group',
    };
    return {
      disabled: existingRequest.status !== 'Rejected',
      text: requestStatus[existingRequest.status] || 'Join Group',
    };
  }
  return { disabled: false, text: 'Join Group' };
};