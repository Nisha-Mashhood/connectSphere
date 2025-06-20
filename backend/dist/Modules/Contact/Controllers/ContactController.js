import { BaseController } from '../../../core/Controller/BaseController.js';
import { ContactService } from '../Service/ContactService.js';
import logger from '../../../core/Utils/Logger.js';
export class ContactController extends BaseController {
    contactService;
    constructor() {
        super();
        this.contactService = new ContactService();
    }
    getUserContacts = async (req, res) => {
        try {
            const userId = req.currentUser?._id;
            const userRole = req.currentUser?.role;
            if (!userId || !userRole) {
                this.throwError(400, 'User ID or role not provided');
            }
            const contacts = await this.contactService.getUserContacts(userId?.toString());
            this.sendSuccess(res, contacts, 'Contacts retrieved successfully');
        }
        catch (error) {
            logger.error(`Error in getUserContacts: ${error.message}`);
            this.handleError(error, res);
        }
    };
}
//# sourceMappingURL=ContactController.js.map