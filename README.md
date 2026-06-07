# Expense AI

A modern, AI-powered expense tracking and financial management application built with React, TypeScript, and Vite.

## 🌟 Features

- **Smart Expense Tracking**: Track and categorize your expenses effortlessly
- **AI-Powered Insights**: Get intelligent spending recommendations and analytics
- **Savings Goals**: Set and monitor your savings targets
- **Weekly Trends**: Visualize your spending patterns with interactive charts
- **User Authentication**: Secure login and signup with Supabase
- **Responsive Design**: Beautiful UI that works on all devices
- **Real-time Updates**: Live data synchronization with Supabase backend

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components
- **React Router** - Client-side routing
- **React Query** - Server state management
- **Framer Motion** - Smooth animations

### Backend & Services
- **Supabase** - Authentication and database services
- **Recharts** - Data visualization

## 📋 Project Structure

```
ExpenseAI/
├── ExpenseAI/
│   ├── ExpensesAI/          # Main React application
│   │   ├── src/
│   │   │   ├── components/  # Reusable UI components
│   │   │   │   ├── dashboard/    # Dashboard-specific components
│   │   │   │   ├── layout/       # Layout components
│   │   │   │   └── ui/           # shadcn/ui components
│   │   │   ├── pages/       # Page components
│   │   │   ├── context/     # React Context (Auth)
│   │   │   ├── hooks/       # Custom React hooks
│   │   │   ├── lib/         # Utility functions
│   │   │   ├── routes/      # Route definitions
│   │   │   ├── services/    # API services
│   │   │   └── App.tsx      # Main app component
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.ts
│   │   └── tsconfig.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ or Bun
- npm or Bun package manager
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ChaithanyaKasturi-20/Expense-AI.git
   cd ExpenseAI
   ```

2. **Navigate to the app directory**
   ```bash
   cd ExpenseAI/ExpensesAI
   ```

3. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

4. **Set up Supabase**
   - Create a Supabase project at [supabase.com](https://supabase.com)
   - Copy `.env.local.example` to `.env.local`
   - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

5. **Set up the AI backend**
   - In `ExpenseAI/ExpensesAI/server`, copy `.env.example` to `.env.local`
   - Add `OPENAI_API_KEY` or `GEMINI_API_KEY`
   - Optionally set `SERVER_PORT` if you want a port other than `4000`

6. **Start the development server**
   ```bash
   npm run dev
   # or
   bun dev
   ```

   The app will be available at `http://localhost:5173`

## 📦 Available Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm run build:dev    # Build in development mode

# Code Quality
npm run lint         # Run ESLint

# Preview
npm run preview      # Preview production build
```

## 🔐 Supabase Setup

This app uses Supabase for authentication. Copy `.env.local.example` to `.env.local` and set your Supabase project credentials.

### Quick Setup
1. Create a Supabase project
2. Enable Email/Password auth in Supabase
3. Configure OAuth providers if needed (e.g. Google)
4. Add the following env vars to `.env.local`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `OPENAI_API_KEY` or `GEMINI_API_KEY` (for backend AI chat/analysis)
   - `SERVER_PORT` (optional for backend, default `4000`)

If you are running the backend separately, also copy `ExpenseAI/ExpensesAI/server/.env.example` to `ExpenseAI/ExpensesAI/server/.env.local` and set the same AI key there.

## 🚢 Deployment

### Vercel Deployment

This repository is configured for Vercel using `vercel.json` and a root `package.json` that builds the nested React app in `ExpenseAI/ExpensesAI`.

1. Connect the repository to Vercel.
2. In Vercel Project Settings, add these environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Use the build command:
   ```bash
   npm run build
   ```

Vercel will build the nested app and deploy the static output from `ExpenseAI/ExpensesAI/dist`.

## 📝 Pages & Components

### Pages
- **Landing** - Home page with features overview
- **Login** - User login page
- **Signup** - New user registration
- **Dashboard** - Main expense tracking dashboard
- **Profile** - User profile management
- **ForgotPassword** - Password recovery
- **NotFound** - 404 error page

### Key Dashboard Components
- **ExpenseList** - Display expenses
- **AddExpenseModal** - Add new expenses
- **AddSavingModal** - Add savings goals
- **SpendingChart** - Expense visualization
- **WeeklyTrendChart** - Weekly spending trends
- **StatCard** - Statistics cards
- **HabitAlertCard** - Spending habit alerts

## 🎨 Styling

The project uses Tailwind CSS with a custom configuration. Component styles are defined using shadcn/ui which provides pre-built, accessible components.

## 🔄 State Management

- **React Query**: Server state management
- **React Context**: Auth state
- **React Hooks**: Local component state

## 📱 Responsive Design

The app is fully responsive and works seamlessly on:
- Desktop (1024px+)
- Tablet (768px - 1024px)
- Mobile (< 768px)

## 🐛 Error Handling

Errors are formatted and displayed user-friendly messages. See `src/lib/errorFormatter.ts` for error handling utilities.

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Supabase Documentation](https://supabase.com/docs)
- [React Router Documentation](https://reactrouter.com)

## 📄 License

This project is open source and available under the MIT License.

## 👤 Author

**Chaithanya Kasturi**

- GitHub: [@ChaithanyaKasturi-20](https://github.com/ChaithanyaKasturi-20)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🆘 Support

For support, email your inquiry or open an issue on the GitHub repository.

---

**Last Updated**: May 22, 2026
