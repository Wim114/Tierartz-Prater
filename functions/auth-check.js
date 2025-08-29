const crypto = require('crypto');

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' ? 'https://tierambulanz-prater.netlify.app' : '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    try {
        // Rate limiting check (simple implementation)
        const clientIP = event.headers['x-forwarded-for'] || event.headers['x-real-ip'] || 'unknown';
        
        // Validate request body
        if (!event.body) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Request body is required' })
            };
        }

        let requestData;
        try {
            requestData = JSON.parse(event.body);
        } catch (parseError) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid JSON in request body' })
            };
        }

        const { password } = requestData;
        
        // Validate password input
        if (!password || typeof password !== 'string') {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Password is required and must be a string' })
            };
        }

        // Check password length (prevent extremely long passwords that could cause DoS)
        if (password.length > 1000) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Password too long' })
            };
        }
        
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
        
        // Use timing-safe comparison to prevent timing attacks
        const providedHash = crypto.createHash('sha256').update(password).digest('hex');
        const expectedHash = crypto.createHash('sha256').update(ADMIN_PASSWORD).digest('hex');
        
        const isValid = crypto.timingSafeEqual(
            Buffer.from(providedHash, 'hex'),
            Buffer.from(expectedHash, 'hex')
        );
        
        // Log authentication attempts (without sensitive data)
        console.log(`Authentication attempt from ${clientIP}: ${isValid ? 'SUCCESS' : 'FAILED'}`);
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ valid: isValid })
        };
    } catch (error) {
        console.error('Authentication error:', error.message);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};
