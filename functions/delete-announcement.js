const { neon } = require('@neondatabase/serverless');

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod !== 'DELETE') {
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
        const id = event.queryStringParameters.id;
        const sql = neon(process.env.DATABASE_URL);

        await sql`
            DELETE FROM announcements
            WHERE id = ${id}
        `;

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true })
        };
    } catch (error) {
        console.error('Database error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to delete announcement' })
        };
    }
};
