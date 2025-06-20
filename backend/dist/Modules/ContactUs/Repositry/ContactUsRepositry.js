import { BaseRepository } from '../../../core/Repositries/BaseRepositry.js';
import { RepositoryError } from '../../../core/Utils/ErrorHandler.js';
import logger from '../../../core/Utils/Logger.js';
import ContactMessage from '../../../models/ContactMessage.modal.js';
export class ContactMessageRepository extends BaseRepository {
    constructor() {
        super(ContactMessage);
    }
    createContactMessage = async (data) => {
        try {
            logger.debug(`Creating contact message from: ${data.email}`);
            return await this.create({
                ...data,
                givenReply: false,
                createdAt: new Date(),
            });
        }
        catch (error) {
            logger.error(`Error creating contact message: ${error.message}`);
            throw new RepositoryError(`Failed to save contact message: ${error.message}`);
        }
    };
    getAllContactMessages = async () => {
        try {
            logger.debug('Fetching all contact messages');
            return await this.model.find().sort({ createdAt: -1 }).exec();
        }
        catch (error) {
            logger.error(`Error fetching contact messages: ${error.message}`);
            throw new RepositoryError(`Failed to fetch contact messages: ${error.message}`);
        }
    };
    updateReplyStatus = async (contactMessageId) => {
        try {
            logger.debug(`Updating reply status for contact message: ${contactMessageId}`);
            const message = await this.model
                .findOneAndUpdate({ contactMessageId }, { givenReply: true }, { new: true })
                .exec();
            if (!message) {
                logger.error(`Contact message not found: ${contactMessageId}`);
                throw new RepositoryError('Contact message not found');
            }
            return message;
        }
        catch (error) {
            logger.error(`Error updating reply status: ${error.message}`);
            throw new RepositoryError(`Failed to update reply status: ${error.message}`);
        }
    };
}
//# sourceMappingURL=ContactUsRepositry.js.map