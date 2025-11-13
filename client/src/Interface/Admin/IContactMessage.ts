export interface ContactMessage {
  id: string; 
  contactMessageId: string;
  name: string;
  email: string;
  message: string;
  givenReply: boolean;
  createdAt: string;
}