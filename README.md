# Health Tracking Pro 💪

A comprehensive health tracking application built for Bob & Paula's 12-week fitness challenge. Features daily checklists, competition tracking, body metrics visualization, and gamification elements.

## 🚀 Features

### Core Functionality
- **Daily Checklist (10 items, max 16 points)**
  - Diet tracking (no sugar, no alcohol, fasting times, calorie tracking)
  - Activity tracking (training, 10k+ steps, sauna)
  - Routine tracking (morning routine, supplements, weighing)
  - Smart point calculation with bonus system

### Competition System
- **Bob vs Paula weekly competitions**
- Live leaderboard and race visualization
- Champions in different categories (steps, training, streaks, etc.)
- Power-ups system with balanced gameplay mechanics
- Weekly rewards and penalty system

### Data Integration
- **Withings API integration** via Pipedream
- Automatic sync of weight, body fat, steps, heart rate
- Auto-completion of relevant checklist items
- Historical data import capability

### Visualization & Analytics
- **Interactive charts** using Recharts
- Body composition trends (Bob: body fat %, Paula: weight)
- Daily points visualization with bonus breakdown
- Steps tracking and comparison
- Success rate analytics and streak monitoring

### Gamification
- **Achievement system** with different rarities
- XP system and user levels (Bronze → Diamond)
- Streak tracking with flame indicators
- Success level badges (Bronze/Silver/Gold based on daily points)

### Mobile PWA
- **Progressive Web App** capabilities
- Offline functionality for checklist
- Push notifications for reminders
- Mobile-first responsive design
- Bottom navigation for mobile devices

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Charts**: Recharts for data visualization
- **Database**: Notion API for data storage
- **Integration**: Pipedream for Withings API
- **Icons**: Lucide React
- **Date**: date-fns for date manipulation
- **Animations**: Framer Motion (installed but not yet implemented)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   └── checklist/     # Checklist CRUD operations
│   ├── competition/       # Competition page
│   ├── stats/            # Statistics & charts page
│   ├── layout.tsx        # Root layout with navigation
│   └── page.tsx          # Dashboard homepage
├── components/
│   ├── charts/           # Chart components
│   │   ├── TrendChart.tsx
│   │   └── ProgressChart.tsx
│   ├── checklist/        # Daily checklist components
│   │   └── DailyChecklist.tsx
│   ├── competition/      # Competition view components
│   │   └── CompetitionView.tsx
│   ├── layout/           # Layout components
│   │   ├── Header.tsx
│   │   └── Navigation.tsx
│   └── ui/               # Reusable UI components
├── lib/                  # Utility libraries
│   ├── notion.ts         # Notion API integration
│   └── utils.ts          # Helper functions
├── types/                # TypeScript type definitions
│   └── index.ts
└── styles/
    └── globals.css       # Global styles and Tailwind config
```

## 🎯 Daily Checklist System

### Point Distribution (Max 16 points)
1. **Brak cukru** - 1 pkt
2. **Brak alkoholu** - 1 pkt
3. **Fasting przed 19:00** - 2 pkt (przed 17:00 = 3 pkt)
4. **Zrobiony trening** - 2 pkt
5. **Morning routine** - 3 pkt
6. **Sauna** - 1 pkt
7. **10k+ kroków** - 2 pkt (auto z Withings)
8. **Suplementy wzięte** - 1 pkt
9. **Ważenie się** - 1 pkt (auto z Withings)
10. **Spisane kalorie** - 2 pkt

### Bonus System
- **Success Levels**: Bronze (8+ pkt) = +2, Silver (10+ pkt) = +3, Gold (12+ pkt) = +5
- **Streak Bonuses**: 3 dni = +2, 5 dni = +3, 7 dni = +5, 10 dni = +10, 15 dni = +15

## 🏆 Competition Features

### Champions & Power-ups
- **Steps Champion**: x2 points for steps one day next week
- **Training Champion**: +1 point for each training next week
- **Streak Champion**: Shield protecting against streak breaks
- **Body Progress Champion**: x2 points for weighing for 3 days
- **Perfect Days Champion**: +5 bonus points to use

### Weekly Rewards (Progressive)
- Week 1-2: Seks oralny
- Week 3-4: Masaż 30min + seks oralny
- Week 5-6: Kolacja w restauracji
- Week 7-8: Weekend spa treatment
- Week 9-10: Shopping spree
- Week 11-12: Full day "slave mode"

## 📊 Data Architecture

### Notion Database Schema
The app uses a single Notion database with 30+ properties including:
- User identification and date indexing
- All checklist items as individual columns
- Calculated fields for points and bonuses
- Body metrics from Withings
- Competition tracking fields
- Notes and metadata

### Pipedream Workflows
1. **Daily Withings Sync** (8:00 AM)
2. **Streak Calculation** (11:55 PM)
3. **Weekly Competition Results** (Sunday 8:00 PM)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Notion workspace and API integration
- Pipedream account (Premium for AI features)
- Withings developer account

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd health-tracking-pro
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Fill in your actual API keys and configuration:
- `NOTION_API_KEY`: Your Notion integration token
- `NOTION_DATABASE_ID`: Your Notion database ID
- `PIPEDREAM_API_KEY`: Your Pipedream API key
- `PIPEDREAM_WEBHOOK_URL`: Your Pipedream webhook URL

4. **Set up Notion database**
Follow the schema in `NOTION_DATABASE_SCHEMA.md` to create your database with all required properties and views.

5. **Configure Pipedream workflows**
Set up the three main workflows:
- Withings data sync
- Daily streak calculation
- Weekly competition processing

6. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) to view the application.

## 📱 PWA Setup

The app includes PWA functionality:
- Add manifest.json for app installation
- Service worker for offline capabilities
- Push notifications for reminders
- Mobile-optimized interface

To test PWA features:
1. Open the app in Chrome/Edge
2. Look for "Install" button in address bar
3. Or use Chrome DevTools > Application > Manifest

## 🎨 Design System

### Colors
- **Bob**: Blue theme (`#3b82f6`)
- **Paula**: Pink theme (`#ec4899`)
- **Success**: Green (`#10b981`)
- **Warning**: Yellow (`#f59e0b`)
- **Gold**: Gold (`#fbbf24`)

### Typography
- Primary font: Inter
- Monospace: JetBrains Mono
- Responsive sizing with Tailwind classes

## 🔧 API Endpoints

### `/api/checklist`
- `GET`: Fetch daily entries
- `POST`: Create new daily entry
- `PUT`: Update existing entry

Query parameters:
- `user`: 'Bob' | 'Paula'
- `date`: YYYY-MM-DD (optional, defaults to today)

## 🚦 Development Workflow

### Testing
```bash
npm run build    # Test production build
npm run lint     # Check code quality
npm run type-check # TypeScript validation
```

### Deployment
The app is ready for deployment on Vercel, Netlify, or similar platforms:
1. Connect your git repository
2. Set environment variables
3. Deploy automatically on push

## 🎯 Roadmap

### Phase 1 - Core Implementation (Completed)
- ✅ Basic UI and navigation
- ✅ Daily checklist functionality
- ✅ Competition view
- ✅ Charts and statistics
- ✅ Notion integration setup

### Phase 2 - Integration & Data
- 🔄 Connect to actual Notion database
- 🔄 Set up Pipedream workflows
- 🔄 Implement Withings data sync
- 🔄 Real-time data updates

### Phase 3 - Advanced Features
- 📋 Calendar view implementation
- 📋 Achievement system
- 📋 AI insights and recommendations
- 📋 Push notifications
- 📋 Advanced analytics

### Phase 4 - Mobile & PWA
- 📋 Service worker implementation
- 📋 Offline data sync
- 📋 Mobile app icons
- 📋 Advanced PWA features

## 🤝 Contributing

This is a personal project for Bob & Paula, but the architecture can be adapted for other health tracking needs.

## 📄 License

Private project - All rights reserved.

---

**Built with ❤️ for the ultimate health challenge!** 💪

Start date: September 15, 2024
Challenge duration: 12 weeks
Goal: Transform habits, compete friendly, achieve goals together! 🎯