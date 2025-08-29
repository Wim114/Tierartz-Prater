// functions/get-announcements.js
const { neon } = require('@neondatabase/serverless');

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' ? 'https://tierambulanz-prater.netlify.app' : '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Content-Type': 'application/json',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
        'Referrer-Policy': 'strict-origin-when-cross-origin'
    };

    // Handle OPTIONS request for CORS
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    try {
        // Validate DATABASE_URL exists
        if (!process.env.DATABASE_URL) {
            console.error('DATABASE_URL not configured');
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'Database not configured' })
            };
        }

        const sql = neon(process.env.DATABASE_URL);

        // Get announcements with input sanitization
        // Only return necessary fields to minimize data exposure
        const announcements = await sql`
            SELECT 
                id,
                type,
                title,
                message,
                substitute,
                start_date,
                end_date,
                is_active,
                created_at
            FROM announcements
            WHERE is_active = true
            ORDER BY created_at DESC
            LIMIT 50
        `;

        // Sanitize output data
        const sanitizedAnnouncements = announcements.map(ann => ({
            id: ann.id,
            type: ann.type,
            title: String(ann.title || '').substring(0, 200), // Limit title length
            message: String(ann.message || '').substring(0, 1000), // Limit message length
            substitute: ann.substitute ? String(ann.substitute).substring(0, 200) : null,
            startDate: ann.start_date,
            endDate: ann.end_date,
            start_date: ann.start_date, // Keep both formats for compatibility
            end_date: ann.end_date,
            isActive: ann.is_active,
            createdAt: ann.created_at,
            created_at: ann.created_at
        }));

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(sanitizedAnnouncements)
        };
    } catch (error) {
        console.error('Database error:', error.message);
        console.error('Full error:', error);
        
        // In production, be more informative about errors for debugging
        // while still being secure
        const isDev = process.env.NODE_ENV !== 'production';
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Failed to load announcements',
                details: isDev ? error.message : 'Database connection issue'
            })
        };
    }
};
