export interface IContactMessageDTO {
  id: string;
  contactMessageId: string;
  name: string;
  email: string;
  message: string;
  createdAt: Date;
  givenReply: boolean;
}