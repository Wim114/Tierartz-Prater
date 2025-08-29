# Tierambulanz Prater - Modern Veterinary Clinic Website

A modern, responsive website for Tierambulanz Prater, a veterinary clinic in Vienna, Austria. Built with performance, security, and user experience in mind.

## 🌟 Features

### Frontend
- **Responsive Design**: Mobile-first approach with Bootstrap 5
- **Modern UI/UX**: Clean, professional design with smooth animations
- **SEO Optimized**: Structured data, meta tags, and semantic HTML
- **Accessibility**: WCAG 2.1 compliant with proper ARIA labels
- **Performance**: Optimized images, lazy loading, and efficient caching
- **Multi-language Ready**: German content with international standards

### Backend
- **Serverless Functions**: Netlify Functions for dynamic content
- **Admin Panel**: Secure admin interface for content management
- **Database Integration**: Neon PostgreSQL for data storage
- **Security**: Input validation, CORS protection, and security headers

### Admin Features
- **Announcement Management**: Create, edit, and delete announcements
- **Real-time Preview**: See changes before they go live
- **Secure Authentication**: Password-protected admin access
- **User-friendly Interface**: Intuitive admin dashboard

## 🚀 Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+), Bootstrap 5
- **Backend**: Node.js, Netlify Functions
- **Database**: Neon PostgreSQL
- **Hosting**: Netlify
- **CDN**: Cloudflare (via CDN links)
- **Fonts**: Google Fonts (Montserrat, Oxygen)
- **Icons**: Font Awesome 6

## 📁 Project Structure

```
tierambulanz-prater/
├── index.html              # Main website
├── admin/
│   ├── index.html          # Admin login page
│   └── dashboard.html      # Admin dashboard
├── functions/              # Netlify Functions
│   ├── auth-check.js       # Authentication
│   ├── get-announcements.js # Fetch announcements
│   ├── create-announcement.js # Create announcements
│   └── delete-announcement.js # Delete announcements
├── images/                 # Website images
├── netlify.toml           # Netlify configuration
├── robots.txt             # SEO robots file
├── sitemap.xml           # SEO sitemap
├── 404.html              # Custom 404 page
├── .htaccess             # Apache configuration (backup)
└── package.json          # Project metadata
```

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+
- Netlify CLI (optional)
- Neon PostgreSQL database

### Environment Variables
Create a `.env` file with the following variables:

```env
DATABASE_URL=postgresql://username:password@host/database
ADMIN_PASSWORD=your_secure_admin_password
NODE_ENV=production
```

### Database Setup
Create the following table in your Neon database:

```sql
CREATE TABLE announcements (
    id SERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    substitute VARCHAR(200),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    created_by VARCHAR(50) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run locally: `netlify dev` (or serve files with any static server)

### Deployment

1. Connect your repository to Netlify
2. Set environment variables in Netlify dashboard
3. Deploy: `netlify deploy --prod`

## 🔒 Security Features

- **Content Security Policy**: Prevents XSS attacks
- **Security Headers**: X-Frame-Options, X-Content-Type-Options, etc.
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Protection**: Parameterized queries
- **Rate Limiting**: Basic protection against abuse
- **Timing Attack Protection**: Secure password comparison
- **HTTPS Enforcement**: Force secure connections

## 📈 SEO & Performance

### SEO Optimizations
- Structured data (JSON-LD) for local business
- Open Graph and Twitter Card meta tags
- Semantic HTML structure
- XML sitemap and robots.txt
- Local business schema markup

### Performance Features
- Image optimization and lazy loading
- CSS and JavaScript minification
- Browser caching with proper headers
- CDN delivery for static assets
- Preloading of critical resources

## 🎨 Design Features

- **Modern Color Scheme**: Professional blue palette
- **Responsive Typography**: Scalable fonts for all devices
- **Smooth Animations**: AOS library for scroll animations
- **Accessibility**: High contrast mode support, reduced motion
- **Print Styles**: Optimized for printing

## 🔧 Admin Panel Usage

### Accessing Admin
1. Navigate to `/admin/`
2. Enter admin password
3. Access dashboard at `/admin/dashboard.html`

### Managing Announcements
- **Create**: Use the announcement form
- **Types**: Holiday, Emergency, News, Special, Warning
- **Scheduling**: Set start and end dates
- **Preview**: See live preview of announcements

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🔍 Accessibility

- WCAG 2.1 AA compliant
- Screen reader compatible
- Keyboard navigation support
- High contrast mode support
- Reduced motion preferences respected

## 📊 Analytics & Monitoring

Ready for integration with:
- Google Analytics 4
- Google Search Console
- Netlify Analytics
- Performance monitoring tools

## 🚨 Emergency Contacts

For technical issues or emergencies:
- Website: https://tierambulanz-prater.netlify.app
- Phone: +43 01 7269181
- Email: tierambulanzprater@gmx.at

## 📄 License

This project is proprietary and confidential. All rights reserved by Tierambulanz Prater.

## 🤝 Contributing

This is a private project. For modifications or updates, please contact the development team.

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Status**: Production Ready ✅
