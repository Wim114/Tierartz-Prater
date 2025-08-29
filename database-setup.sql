-- Database setup for Tierambulanz Prater
-- Run this SQL in your Neon database console

-- Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL CHECK (type IN ('holiday', 'emergency', 'news', 'special', 'warning')),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    substitute VARCHAR(200),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by VARCHAR(100) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_announcements_active_dates 
ON announcements (is_active, start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_announcements_created_at 
ON announcements (created_at DESC);

-- Insert a test announcement (optional)
INSERT INTO announcements (
    type, 
    title, 
    message, 
    start_date, 
    end_date
) VALUES (
    'news',
    'Willkommen in der Tierambulanz Prater!',
    'Wir freuen uns, Sie in unserer modernen Tierarztpraxis begrüßen zu dürfen. Unser Team steht Ihnen und Ihren Lieblingen mit Herz und Expertise zur Seite.',
    NOW(),
    NOW() + INTERVAL '30 days'
) ON CONFLICT DO NOTHING;

-- Verify the table was created
SELECT COUNT(*) as announcement_count FROM announcements;
