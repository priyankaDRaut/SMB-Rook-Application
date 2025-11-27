# Smilebird Dashboard Spark

A modern React dashboard application built with Vite, TypeScript, and shadcn/ui components.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🛠️ Technologies Used

- **Vite** - Fast build tool and dev server
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **React Router** - Client-side routing
- **React Query** - Data fetching
- **Recharts** - Data visualization

## 📦 Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/       # React contexts (Auth, Theme, Role)
├── hooks/          # Custom React hooks
├── pages/          # Page components
├── types/          # TypeScript type definitions
└── lib/            # Utility functions and configurations
```

## 🚀 Deployment

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [Vercel](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect it's a Vite project
   - Deploy settings are already configured in `vercel.json`

3. **Environment Variables** (if needed)
   - Add any required environment variables in Vercel dashboard
   - The app currently uses hardcoded API endpoints

### Build Configuration

The project is configured for Vercel deployment with:
- ✅ Proper `vercel.json` configuration
- ✅ Correct build scripts in `package.json`
- ✅ TypeScript configuration
- ✅ Tailwind CSS setup
- ✅ API proxy configuration for CORS

## 🔧 Configuration Files

- `vite.config.ts` - Vite configuration with API proxy
- `vercel.json` - Vercel deployment configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration

## 📱 Features

- **Authentication** - Login with phone/OTP
- **Role-based Access** - Different views for different user roles
- **Dashboard Analytics** - Financial and performance metrics
- **Clinic Management** - Multi-clinic support
- **Responsive Design** - Works on all devices
- **Dark/Light Theme** - Theme switching support

## 🐛 Troubleshooting

### Build Issues
- Ensure Node.js version is 18+
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run lint`

### Deployment Issues
- Verify `vercel.json` is properly configured
- Check that all dependencies are in `package.json`
- Ensure build script works locally: `npm run build`

## 📄 License

This project is private and proprietary.
