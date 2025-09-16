export interface IContactDTO {
  id: string;
  contactId: string;
  userId: string;
  targetUserId?: string;
  collaborationId?: string;
  userConnectionId?: string;
  groupId?: string;
  type: "user-mentor" | "user-user" | "group";
  createdAt: Date;
  updatedAt: Date;
}
