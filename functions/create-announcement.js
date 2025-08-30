// functions/create-announcement.js
const { neon } = require('@neondatabase/serverless');

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Auth',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle OPTIONS request for CORS
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    // Simple authentication check
    const adminAuth = event.headers['x-admin-auth'] || event.headers['X-Admin-Auth'];
    if (adminAuth !== 'true') {
        return {
            statusCode: 401,
            headers,
            body: JSON.stringify({ error: 'Unauthorized' })
        };
    }

    try {
        const data = JSON.parse(event.body);

        // Validate required fields
        if (!data.type || !data.title || !data.message || !data.startDate || !data.endDate) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Missing required fields' })
            };
        }

        const sql = neon(process.env.DATABASE_URL);

        const result = await sql`
            INSERT INTO announcements (
                type,
                title,
                message,
                substitute,
                start_date,
                end_date,
                created_by,
                is_active,
                created_at
            ) VALUES (
                ${data.type},
                ${data.title},
                ${data.message},
                ${data.substitute || null},
                ${data.startDate},
                ${data.endDate},
                'admin',
                true,
                NOW()
            ) RETURNING *
        `;

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(result[0])
        };
    } catch (error) {
        console.error('Database error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Failed to create announcement',
                details: error.message
            })
        };
    }
};
