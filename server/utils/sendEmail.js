const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const handleAsync = require("./handleAsync");
const { OAuth2 } = google.auth;
const oauth_link = "https://developers.google.com/oauthplayground";
const { EMAIL, CLIENT_ID, REFRESH_TOKEN, CLIENT_SECRET } = process.env;

const auth = new OAuth2(CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN, oauth_link);

const sendEmail = async option => {
  auth.setCredentials({
    refresh_token: REFRESH_TOKEN,
  });
  const accessToken = await auth.getAccessToken();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: EMAIL,
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      refreshToken: REFRESH_TOKEN,
      accessToken,
    },
  });

  const mailOptions = {
    from: option.from,
    to: option.email,
    subject: option.subject,
    html: `<div style="max-width:700px;margin-bottom:1rem;display:flex;align-items:center;gap:10px;font-family:Roboto;font-weight:600;color:#3b5998"><img src="assets/images/logo.png" alt="" style="width:30px" /><span>Action require : Activate your Inventry account</span></div><div style="padding:1rem 0;border-top:1px solid #e5e5e5;border-bottom:1px solid #e5e5e5;color:#141823;font-size:17px;font-family:Roboto"><span>Hello ${option.name}</span><div style="padding:20px 0"><span style="padding:1.5rem 0">You recently requested for password reset token. If this was a mistake then simply ignore!</span></div><a href=${option.resetURL} style="width:200px;padding:10px 15px;background:#4c649b;color:#fff;text-decoration:none;font-weight:600">Change Password</a><br /><div style="padding-top:20px"><span style="margin:1.5rem 0;color:#898f9c">Inventry allow you to stay in touch with all your products, once registered on Inventry, you can add products, organize them and much more.</span></div></div>`,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
