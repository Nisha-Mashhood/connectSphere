import * as CallService from '../services/call.service.js';
export const logCall = async (req, res) => {
    try {
        const { chatKey, callerId, recipientId, type, status } = req.body;
        if (!chatKey || !callerId || !recipientId || !type || !status) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }
        const call = await CallService.logCall(chatKey, callerId, recipientId, type, status);
        res.status(201).json({ status: 'success', data: call });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const getCallsByChatKey = async (req, res) => {
    try {
        const { chatKey } = req.query;
        if (!chatKey) {
            res.status(400).json({ error: 'chatKey is required' });
            return;
        }
        const calls = await CallService.getCallsByChatKey(chatKey);
        res.json({ status: 'success', data: calls });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const getCallsByUserId = async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) {
            res.status(400).json({ error: 'userId is required' });
            return;
        }
        const calls = await CallService.getCallsByUserId(userId);
        res.json({ status: 'success', data: calls });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
//# sourceMappingURL=call.controller.js.map