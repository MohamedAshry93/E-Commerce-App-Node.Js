import nodemailer from "nodemailer";

const sendEmailService = async ({
    to,
    cc,
    subject,
    text,
    html,
    attachments,
} = {}) => {
    //? create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
        service: "gmail",
        host: "localhost",
        port: 587,
        secure: false,
        auth: {
            user: process.env.USER_EMAIL,
            pass: process.env.USER_PASS,
        },
    });
    //? send mail with defined transport object
    const info = await transporter.sendMail({
        from: '"3shry 👀" <mohamedashry593@gmail.com>', // sender address
        to: to ? to : "",
        cc: cc ? cc : "",
        subject: subject ? subject : "hi 👋",
        text: text ? text : "hello from Ashry 👋",
        html: html ? html : "<h1>Welcome to our app ✍️</h1>",
        attachments: attachments ? attachments : [],
    });
    return info;
};

export { sendEmailService };
