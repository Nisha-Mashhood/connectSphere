import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { BaseController } from '../core/controller/base-controller';
import logger from '../core/utils/logger';
import { IContactController } from '../Interfaces/Controller/i-contact-controller';
import { HttpError } from '../core/utils/error-handler';
import { StatusCodes } from "../enums/status-code-enums";
import { IContactService } from '../Interfaces/Services/i-contact-service';
import { ERROR_MESSAGES } from '../constants/error-messages';
import { CONTACT_MESSAGES } from '../constants/messages';

@injectable()
export class ContactController extends BaseController implements IContactController{
  private _contactService: IContactService;

  constructor(@inject('IContactService') contactService : IContactService) {
    super();
    this._contactService = contactService;
  }

   getUserContacts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.currentUser?._id;
      const userRole = req.currentUser?.role;
      if (!userId || !userRole) {
        throw new HttpError(ERROR_MESSAGES.REQUIRED_USER_ID_OR_ROLE, StatusCodes.BAD_REQUEST);
      }

      const contacts = await this._contactService.getUserContacts(userId?.toString());
      if (contacts.length === 0) {
        this.sendSuccess(res, [], CONTACT_MESSAGES.NO_CONTACTS_FOUND);
        logger.info(`No contacts found for userId: ${userId}`);
        return;
      }
      this.sendSuccess(res, contacts, CONTACT_MESSAGES.CONTACTS_RETRIEVED);
    } catch (error: any) {
      logger.error(`Error in getUserContacts: ${error.message}`);
      next(error);
    }
  };
}