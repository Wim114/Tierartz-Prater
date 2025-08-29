// functions/create-announcement.js
const { neon } = require('@neondatabase/serverless');

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' ? 'https://tierambulanz-prater.netlify.app' : '*',
        'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Auth',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
        // Validate request body exists
        if (!event.body) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Request body is required' })
            };
        }

        let data;
        try {
            data = JSON.parse(event.body);
        } catch (parseError) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid JSON in request body' })
            };
        }
        
        // Validate required fields
        if (!data.type || !data.title || !data.message || !data.startDate || !data.endDate) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Missing required fields: type, title, message, startDate, endDate' })
            };
        }

        // Validate field types and lengths
        const validTypes = ['holiday', 'emergency', 'news', 'special', 'warning'];
        if (!validTypes.includes(data.type)) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid announcement type' })
            };
        }

        // Sanitize and validate input lengths
        const title = String(data.title).trim().substring(0, 200);
        const message = String(data.message).trim().substring(0, 1000);
        const substitute = data.substitute ? String(data.substitute).trim().substring(0, 200) : null;

        if (title.length < 3) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Title must be at least 3 characters long' })
            };
        }

        if (message.length < 10) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Message must be at least 10 characters long' })
            };
        }

        // Validate dates
        console.log('Received date strings:', { startDate: data.startDate, endDate: data.endDate });
        const startDate = new Date(data.startDate);
        const endDate = new Date(data.endDate);
        console.log('Parsed dates:', { startDate, endDate });
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            console.error('Date parsing failed:', { 
                startDateInput: data.startDate, 
                endDateInput: data.endDate,
                parsedStart: startDate,
                parsedEnd: endDate
            });
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid date format' })
            };
        }

        if (endDate <= startDate) {
            console.error('Date validation failed: end date not after start date');
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'End date must be after start date' })
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
                ${title},
                ${message},
                ${substitute},
                ${data.startDate},
                ${data.endDate},
                'admin',
                true,
                NOW()
            ) RETURNING id, type, title, message, substitute, start_date, end_date, is_active, created_at
        `;

        // Log successful creation (without sensitive data)
        console.log(`Announcement created: ${result[0].id} - ${result[0].type}`);
        console.log('Created announcement data:', {
            id: result[0].id,
            type: result[0].type,
            title: result[0].title,
            startDate: result[0].start_date,
            endDate: result[0].end_date
        });

        return {
            statusCode: 201,
            headers,
            body: JSON.stringify(result[0])
        };
    } catch (error) {
        console.error('Create announcement error:', error.message);
        console.error('Full error details:', error);
        console.error('Error stack:', error.stack);
        
        // Log the data that was being inserted for debugging
        console.error('Data being inserted:', {
            type: data?.type,
            title: data?.title?.substring(0, 50),
            startDate: data?.startDate,
            endDate: data?.endDate
        });
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Failed to create announcement',
                details: process.env.NODE_ENV !== 'production' ? error.message : 'Database error'
            })
        };
    }
};
