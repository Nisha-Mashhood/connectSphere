import { injectable } from 'inversify';
import { Model, PipelineStage } from 'mongoose';
import { BaseRepository } from '../core/repositries/base-repositry';
import { RepositoryError } from '../core/utils/error-handler';
import logger from '../core/utils/logger';
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

   public async getAllContactMessages({
  page = 1,
  limit = 10,
  search = "",
  dateFilter = "all",
}: {
  page?: number;
  limit?: number;
  search?: string;
  dateFilter?: "today" | "7days" | "30days" | "all";
}): Promise<{ messages: IContactMessage[]; total: number; page: number; pages: number }> {
  try {
    logger.debug(
      `Fetching contact messages (page=${page}, limit=${limit}, search=${search}, dateFilter=${dateFilter})`
    );

    const matchStage: any = {};

    if (search.trim() !== "") {
      matchStage.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ];
    }

    if (dateFilter !== "all") {
      const now = new Date();

      let startDate: Date | null = null;

      if (dateFilter === "today") {
        startDate = new Date(now.setHours(0, 0, 0, 0));
      } else if (dateFilter === "7days") {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (dateFilter === "30days") {
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      if (startDate) {
        matchStage.createdAt = { $gte: startDate };
      }
    }

    const pipeline: PipelineStage[] = [
      { $match: matchStage },

      { $sort: { createdAt: -1 } },

      {
        $facet: {
          messages: [
            { $skip: (page - 1) * limit },
            { $limit: limit },
            {
              $project: {
                _id: 1,
                contactMessageId: 1,
                name: 1,
                email: 1,
                message: 1,
                createdAt: 1,
                givenReply: 1,
              },
            },
          ],
          total: [{ $count: "count" }],
        },
      },
    ];

    const result = await this.model.aggregate(pipeline).exec();

    const messages = result[0]?.messages || [];
    const total = result[0]?.total[0]?.count || 0;

    return {
      messages: messages as IContactMessage[],
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  } catch (error) {
    logger.error("Error fetching paginated contact messages", error);
    throw new RepositoryError(
      "Error fetching paginated contact messages",
      StatusCodes.INTERNAL_SERVER_ERROR,
      error as Error
    );
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