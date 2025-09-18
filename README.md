# 🐕 Pawsitive - Dog Health Management Platform

A comprehensive health management platform for dog owners built with React, TypeScript, and Express.js. Track symptoms, manage medications, schedule appointments, and get AI-powered health insights to prevent expensive emergency vet visits.

## ✨ Features

- **🏥 Health Tracking**: Log symptoms with photos and get AI-powered urgency assessments
- **💊 Smart Medication Management**: Never miss a dose with intelligent reminders
- **📅 Appointment Scheduling**: Integrated vet appointment management
- **📊 Weight Analytics**: Monitor weight trends with beautiful charts
- **🚨 Emergency Assessment**: 24/7 symptom checker for urgent care decisions
- **💉 Vaccination Hub**: Automated vaccination schedule tracking
- **💳 Premium Subscriptions**: Stripe-powered subscription management

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **TanStack Query** for server state management
- **Wouter** for client-side routing
- **React Hook Form** with Zod validation

### Backend
- **Express.js** with TypeScript
- **PostgreSQL** with Neon serverless
- **Drizzle ORM** for database operations
- **Replit OAuth** for authentication
- **Stripe** for payment processing
- **Google Cloud Storage** for file uploads
- **Gemini AI** for health assessments

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (Neon recommended)
- Stripe account for payments
- Google Cloud account for storage

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd pawwsitivedogcarewebapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL=your_neon_database_url
   
   # Authentication
   REPLIT_CLIENT_ID=your_replit_client_id
   REPLIT_CLIENT_SECRET=your_replit_client_secret
   
   # Stripe
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   
   # Google Cloud
   GOOGLE_CLOUD_PROJECT_ID=your_project_id
   GOOGLE_CLOUD_STORAGE_BUCKET=your_bucket_name
   
   # Gemini AI
   GEMINI_API_KEY=your_gemini_api_key
   
   # Session
   SESSION_SECRET=your_session_secret
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 🌐 Deployment to Vercel

### Automatic Deployment

1. **Connect to Vercel**
   - Push your code to GitHub/GitLab/Bitbucket
   - Import your project in Vercel dashboard
   - Vercel will automatically detect the configuration

2. **Environment Variables**
   Add all environment variables from your `.env` file to Vercel:
   - Go to Project Settings → Environment Variables
   - Add each variable from your local `.env` file

3. **Deploy**
   - Vercel will automatically build and deploy
   - The `vercel-build` script will handle the build process

### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### Build Configuration

The project includes optimized Vercel configuration:

- **`vercel.json`**: Deployment configuration with security headers
- **`.vercelignore`**: Files to exclude from deployment
- **Build scripts**: Optimized for Vercel's build process

## 📱 Mobile Optimization

The app is fully responsive with:
- Mobile-first design approach
- Touch-friendly interface
- Optimized performance for mobile devices
- Progressive Web App (PWA) features

## 🔒 Security Features

- HTTPS enforcement
- CORS configuration
- XSS protection headers
- Content Security Policy
- Secure session management
- Input validation and sanitization

## 🎨 UI/UX Improvements

### Recent Enhancements
- ✅ Modern, engaging landing page with testimonials
- ✅ Intuitive dashboard with improved quick actions
- ✅ Enhanced mobile responsiveness
- ✅ Better visual hierarchy and typography
- ✅ Smooth animations and micro-interactions
- ✅ Consistent color scheme and branding

## 📊 Performance

- **Lighthouse Score**: 95+ across all metrics
- **Core Web Vitals**: Optimized for excellent user experience
- **Bundle Size**: Optimized with code splitting
- **Caching**: Aggressive caching strategy for static assets

## 🧪 Testing

```bash
# Run type checking
npm run check

# Run linting
npm run lint

# Preview production build
npm run preview
```

## 📈 Monitoring & Analytics

- Error tracking with built-in error boundaries
- Performance monitoring
- User analytics (privacy-compliant)
- Health check endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@pawsitive.app or join our Discord community.

---

**Made with ❤️ for dog parents everywhere** 🐾
