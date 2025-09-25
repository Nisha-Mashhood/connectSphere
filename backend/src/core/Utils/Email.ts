import nodemailer from 'nodemailer';
import config from '../../config/env-config';
import logger from './logger';

const transporter = nodemailer.createTransport({
  service: config.emailService,
  auth: {
    user: config.emailUser ,
    pass: config.emailPassword, 
  },
});

export const sendEmail = async (to: string | undefined, subject: string, text: string) => {

  if(!to){
    throw new Error(' To address is undefined Failed to send Email');
  }
  try {
    await transporter.sendMail({
      from:config.emailUser,
      to,
      subject,
      text,
    });
  } catch (error) {
    logger.info(error);
    throw new Error('Failed to send email.');
  }
};

