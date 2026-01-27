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
        const data = JSON.parse(event.body);
        data.access_key = process.env.WEB3FORMS_KEY || '5fbb88fc-bac9-4a93-9130-57606dc1f69a';

        // Use native fetch (Node.js 18+)
        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        });

        // Get raw text first to handle non-JSON responses
        const responseText = await response.text();

        let result;
        try {
            result = JSON.parse(responseText);
        } catch (parseError) {
            // Web3Forms returned non-JSON (likely error page)
            console.error('Web3Forms returned non-JSON:', responseText.substring(0, 500));
            return {
                statusCode: 502,
                headers,
                body: JSON.stringify({
                    success: false,
                    message: 'Web3Forms API returned an invalid response. Status: ' + response.status,
                    debug: responseText.substring(0, 200)
                })
            };
        }

        // Return response from Web3Forms
        return {
            statusCode: response.ok ? 200 : 400,
            headers,
            body: JSON.stringify({
                success: result.success === true,
                message: result.message || (result.success ? 'Form submitted successfully' : 'Submission failed'),
                data: result
            })
        };
    } catch (error) {
        console.error('Submit form error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                message: 'Server error: ' + error.message,
                errorType: error.name
            })
        };
    }
};
