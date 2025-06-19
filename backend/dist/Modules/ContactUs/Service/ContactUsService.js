import { BaseService } from '../../../core/Services/BaseService.js';
import { ServiceError } from '../../../core/Utils/ErrorHandler.js';
import logger from '../../../core/Utils/Logger.js';
import { ContactMessageRepository } from '../Repositry/ContactUsRepositry.js';
import { sendEmail } from '../../../core/Utils/Email.js';
import config from '../../../config/env.config.js';
export class ContactMessageService extends BaseService {
    contactMessageRepo;
    constructor() {
        super();
        this.contactMessageRepo = new ContactMessageRepository();
    }
    async createContactMessage(data) {
        try {
            logger.debug(`Creating contact message from: ${data.email}`);
            this.checkData(data);
            const ReceiverEmail = config.adminEmail;
            if (!ReceiverEmail) {
                logger.error('Receiver email not configured');
                throw new ServiceError('Receiver email required');
            }
            const contactMessage = await this.contactMessageRepo.createContactMessage(data);
            const emailText = `New Contact Message\n\nName: ${data.name}\nEmail: ${data.email}\nMessage: ${data.message}\n\nSent at: ${new Date().toLocaleString()}`;
            await sendEmail(ReceiverEmail, 'New Contact Message from ConnectSphere', emailText);
            return contactMessage;
        }
        catch (error) {
            logger.error(`Error processing contact message: ${error.message}`);
            throw new ServiceError(`Error processing contact message: ${error.message}`);
        }
    }
    async getAllContactMessages() {
        try {
            logger.debug('Fetching all contact messages');
            return await this.contactMessageRepo.getAllContactMessages();
        }
        catch (error) {
            logger.error(`Error fetching contact messages: ${error.message}`);
            throw new ServiceError(`Error fetching contact messages: ${error.message}`);
        }
    }
    async sendReply(contactMessageId, replyData) {
        try {
            logger.debug(`Sending reply for contact message: ${contactMessageId}`);
            this.checkData({ contactMessageId, ...replyData });
            const updatedMessage = await this.contactMessageRepo.updateReplyStatus(contactMessageId);
            await sendEmail(replyData.email, 'Reply from ConnectSphere', `Hello ${updatedMessage.name},\n\n${replyData.replyMessage}\n\nBest regards,\nConnectSphere Team`);
            return updatedMessage;
        }
        catch (error) {
            logger.error(`Error sending reply: ${error.message}`);
            throw new ServiceError(`Error sending reply: ${error.message}`);
        }
    }
}
//# sourceMappingURL=ContactUsService.js.map