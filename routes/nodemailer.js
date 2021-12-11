const nodemailer = require("nodemailer");
const {google} = require("googleapis");

const CLIENT_ID = `79373080637-1vc2s82kccsp1s7mn7nm6efmsj7623l1.apps.googleusercontent.com`;

const CLIENT_SECRET = `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`;
const REDIRECT_URI = `https://developers.google.com/oauthplayground`;
const REFRESH_TOKEN = `1//04d-kOM0nEYiUCgYIARAAGAQSNwF-L9IrILuwmLHfJ17jozAj8Pfkv9zRjB6icTaPr67BJ2i6dn20wCluO_UyvCanb8fWgqddlhA`

const oauthclient = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oauthclient.setCredentials({refresh_token: REFRESH_TOKEN});

async function sendMail(receiver, text){ 
  try{
    const access_token = await oauthclient.getAccessToken();
    const transport = await nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: "OAuth2",
        user:"",
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: access_token
      }
    })
    const mailOpts = {
      from: "shrivastavshourya28@gmail.com",
      to:"shrivastavshourya28@gmail.com",
      subject: "msg",
      text: "hello there !!",
      html: text
    }
    const result = transport.sendMail(mailOpts);
  }
  catch(err){ next (err)}
}

module.exports = sendMail;