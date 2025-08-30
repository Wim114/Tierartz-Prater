// functions/get-announcements.js
const { neon } = require('@neondatabase/serverless');

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle OPTIONS request for CORS
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    try {
        const sql = neon(process.env.DATABASE_URL);

        const announcements = await sql`
            SELECT * FROM announcements
            ORDER BY created_at DESC
        `;

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(announcements)
        };
    } catch (error) {
        console.error('Database error:', error);

        // Return empty array on error so the site doesn't break
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify([])
        };
    }
};
