const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
};

exports.handler = async (event, context) => {
    // Handle preflight OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ success: false, message: 'Method Not Allowed' })
        };
    }

    try {
        // Check if API key is configured
        const apiKey = process.env.WEB3FORMS_KEY;
        if (!apiKey) {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({
                    success: false,
                    message: 'Configuration error: WEB3FORMS_KEY not set'
                })
            };
        }

        const data = JSON.parse(event.body);
        data.access_key = apiKey;

        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        // Get raw text first to debug non-JSON responses
        const responseText = await response.text();

        // Try to parse as JSON
        let result;
        try {
            result = JSON.parse(responseText);
        } catch (parseError) {
            return {
                statusCode: 502,
                headers,
                body: JSON.stringify({
                    success: false,
                    message: 'Web3Forms returned invalid response',
                    status: response.status,
                    rawResponse: responseText.substring(0, 500)
                })
            };
        }

        // Check if Web3Forms returned an error
        if (!result.success) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    message: result.message || 'Web3Forms rejected the submission',
                    data: result
                })
            };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: result.message || 'Form submitted successfully',
                data: result
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                message: 'Server error: ' + error.message
            })
        };
    }
};
