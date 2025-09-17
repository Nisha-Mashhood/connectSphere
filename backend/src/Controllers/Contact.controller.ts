import { NextFunction, Request, Response } from 'express';
import { inject } from 'inversify';
import { BaseController } from '../Core/Controller/BaseController';
import logger from '../Core/Utils/Logger';
import { IContactController } from '../Interfaces/Controller/IContactController';
import { HttpError } from '../Core/Utils/ErrorHandler';
import { StatusCodes } from "../Enums/StatusCode.enums";
import { IContactService } from '../Interfaces/Services/IContactService';

export class ContactController extends BaseController implements IContactController{
  private _contactService: IContactService;

  constructor(@inject('IContactService') contactService : IContactService) {
    super();
    this._contactService = contactService;
  }

    getUserContacts = async(req: Request, res: Response, next:NextFunction): Promise<void> =>{
    try {
      const userId = req.currentUser?._id;
      const userRole = req.currentUser?.role;
      if (!userId || !userRole) {
        throw new HttpError('User ID or role not provided', StatusCodes.BAD_REQUEST);
      }

      const contacts = await this._contactService.getUserContacts(userId?.toString());
      if (contacts.length === 0) {
        this.sendSuccess(res, [], 'No contacts found');
        logger.info(`No contacts found for userId: ${userId}`);
        return;
      }
      this.sendSuccess(res, contacts, 'Contacts retrieved successfully');
    } catch (error: any) {
      logger.error(`Error in getUserContacts: ${error.message}`);
      next(error)
    }
  }
}