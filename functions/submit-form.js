exports.handler = async (event, context) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
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

        // Add Web3Forms required fields
        data.access_key = '5fbb88fc-bac9-4a93-9130-57606dc1f69a';
        data.subject = 'Neue Terminanfrage - Tierarzt Prater';
        data.from_name = data.fullName || 'Website Besucher';

        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        return {
            statusCode: response.ok ? 200 : 400,
            headers,
            body: JSON.stringify({
                success: result.success,
                message: result.message || 'Form submitted'
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
