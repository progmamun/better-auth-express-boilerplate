/* eslint-disable @typescript-eslint/no-explicit-any */
import ejs from 'ejs';
import nodemailer from 'nodemailer';
import path from 'path';
import { envVars } from '../config/env';
import ApiError from '../errors/ApiError';
import { StatusCodes } from 'http-status-codes';

const transporter = nodemailer.createTransport({
  host: envVars.EMAIL_SENDER.SMTP_HOST,
  secure: true,
  port: Number(envVars.EMAIL_SENDER.SMTP_PORT),
  auth: {
    user: envVars.EMAIL_SENDER.SMTP_USER,
    pass: envVars.EMAIL_SENDER.SMTP_PASS,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  templateName: string;
  templateData: Record<string, any>;
  attachments?: {
    filename: string;
    content: Buffer | string;
    contentType: string;
  }[];
}

export const sendEmail = async ({
  subject,
  templateData,
  templateName,
  to,
  attachments,
}: SendEmailOptions) => {
  try {
    const templatePath = path.resolve(
      process.cwd(),
      `src/app/templates/${templateName}.ejs`
    );

    const html = await ejs.renderFile(templatePath, templateData);

    const info = await transporter.sendMail({
      from: `"SMT" <${envVars.EMAIL_SENDER.SMTP_FROM}>`,
      to: to,
      subject: subject,
      html: html,
      attachments: attachments?.map(attachment => ({
        filename: attachment.filename,
        content: attachment.content,
        contentType: attachment.contentType,
      })),
    });

    console.log(`Email sent to ${to} : ${info.messageId}`);
  } catch (error: any) {
    console.log('Email Sending Error', error.message);
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to send email'
    );
  }
};
