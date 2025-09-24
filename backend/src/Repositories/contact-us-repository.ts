import { injectable } from 'inversify';
import { Model } from 'mongoose';
import { BaseRepository } from '../core/Repositries/base-repositry';
import { RepositoryError } from '../core/Utils/error-handler';
import logger from '../core/Utils/logger';
import ContactMessage from '../Models/contact-message-model';
import { IContactMessage } from '../Interfaces/Models/i-contact-message';
import { IContactMessageRepository } from '../Interfaces/Repository/i-contact-message-repositry';
import { StatusCodes } from '../enums/status-code-enums';

@injectable()
export class ContactMessageRepository extends BaseRepository<IContactMessage> implements IContactMessageRepository{
  constructor() {
    super(ContactMessage as Model<IContactMessage>);
  }

   public createContactMessage = async (data: { name: string; email: string; message: string }): Promise<IContactMessage> => {
    try {
      logger.debug(`Creating contact message from: ${data.email}`);
      const message = await this.create({
        ...data,
        givenReply: false,
        createdAt: new Date(),
      });
      logger.info(`Contact message created: ${message._id}`);
      return message;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error creating contact message from ${data.email}`, err);
      throw new RepositoryError('Error creating contact message', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

   public getAllContactMessages = async (): Promise<IContactMessage[]> => {
    try {
      logger.debug('Fetching all contact messages');
      const messages = await this.model.find().sort({ createdAt: -1 }).exec();
      logger.info(`Fetched ${messages.length} contact messages`);
      return messages;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error fetching contact messages`, err);
      throw new RepositoryError('Error fetching contact messages', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }

  public updateReplyStatus = async (contactMessageId: string): Promise<IContactMessage | null> => {
    try {
      logger.debug(`Updating reply status for contact message: ${contactMessageId}`);
      const message = await this.model
        .findByIdAndUpdate(
          contactMessageId,
          { givenReply: true },
          { new: true }
        )
        .exec();
      if (!message) {
        logger.warn(`Contact message not found: ${contactMessageId}`);
        throw new RepositoryError(`Contact message not found with ID: ${contactMessageId}`, StatusCodes.NOT_FOUND);
      }
      logger.info(`Reply status updated for contact message: ${contactMessageId}`);
      return message;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(`Error updating reply status for contact message ${contactMessageId}`, err);
      throw new RepositoryError('Error updating reply status', StatusCodes.INTERNAL_SERVER_ERROR, err);
    }
  }
}