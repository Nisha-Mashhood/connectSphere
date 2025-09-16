export const CONTACT_ROUTES = {
  CreateContactMessage: '/contact',
  GetAllContactMessages: '/messages',
  SendReply: '/reply/:contactMessageId',
} as const;