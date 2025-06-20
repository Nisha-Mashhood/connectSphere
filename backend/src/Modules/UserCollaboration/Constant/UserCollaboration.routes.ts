export const USER_CONNECTION_ROUTES = {
  SendUserRequest: '/sendUser-User/:id',
  RespondToRequest: '/respond/:connectionId',
  DisconnectConnection: '/disconnect/:connectionId',
  GetUserConnections: '/connections/:userId',
  GetUserRequests: '/connections/:userId/requests',
  GetConnectionById: '/getConnection/:connectionId',
  GetAllConnections: '/getAllconnection',
} as const;