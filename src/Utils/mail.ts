import nodemailer from "nodemailer";
import { google } from "googleapis";
import SMTPTransport from "nodemailer/lib/smtp-transport";

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN});

export const mail = async ({ name, email, otp } : { name: string, email: string, otp: string }) => {
    const sendMail = async () => {
        try {
            const accessToken = await oAuth2Client.getAccessToken();
    
            const transport = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    type: 'OAuth2',
                    user: 'clinsti2021@gmail.com',
                    clientId: CLIENT_ID,
                    clientSecret: CLIENT_SECRET,
                    refreshToken: REFRESH_TOKEN,
                    accessToken: accessToken,
                },
            }  as SMTPTransport.Options);
    
            const mailOptions = {
                from: 'clinsti2021@gmail.com',
                fromName: 'Clinsti',
                to: email,
                subject: 'IIT Madras || CLinsti',
                text: `Hey ${name}!, Your OTP: ${otp}`,
                html: `<h1>Hey ${name}!</h1><p>Your OTP: <b>${otp}</b></p><p>Regards,</p><p>CLisnti team</p>`
            };
            const result = await transport.sendMail(mailOptions);
            return result;
        } catch (error) {
            return error;
        }
    }
    sendMail()
    .then((result) => console.log("Email sent...", result))
    .catch((error) => console.log(error.message));
}