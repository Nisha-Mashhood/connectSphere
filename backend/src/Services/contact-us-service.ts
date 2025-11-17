import { inject, injectable } from "inversify";
import { Types } from "mongoose";
import config from "../config/env-config";
import { StatusCodes } from "../enums/status-code-enums";
import { sendEmail } from "../core/utils/email";
import logger from "../core/utils/logger";
import { ServiceError } from "../core/utils/error-handler";
import { IContactMessageService } from "../Interfaces/Services/i-contact-message-service";
import { IContactMessageRepository } from "../Interfaces/Repository/i-contact-message-repositry";
import { IContactMessageDTO } from "../Interfaces/DTOs/i-contact-message-dto";
import { toContactMessageDTO, toContactMessageDTOs } from "../Utils/mappers/contact-message-mapper";

@injectable()
export class ContactMessageService implements IContactMessageService{
  private contactMessageRepo: IContactMessageRepository;

  constructor(@inject('IContactMessageRepository') contactMessageRepository : IContactMessageRepository) {
    this.contactMessageRepo = contactMessageRepository;
  }

  public createContactMessage = async (data: {
    name: string;
    email: string;
    message: string;
  }): Promise<IContactMessageDTO> => {
    try {
      logger.debug(`Creating contact message from: ${data.email}`);

      if (!data.name || !data.email || !data.message) {
        logger.error("Missing required fields: name, email, or message");
        throw new ServiceError(
          "Name, email, and message are required",
          StatusCodes.BAD_REQUEST
        );
      }

      const ReceiverEmail = config.adminEmail;
      if (!ReceiverEmail) {
        logger.error("Receiver email not configured");
        throw new ServiceError(
          "Receiver email required",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
      }

      const contactMessage = await this.contactMessageRepo.createContactMessage(
        data
      );
      const contactMessageDTO = toContactMessageDTO(contactMessage);
      if (!contactMessageDTO) {
        logger.error(`Failed to map contact message ${contactMessage._id} to DTO`);
        throw new ServiceError(
          "Failed to map contact message to DTO",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
      }

      const emailText = `New Contact Message\n\nName: ${data.name}\nEmail: ${
        data.email
      }\nMessage: ${data.message}\n\nSent at: ${new Date().toLocaleString()}`;
      await sendEmail(
        ReceiverEmail,
        "New Contact Message from ConnectSphere",
        emailText
      );
      logger.info(`Email sent to admin: ${ReceiverEmail}`);

      logger.info(`Contact message created: ${contactMessage._id}`);
      return contactMessageDTO;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(
        `Error processing contact message from ${data.email}: ${err.message}`
      );
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to process contact message",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };

  public getAllContactMessages = async ({
  page = 1,
  limit = 10,
  search = "",
  dateFilter = "all",
}: {
  page?: number;
  limit?: number;
  search?: string;
  dateFilter?: "today" | "7days" | "30days" | "all";
}): Promise<{
  messages: IContactMessageDTO[];
  total: number;
  page: number;
  pages: number;
}> => {
  try {
    logger.debug(
      `Service: Fetching contact messages with pagination/search/filter`
    );

    const { messages, total, page: currentPage, pages } =
      await this.contactMessageRepo.getAllContactMessages({
        page,
        limit,
        search,
        dateFilter,
      });

    const messagesDTO = toContactMessageDTOs(messages);

    return {
      messages: messagesDTO,
      total,
      page: currentPage,
      pages,
    };
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));

    logger.error(`Error fetching contact messages: ${err.message}`);

    throw new ServiceError(
      "Failed to fetch contact messages",
      StatusCodes.INTERNAL_SERVER_ERROR,
      err
    );
  }
};

  public sendReply = async (
    contactMessageId: string,
    replyData: { email: string; replyMessage: string }
  ): Promise<IContactMessageDTO> => {
    try {
      logger.debug(`Sending reply for contact message: ${contactMessageId}`);

      if (!Types.ObjectId.isValid(contactMessageId)) {
        logger.error("Invalid contact message ID");
        throw new ServiceError(
          "Invalid contact message ID: must be a 24 character hex string",
          StatusCodes.BAD_REQUEST
        );
      }

      if (!replyData.email || !replyData.replyMessage) {
        logger.error("Missing required fields: email or reply message");
        throw new ServiceError(
          "Email and reply message are required",
          StatusCodes.BAD_REQUEST
        );
      }

      const updatedMessage = await this.contactMessageRepo.updateReplyStatus(
        contactMessageId
      );
      if (!updatedMessage) {
        logger.error(`Contact message not found: ${contactMessageId}`);
        throw new ServiceError(
          "Contact message not found",
          StatusCodes.NOT_FOUND
        );
      }

      const updatedMessageDTO = toContactMessageDTO(updatedMessage);
      if (!updatedMessageDTO) {
        logger.error(`Failed to map contact message ${updatedMessage._id} to DTO`);
        throw new ServiceError(
          "Failed to map contact message to DTO",
          StatusCodes.INTERNAL_SERVER_ERROR
        );
      }

      await sendEmail(
        replyData.email,
        "Reply from ConnectSphere",
        `Hello ${updatedMessage.name},\n\n${replyData.replyMessage}\n\nBest regards,\nConnectSphere Team`
      );
      logger.info(`Reply email sent to: ${replyData.email}`);

      logger.info(`Reply sent for contact message: ${contactMessageId}`);
      return updatedMessageDTO;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error(
        `Error sending reply for contact message ${contactMessageId}: ${err.message}`
      );
      throw error instanceof ServiceError
        ? error
        : new ServiceError(
            "Failed to send reply",
            StatusCodes.INTERNAL_SERVER_ERROR,
            err
          );
    }
  };
}
