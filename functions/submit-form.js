exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { 
            statusCode: 405, 
            body: JSON.stringify({ success: false, message: 'Method Not Allowed' })
        };
    }

    try {
        const data = JSON.parse(event.body);
        data.access_key = '5fbb88fc-bac9-4a93-9130-57606dc1f69a';

        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        
        // Return consistent format
        return {
            statusCode: 200,
            body: JSON.stringify({
                success: result.success || response.ok,
                message: result.message || 'Form submitted',
                data: result
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                success: false, 
                message: 'Server error: ' + error.message 
            })
        };
    }
};
