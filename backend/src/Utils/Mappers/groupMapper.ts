import { IGroup, TimeSlot } from '../../Interfaces/Models/IGroup';
import { IGroupDTO, TimeSlotDTO } from '../../Interfaces/DTOs/IGroupDTO';

function toTimeSlotDTO(slot: TimeSlot): TimeSlotDTO {
  return {
    day: slot.day,
    timeSlots: slot.timeSlots,
  };
}

export function toGroupDTO(group: IGroup | null): IGroupDTO | null {
  if (!group) return null;

  return {
    id: group._id.toString(),
    groupId: group.groupId,
    name: group.name,
    bio: group.bio,
    price: group.price,
    maxMembers: group.maxMembers,
    isFull: group.isFull,
    availableSlots: group.availableSlots.map(toTimeSlotDTO),
    profilePic: group.profilePic,
    coverPic: group.coverPic,
    startDate: group.startDate,
    adminId: group.adminId.toString(),
    members: group.members.map(m => ({
      userId: m.userId.toString(),
      joinedAt: m.joinedAt,
    })),
    createdAt: group.createdAt,
  };
}

export function toGroupDTOs(groups: IGroup[]): IGroupDTO[] {
  return groups.map(toGroupDTO).filter((dto): dto is IGroupDTO => dto !== null);
}
