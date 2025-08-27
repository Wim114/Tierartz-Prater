const { neon } = require('@neondatabase/serverless');

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, headers, body: 'Method Not Allowed' };
    }

    try {
        const sql = neon(process.env.DATABASE_URL);

        // Get all announcements
        const announcements = await sql`
            SELECT * FROM announcements
            WHERE start_date <= NOW()
            AND end_date >= NOW()
            AND is_active = true
            ORDER BY created_at DESC
        `;

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(announcements)
        };
    } catch (error) {
        console.error('Database error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to fetch announcements' })
        };
    }
};
