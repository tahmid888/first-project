import nodemailer from 'nodemailer';
import config from '../config';

export const sendEmail = async (to: string, html: string) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com.',
    port: 587,
    secure: config.NODE_ENV === 'production',
    auth: {
      // TODO: replace `user` and `pass` values from <https://forwardemail.net>
      user: 'tahmidulhaque91@gmail.com',
      pass: 'hfwz zmdf sjny oeit',
    },
  });

  await transporter.sendMail({
    from: 'tahmidulhaque91@gmail.com', // sender address
    to, // list of receivers
    subject: 'Reset your password within ten mins!', // Subject line
    text: 'Change it ASAP', // plain text body
    html, // html body
  });
};
