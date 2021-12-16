const nodemailer = require("nodemailer");
const {google} = require("googleapis");

const CLIENT_ID = `79373080637-1vc2s82kccsp1s7mn7nm6efmsj7623l1.apps.googleusercontent.com`;

const CLIENT_SECRET = `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`;
const REDIRECT_URI = `https://developers.google.com/oauthplayground`;
const REFRESH_TOKEN = `1//044lV2eEZO2HnCgYIARAAGAQSNwF-L9IrjUEu0o3uvDMO14HgU3XAhg1tdTqglSdibXV0UNY5WIwWSpsIHRpTCuu2NbZNH_AX04U`

const oauthclient = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oauthclient.setCredentials({refresh_token: REFRESH_TOKEN});

async function sendMail(receiver, text){ 
  try{
    const access_token = await oauthclient.getAccessToken();
    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: "OAuth2",
        user:"shrivastavshourya28@gmail.com",
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: access_token
      }
    })
    const mailOpts = {
      from: "shrivastavshourya28@gmail.com",
      to:receiver,
      subject: "msg",
      text: "hello there !!",
      html: text
    }
    const result = await transport.sendMail(mailOpts);
  }
  catch(err){ return (err)}
}

module.exports = sendMail;