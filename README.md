# WordPied

A modern, collaborative writing platform with gamification features, built with Next.js and Firebase.

## ✨ Features

- **Writing Workspace**: Create and manage multiple writing boxes with rich text editing
- **Real-time Collaboration**: Content syncs automatically via Firebase Realtime Database
- **Dark Mode**: Dark theme support for comfortable writing
- **Gamification**: Built-in games including:
  - Wordle Game
  - Tower Stack
  - Physics Fun
- **Rich Text Editor**: Powered by Tiptap with formatting options
- **Responsive Design**: Works seamlessly on desktop and mobile
- **User Profiles**: Track writing progress and achievements

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- Firebase account with Realtime Database

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/imshrishk/Word-Pied.git
   cd Word-Pied
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env.local` and fill in your Firebase credentials:
   ```bash
   cp .env.example .env.local
   ```

   See [Environment Variables](#environment-variables) section below for details.

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open http://localhost:3000** in your browser

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

See `.env.example` for a complete template.

## 🏗️ Project Structure

```
Word-Pied/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   │   ├── games/      # Game components
│   │   └── ui/         # UI components
│   ├── context/        # React context providers
│   ├── pages/          # Next.js pages
│   │   └── api/        # API routes
│   ├── styles/         # Global styles
│   └── workers/        # Web workers
├── .env.local          # Environment variables (create this)
├── next.config.js      # Next.js configuration
└── package.json        # Dependencies
```

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically
- `npm test` - Run tests in watch mode
- `npm run test:ci` - Run tests with coverage
- `npm run security-check` - Check for security vulnerabilities
- `npm run update-deps` - Update dependencies

## 🧪 Testing

Tests are written using Jest and React Testing Library.

```bash
# Run tests in watch mode
npm test

# Run tests once with coverage
npm run test:ci
```

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Manual Deployment

```bash
# Build the application
npm run build

# Start the production server
npm start
```

## 🛠️ Technology Stack

- **Framework**: Next.js 14
- **UI**: React 18, Tailwind CSS
- **Database**: Firebase Realtime Database
- **Rich Text**: Tiptap, React Quill
- **Animations**: Framer Motion, GSAP
- **Icons**: React Icons
- **Testing**: Jest, React Testing Library
- **Linting**: ESLint
