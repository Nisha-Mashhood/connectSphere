import { Request, Response } from 'express';
import { BaseController } from '../../../core/Controller/BaseController.js';
import { ContactService } from '../Service/ContactService.js';
import logger from '../../../core/Utils/Logger.js';

export class ContactController extends BaseController {
  private contactService: ContactService;

  constructor() {
    super();
    this.contactService = new ContactService();
  }

  async getUserContacts(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.currentUser?._id;
      const userRole = req.currentUser?.role;
      if (!userId || !userRole) {
        this.throwError(400, 'User ID or role not provided');
      }

      const contacts = await this.contactService.getUserContacts(userId.toString());
      this.sendSuccess(res, contacts, 'Contacts retrieved successfully');
    } catch (error: any) {
      logger.error(`Error in getUserContacts: ${error.message}`);
      this.handleError(error, res);
    }
  }
}