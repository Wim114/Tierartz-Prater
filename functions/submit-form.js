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

        // Web3Forms configuration
        data.access_key = '5fbb88fc-bac9-4a93-9130-57606dc1f69a';
        data.subject = data.subject || 'Neue Terminanfrage - Tierärztliche Ambulanz';
        data.from_name = data.from_name || 'Tierärztliche Ambulanz Website';

        // Add replyto if email is provided
        if (data.email) {
            data.replyto = data.email;
        }

        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        });

        // Get raw response text first
        const responseText = await response.text();

        // Log full response for debugging
        console.log('Web3Forms response status:', response.status);
        console.log('Web3Forms response:', responseText);

        // Try to parse as JSON
        let result;
        try {
            result = JSON.parse(responseText);
        } catch (parseError) {
            // Response is not JSON (likely HTML error page)
            console.error('Web3Forms returned non-JSON response. Status:', response.status);
            console.error('Full response body:', responseText);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({
                    success: false,
                    message: 'Email service returned an invalid response. Please try again later.',
                    debug: {
                        status: response.status,
                        preview: responseText.substring(0, 200)
                    }
                })
            };
        }

        // Check if Web3Forms returned an error
        if (!response.ok || result.success === false) {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: false,
                    message: result.message || 'Failed to send email. Please try again.'
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
        console.error('Form submission error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                message: 'Server error: Unable to process your request. Please try again.'
            })
        };
    }
};
