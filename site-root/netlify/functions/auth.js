const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'https://adaudit.xyz/auth/callback'
);

// Generates Google Ads Login URL for Users
exports.handler = async function(event, context) {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/adwords']
  });

  return {
    statusCode: 302,
    headers: {
      Location: url
    },
    body: ''
  };
};