export async function handler(event, context) {
    const clientId = process.env.FACEBOOK_CLIENT_ID;
    const clientSecret = process.env.FACEBOOK_CLIENT_SECRET;
    const redirectUri = 'https://adaudit.xyz/.netlify/functions/meta-auth';

    const code = event.queryStringParameters.code;

    if (!code) {
        // Step 1: Redirect user to Facebook OAuth Login
        const fbAuthUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=ads_management,ads_read,business_management`;
        return {
            statusCode: 302,
            headers: {
                Location: fbAuthUrl,
            },
        };
    }

    try {
        // Step 2: Exchange Authorization Code for Access Token
        const tokenUrl = `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${clientSecret}&code=${code}`;
        const tokenRes = await fetch(tokenUrl);
        const tokenData = await tokenRes.json();

        if (tokenData.access_token) {
            // Successfully authenticated, redirect back to dashboard with success status
            return {
                statusCode: 302,
                headers: {
                    Location: 'https://adaudit.xyz/?meta_connected=true',
                },
            };
        } else {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Failed to obtain access token', details: tokenData }),
            };
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
}