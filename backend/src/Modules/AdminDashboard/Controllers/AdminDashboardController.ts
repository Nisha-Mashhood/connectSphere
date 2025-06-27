import { Request, Response } from "express";
import AdminService from "../Service/AdminDashboardService";

class AdminController {
   getTotalUsersCount = async(_req: Request, res: Response) => {
    try {
      const count = await AdminService.getTotalUsersCount();
      res.json({ totalUsers: count });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

   getTotalMentorsCount = async(_req: Request, res: Response) => {
    try {
      const count = await AdminService.getTotalMentorsCount();
      res.json({ totalMentors: count });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

   getTotalRevenue = async(_req: Request, res: Response) => {
    try {
      const revenue = await AdminService.getTotalRevenue();
      res.json(revenue);
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

   getPendingMentorRequestsCount = async(_req: Request, res: Response) => {
    try {
      const count = await AdminService.getPendingMentorRequestsCount();
      res.json({ pendingMentorRequests: count });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

   getActiveCollaborationsCount = async(_req: Request, res: Response) => {
    try {
      const count = await AdminService.getActiveCollaborationsCount();
      res.json({ activeCollaborations: count });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

   getRevenueTrends = async(req: Request, res: Response) => {
    try {
      const { timeFormat, days } = req.query;
      const trends = await AdminService.getRevenueTrends(timeFormat as string, Number(days));
      res.json(trends);
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

   getUserGrowth = async(req: Request, res: Response) => {
    try {
      const { timeFormat, days } = req.query;
      const growth = await AdminService.getUserGrowth(timeFormat as string, Number(days));
      res.json(growth);
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

   getPendingMentorRequests = async(req: Request, res: Response) => {
    try {
      const { limit } = req.query;
      const requests = await AdminService.getPendingMentorRequests(Number(limit));
      res.json(requests);
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

   getTopMentors = async(req: Request, res: Response) => {
    try {
      const { limit } = req.query;
      const mentors = await AdminService.getTopMentors(Number(limit));
      res.json(mentors);
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

   getRecentCollaborations = async(req: Request, res: Response) => {
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
