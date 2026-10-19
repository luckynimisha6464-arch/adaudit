const { google } = require('googleapis');

exports.handler = async function(event, context) {
  try {
    const accessToken = event.headers.authorization || event.queryStringParameters?.token;
    const developerToken = process.env.GOOGLE_DEVELOPER_TOKEN;
    const customerId = process.env.GOOGLE_CUSTOMER_ID; // നിങ്ങളുടെ Google Ads Customer ID (hyphens ഇല്ലാതെ)

    if (!accessToken) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Google Access Token missing. Please connect Google Ads.' })
      };
    }

    if (!developerToken || !customerId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Google Developer Token or Customer ID not configured in Netlify environment variables.' })
      };
    }

    // Google Ads API v14/v15 REST endpoint വഴി ലൈവ് ഡാറ്റ ഫെച്ച് ചെയ്യുക
    const https = require('https');
    
    const query = "SELECT campaign.id, campaign.name, campaign.status, metrics.clicks, metrics.cost_micros FROM campaign WHERE campaign.status = 'ENABLED'";
    
    const postData = JSON.stringify({ query: query });

    const options = {
      hostname: 'googleads.googleapis.com',
      path: `/v15/customers/${customerId}/googleAds:searchStream`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'developer-token': developerToken,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    // API Call നിർവ്വഹിക്കുന്നു
    const apiResult = await new Promise((resolve, reject) => {
      let data = '';
      const req = https.request(options, (res) => {
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error('Failed to parse Google Ads API response: ' + data));
          }
        });
      });

      req.on('error', (e) => { reject(e); });
      req.write(postData);
      req.end();
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        platform: 'Google Ads',
        message: 'Live Google Ads campaigns fetched successfully',
        raw_data: apiResult 
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};