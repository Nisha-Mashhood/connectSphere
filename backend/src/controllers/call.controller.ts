// import { Request, Response } from "express";
// import * as CallService from "../services/call.service.js";

// export const logCall = async (req: Request, res: Response) => {
//   try {
//     const { chatKey, callerId, recipientId, type, status } = req.body;
//     if (!chatKey || !callerId || !recipientId || !type || !status) {
//       res.status(400).json({ error: "Missing required fields" });
//       return;
//     }
//     const call = await CallService.logCall(
//       chatKey,
//       callerId,
//       recipientId,
//       type,
//       status
//     );
//     res.status(201).json({ status: "success", data: call });
//   } catch (error: any) {
//     res.status(500).json({ error: error.message });
//   }
// };

// export const getCallsByChatKey = async (req: Request, res: Response) => {
//   try {
//     const { chatKey } = req.query;
//     if (!chatKey) {
//       res.status(400).json({ error: "chatKey is required" });
//       return;
//     }
//     const calls = await CallService.getCallsByChatKey(chatKey as string);
//     res.json({ status: "success", data: calls });
//   } catch (error: any) {
//     res.status(500).json({ error: error.message });
//   }
// };

// export const getCallsByUserId = async (req: Request, res: Response) => {
//   try {
//     const { userId } = req.query;
//     if (!userId) {
//       res.status(400).json({ error: "userId is required" });
//       return;
//     }
//     const calls = await CallService.getCallsByUserId(userId as string);
//     res.json({ status: "success", data: calls });
//   } catch (error: any) {
//     res.status(500).json({ error: error.message });
//   }
// };
