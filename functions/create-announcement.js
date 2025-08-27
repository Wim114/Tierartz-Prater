const { neon } = require('@neondatabase/serverless');

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: 'Method Not Allowed' };
    }

    // Check authentication
    const { user } = context.clientContext;
    if (!user || !user.app_metadata?.roles?.includes('admin')) {
        return {
            statusCode: 401,
            headers,
            body: JSON.stringify({ error: 'Unauthorized' })
        };
    }

    try {
        const data = JSON.parse(event.body);
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
                is_active
            ) VALUES (
                ${data.type},
                ${data.title},
                ${data.message},
                ${data.substitute || null},
                ${data.startDate},
                ${data.endDate},
                ${user.email},
                true
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
            body: JSON.stringify({ error: 'Failed to create announcement' })
        };
    }
};
