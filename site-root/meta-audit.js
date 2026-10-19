const https = require('https');

exports.handler = async function(event, context) {
  try {
    const accessToken = event.headers.authorization || event.queryStringParameters?.token;
    const adAccountId = process.env.META_AD_ACCOUNT_ID; // നിങ്ങളുടെ Meta Ad Account ID (act_xxxxxxxxxx എന്ന ഫോർമാറ്റിൽ)

    if (!accessToken) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Meta Access Token missing. Please connect Meta Ads.' })
      };
    }

    if (!adAccountId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Meta Ad Account ID not configured in Netlify environment variables.' })
      };
    }

    // Meta Graph API വഴി ലൈവ് ക്യാമ്പെയ്ൻ ഡാറ്റ ഫെച്ച് ചെയ്യുക
    const apiResult = await new Promise((resolve, reject) => {
      const path = `/v18.0/${adAccountId}/campaigns?fields=id,name,status,objective&access_token=${accessToken}`;
      
      const options = {
        hostname: 'graph.facebook.com',
        path: path,
        method: 'GET'
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error('Failed to parse Meta Graph API response: ' + data));
          }
        });
      });

      req.on('error', (e) => { reject(e); });
      req.end();
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true, 
        platform: 'Meta Ads',
        message: 'Live Meta Ads campaigns fetched successfully',
        raw_data: apiResult 
      }),
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};