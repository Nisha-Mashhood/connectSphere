// send requset to user
export const sendRequestController = async (req, res) => {
    const { id } = req.params;
    const { recipientId } = req.body;
    console.log("Requester ID:", id);
    console.log("Recipient ID:", recipientId);
    try {
        res.status(200).json({ message: "Request send" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
//# sourceMappingURL=user-userCollab.controller.js.map