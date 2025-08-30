exports.handler = async (event, context) => {
  // Handle preflight OPTIONS request for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ message: 'CORS preflight successful' })
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body);
    data.access_key = process.env.WEB3FORMS_ACCESS_KEY;
    
    // Customize for German emails
    data.subject = 'Neue Terminanfrage - Tierambulanz Prater';
    
    // Map field names to German labels
    data.custom = {
      fullName: "Vollständiger Name",
      phone: "Telefonnummer", 
      email: "E-Mail-Adresse",
      petType: "Art des Tieres",
      reason: "Grund des Besuchs",
      privacy: "Datenschutz akzeptiert"
    };

    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    
    return {
      statusCode: 200,
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error('Error in submit-form function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        success: false, 
        message: 'Interner Serverfehler' 
      })
    };
  }
};
