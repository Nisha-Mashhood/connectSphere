import AdminService from "../../services/Admin/adminDashoard.service.js";
class AdminController {
    async getTotalUsersCount(_req, res) {
        try {
            const count = await AdminService.getTotalUsersCount();
            res.json({ totalUsers: count });
        }
        catch (error) {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
    async getTotalMentorsCount(_req, res) {
        try {
            const count = await AdminService.getTotalMentorsCount();
            res.json({ totalMentors: count });
        }
        catch (error) {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
    async getTotalRevenue(_req, res) {
        try {
            const revenue = await AdminService.getTotalRevenue();
            res.json(revenue);
        }
        catch (error) {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
    async getPendingMentorRequestsCount(_req, res) {
        try {
            const count = await AdminService.getPendingMentorRequestsCount();
            res.json({ pendingMentorRequests: count });
        }
        catch (error) {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
    async getActiveCollaborationsCount(_req, res) {
        try {
            const count = await AdminService.getActiveCollaborationsCount();
            res.json({ activeCollaborations: count });
        }
        catch (error) {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
    async getRevenueTrends(req, res) {
        try {
            const { timeFormat, days } = req.query;
            const trends = await AdminService.getRevenueTrends(timeFormat, Number(days));
            res.json(trends);
        }
        catch (error) {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
    async getUserGrowth(req, res) {
        try {
            const { timeFormat, days } = req.query;
            const growth = await AdminService.getUserGrowth(timeFormat, Number(days));
            res.json(growth);
        }
        catch (error) {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
    async getPendingMentorRequests(req, res) {
        try {
            const { limit } = req.query;
            const requests = await AdminService.getPendingMentorRequests(Number(limit));
            res.json(requests);
        }
        catch (error) {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
    async getTopMentors(req, res) {
        try {
            const { limit } = req.query;
            const mentors = await AdminService.getTopMentors(Number(limit));
            res.json(mentors);
        }
        catch (error) {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
    async getRecentCollaborations(req, res) {
        try {
            const { limit } = req.query;
            const collaborations = await AdminService.getRecentCollaborations(Number(limit));
            res.json(collaborations);
        }
        catch (error) {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
}
export default new AdminController();
//# sourceMappingURL=adminDashboard.controller.js.map