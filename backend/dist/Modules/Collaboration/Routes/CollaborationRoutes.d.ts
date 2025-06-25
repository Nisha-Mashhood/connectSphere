declare const router: import("express-serve-static-core").Router;
export declare const COLLABORATION_ROUTES: {
    readonly CreateMentorProfile: "/create-mentorprofile";
    readonly GetMentorRequests: "/get-mentor-requests";
    readonly AcceptRequest: "/accept-request/:id";
    readonly RejectRequest: "/reject-request/:id";
    readonly GetUserRequests: "/get-user-requests/:id";
    readonly ProcessPayment: "/process-payment";
    readonly GetCollabDataUser: "/get-collabData-user/:id";
    readonly GetCollabDataMentor: "/get-collabData-mentor/:id";
    readonly CancelCollab: "/cancel-collab/:collabId";
    readonly GetCollab: "/getCollab/:collabId";
    readonly GetCollabRequest: "/getCollabRequset/:requestId";
    readonly MarkUnavailable: "/markUnavailable/:collabId";
    readonly UpdateTimeslot: "/updateTimeslot/:collabId";
    readonly ApproveTimeSlot: "/approveTimeSlot/:collabId";
    readonly GetLockedSlots: "/locked-slots/:mentorId";
    readonly GetAllMentorRequests: "/collaborations/admin/requests";
    readonly GetAllCollabs: "/collaborations/admin";
};
export default router;
//# sourceMappingURL=CollaborationRoutes.d.ts.map