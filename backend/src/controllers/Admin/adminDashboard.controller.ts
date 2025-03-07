import { Request, Response } from "express";
import AdminService from "../../services/Admin/adminDashoard.service.js";

class AdminController {
  async getTotalUsersCount(_req: Request, res: Response) {
    try {
      const count = await AdminService.getTotalUsersCount();
      res.json({ totalUsers: count });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async getTotalMentorsCount(_req: Request, res: Response) {
    try {
      const count = await AdminService.getTotalMentorsCount();
      res.json({ totalMentors: count });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async getTotalRevenue(_req: Request, res: Response) {
    try {
      const revenue = await AdminService.getTotalRevenue();
      res.json(revenue);
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async getPendingMentorRequestsCount(_req: Request, res: Response) {
    try {
      const count = await AdminService.getPendingMentorRequestsCount();
      res.json({ pendingMentorRequests: count });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async getActiveCollaborationsCount(_req: Request, res: Response) {
    try {
      const count = await AdminService.getActiveCollaborationsCount();
      res.json({ activeCollaborations: count });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async getRevenueTrends(req: Request, res: Response) {
    try {
      const { timeFormat, days } = req.query;
      const trends = await AdminService.getRevenueTrends(timeFormat as string, Number(days));
      res.json(trends);
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async getUserGrowth(req: Request, res: Response) {
    try {
      const { timeFormat, days } = req.query;
      const growth = await AdminService.getUserGrowth(timeFormat as string, Number(days));
      res.json(growth);
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async getPendingMentorRequests(req: Request, res: Response) {
    try {
      const { limit } = req.query;
      const requests = await AdminService.getPendingMentorRequests(Number(limit));
      res.json(requests);
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async getTopMentors(req: Request, res: Response) {
    try {
      const { limit } = req.query;
      const mentors = await AdminService.getTopMentors(Number(limit));
      res.json(mentors);
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async getRecentCollaborations(req: Request, res: Response) {
    try {
      const { limit } = req.query;
      const collaborations = await AdminService.getRecentCollaborations(Number(limit));
      res.json(collaborations);
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
}

export default new AdminController();
