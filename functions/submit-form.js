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
        // Parse incoming form data
        let data;
        try {
            data = JSON.parse(event.body);
        } catch (parseError) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    message: 'Invalid JSON in request body'
                })
            };
        }

        // Add Web3Forms access key
        data.access_key = '5fbb88fc-bac9-4a93-9130-57606dc1f69a';

        // Submit to Web3Forms
        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        });

        // Get response as text first to handle non-JSON responses
        const responseText = await response.text();

        // Try to parse as JSON
        let result;
        try {
            result = JSON.parse(responseText);
        } catch (jsonError) {
            // Web3Forms returned non-JSON (likely HTML error page)
            console.error('Web3Forms non-JSON response:', responseText.substring(0, 500));
            return {
                statusCode: 502,
                headers,
                body: JSON.stringify({
                    success: false,
                    message: 'Email service returned an invalid response. Please try again later.',
                    debug: response.status + ' ' + response.statusText
                })
            };
        }

        // Check if Web3Forms reported an error
        if (!response.ok || result.success === false) {
            return {
                statusCode: response.ok ? 200 : 502,
                headers,
                body: JSON.stringify({
                    success: false,
                    message: result.message || 'Email service error',
                    debug: result
                })
            };
        }

        // Success
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: result.message || 'Form submitted successfully'
            })
        };
    } catch (error) {
        console.error('Function error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                message: 'Server error. Please try again later.',
                debug: error.message
            })
        };
    }
};
