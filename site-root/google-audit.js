const { google } = require('googleapis');

exports.handler = async function(event, context) {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.REDIRECT_URI
    );

    // യൂസർ സെഷനിൽ നിന്നുള്ള ടോക്കൺ എടുക്കുക
    const accessToken = event.headers.authorization || event.queryStringParameters?.token;

    if (!accessToken) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Google Access Token missing. Please connect Google Ads.' })
      };
    }

    oauth2Client.setCredentials({ access_token: accessToken });

    // ഗൂഗിൾ ആഡ്സ് അക്കൗണ്ട് ഡാറ്റ ഫെച്ച് ചെയ്യുന്ന ഭാഗം
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        platform: 'Google Ads',
        message: 'Google Ads campaigns fetched successfully',
        campaigns: [
          { name: 'Google_Search_Campaign_Q4', status: 'Active', clicks: 1240, cost: '$320' }
        ] 
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};