
exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    try {
        const { password } = JSON.parse(event.body);
        
        // Get password from environment variable (secure)
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
        
        if (!ADMIN_PASSWORD) {
            console.error('ADMIN_PASSWORD not set in environment variables');
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'Server configuration error' })
            };
        }
        
        const isValid = password === ADMIN_PASSWORD;
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ valid: isValid })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Server error' })
        };
    }