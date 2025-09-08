# Certify - Certification Ranking App

A modern, responsive web application built with React, TypeScript, and Tailwind CSS for discovering, comparing, and ranking professional certifications. Deployed on Firebase Hosting.

## 🚀 Features

- **Comprehensive Database**: Browse thousands of certifications from top providers
- **Smart Search & Filtering**: Find certifications by domain, issuer, level, and more
- **Interactive Rankings**: View top certifications based on market demand and ratings
- **Compare Tool**: Side-by-side comparison of up to 4 certifications
- **Detailed Pages**: In-depth information about each certification
- **Responsive Design**: Beautiful UI that works on all devices
- **Modern Tech Stack**: Built with React 19, TypeScript, and Tailwind CSS

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS + PostCSS
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Build Tool**: Vite
- **Deployment**: Firebase Hosting

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd certify
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173`

## 🏗️ Project Structure

```
src/
├── components/
│   ├── ui/                 # Reusable UI components
│   │   ├── Card.tsx
│   │   ├── Button.tsx
│   │   ├── Badge.tsx
│   │   └── Input.tsx
│   ├── Navigation.tsx      # Main navigation
│   ├── SearchBar.tsx      # Search and filtering
│   └── CertificationCard.tsx
├── pages/                  # Page components
│   ├── HomePage.tsx
│   ├── CertificationsPage.tsx
│   ├── RankingsPage.tsx
│   ├── ComparePage.tsx
│   └── CertificationDetailPage.tsx
├── services/
│   └── dataService.ts     # API integration
├── types/
│   └── index.ts           # TypeScript interfaces
├── data/
│   └── sampleData.ts      # Sample data for testing
└── utils/
    └── cn.ts              # Utility functions
```

## 🔧 Configuration

### API Integration

The app is configured to work with a backend API at `http://localhost:8000`. Update the `API_BASE_URL` in `src/services/dataService.ts` to point to your backend.

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=Certify
```

## 🚀 Deployment

### Firebase Hosting Setup

1. **Install Firebase CLI** (if not already installed)

   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**

   ```bash
   firebase login
   ```

3. **Initialize Firebase project**

   ```bash
   firebase init hosting
   ```

   - Select your Firebase project
   - Set public directory to `dist`
   - Configure as single-page app: `Yes`
   - Set up automatic builds: `No`

4. **Build and deploy**
   ```bash
   npm run deploy
   ```

### Alternative Deployment Commands

```bash
# Build only
npm run build

# Deploy to Firebase Hosting only
npm run deploy:hosting

# Serve locally with Firebase emulator
npm run serve

# Preview production build
npm run preview
```

## 📱 Features Overview

### Home Page

- Hero section with search functionality
- Trending certifications
- Domain categories
- Quick stats and features

### Certifications Page

- Advanced search and filtering
- Grid/list view toggle
- Sorting options
- Pagination

### Rankings Page

- Top certifications by domain
- Detailed scoring breakdown
- Methodology explanation

### Compare Page

- Side-by-side comparison
- Up to 4 certifications
- Key metrics comparison
- Best value indicators

### Certification Detail Page

- Comprehensive information
- Prerequisites and skills
- Reviews and ratings
- Related certifications

## 🎨 Styling

The app uses Tailwind CSS with custom components and utilities:

- **Custom Colors**: Primary and secondary color palettes
- **Typography**: Manrope font family
- **Components**: Reusable UI components with variants
- **Animations**: Smooth transitions and hover effects
- **Responsive**: Mobile-first design approach

## 🔌 API Endpoints

The app expects the following API endpoints:

- `GET /api/certifications` - List certifications with filters
- `GET /api/certifications/{slug}` - Get certification details
- `GET /api/rankings/top` - Get top rankings
- `GET /api/domains` - List domains
- `GET /api/issuers` - List issuers
- `GET /api/stats` - Get app statistics

## 🧪 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run deploy       # Build and deploy to Firebase
```

### Code Structure

- **Components**: Reusable UI components with TypeScript
- **Pages**: Route-based page components
- **Services**: API integration and data fetching
- **Types**: TypeScript interfaces and types
- **Utils**: Helper functions and utilities

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions, please open an issue in the repository.
