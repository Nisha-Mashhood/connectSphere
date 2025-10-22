import { Group } from '../../../../redux/types';

export const getMemberCounts = (group: Group) => {
  const totalMembers = group.maxMembers;
  const currentMembers = group.members?.length || 0;
  const remainingSlots = totalMembers - currentMembers;
  return {
    total: totalMembers,
    current: currentMembers,
    remaining: remainingSlots,
  };
};