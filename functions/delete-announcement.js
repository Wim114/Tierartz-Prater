// functions/delete-announcement.js
const { neon } = require('@neondatabase/serverless');

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' ? 'https://tierambulanz-prater.netlify.app' : '*',
        'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Auth',
        'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
        'Content-Type': 'application/json',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
    };

    // Handle OPTIONS request for CORS
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'DELETE') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    // Simple authentication check
    const adminAuth = event.headers['x-admin-auth'] || event.headers['X-Admin-Auth'];
    console.log('Delete request - Auth header:', adminAuth);
    if (adminAuth !== 'true') {
        console.log('Delete request unauthorized');
        return {
            statusCode: 401,
            headers,
            body: JSON.stringify({ error: 'Unauthorized' })
        };
    }

    try {
        console.log('Delete request received:', {
            method: event.httpMethod,
            path: event.path,
            queryParams: event.queryStringParameters
        });
        
        const id = event.queryStringParameters?.id;
        console.log('Attempting to delete announcement ID:', id);
        
        if (!id) {
            console.log('No ID provided in query parameters');
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Missing announcement ID' })
            };
        }

        // Validate ID format (should be a number or UUID)
        if (!/^[a-zA-Z0-9-]+$/.test(id)) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid ID format' })
            };
        }

        // Check if DATABASE_URL is configured
        if (!process.env.DATABASE_URL) {
            console.error('DATABASE_URL not configured');
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'Database not configured' })
            };
        }

        const sql = neon(process.env.DATABASE_URL);

        // First check if announcement exists and get its details for logging
        const existing = await sql`
            SELECT id, type, title FROM announcements
            WHERE id = ${id}
            LIMIT 1
        `;

        if (existing.length === 0) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: 'Announcement not found' })
            };
        }

        // Delete the announcement
        const result = await sql`
            DELETE FROM announcements
            WHERE id = ${id}
            RETURNING id
        `;

        if (result.length === 0) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: 'Announcement not found or already deleted' })
            };
        }

        // Log successful deletion (without sensitive data)
        console.log(`Announcement deleted: ${id} - ${existing[0].type}`);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, id: id })
        };
    } catch (error) {
        console.error('Delete announcement error:', error.message);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Failed to delete announcement'
                // Don't expose internal error details in production
            })
        };
    }
};
