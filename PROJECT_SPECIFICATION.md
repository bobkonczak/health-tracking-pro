# Health Tracking Pro - Pełna Specyfikacja

## 📱 Przegląd Projektu
Kompleksowa aplikacja PWA do śledzenia zdrowia dla Bob i Paula z systemem competition, gamification i AI insights.

## 🎯 Główne Cele
- **Bob:** Redukcja body fat z 20.3% → 15% (-5.3%)
- **Paula:** Redukcja wagi z 77kg → 69kg (-8kg)
- **Timeframe:** 12 tygodni (start 15.09)

## ✅ 1. Daily Checklist System

### Punktacja (max 16 pkt/dzień)
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

### Morning Routine (3 pkt za komplet)
- Sun Salutation 2-3 rundy
- Medytacja 5-10 min
- Szklanka wody na czczo
- Pierwsze 30 min bez telefonu
- 10 głębokich oddechów

### Success Levels & Bonusy
- **Bronze (8+ pkt):** +2 bonus
- **Silver (10+ pkt):** +3 bonus
- **Gold (12+ pkt):** +5 bonus

### Streak System
- 3 dni = +2 bonus
- 5 dni = +3 bonus
- 7 dni = +5 bonus
- 10 dni = +10 bonus
- 15 dni = +15 bonus

## 📊 2. Withings Integration

### Synchronizowane Dane
- Weight + moving average
- Body Fat %, Muscle Mass, Water %
- Steps (daily total)
- Heart Rate, Sleep Score

### Konfiguracja
- Osobne konta dla Bob i Paula
- Sync 1x dziennie + manual refresh
- Auto-check "Ważenie się" i "10k kroków"
- Import 3 miesięcy historii

## 💊 3. Suplementacja

### Bob
- Omega-3 (2g EPA/DHA)
- Witamina D3+K2 (4000 IU + 100mcg)
- Magnez glicynian (400mg wieczorem)
- Kompleks B (rano)
- Kreatyna (5g)
- L-teanina (200mg z kawą)
- Ashwagandha KSM-66 (600mg)
- Rhodiola (400mg rano)
- Sylimaryn (300mg)
- NAC (600mg)
- L-karnityna (2g przed treningiem)
- Jeżówka (500mg, cyklicznie)

### Paula (unikać żelaza!)
- Omega-3 (2g EPA/DHA)
- Witamina D3+K2 (4000 IU + 100mcg)
- Magnez glicynian (400mg)
- Selen (200mcg - tarczyca)
- L-tyrozyna (500mg rano)
- Ashwagandha (600mg)
- Kurkuma (1000mg - chelator)
- Kreatyna (5g)
- L-karnityna (2g)
- Jeżówka (500mg, cyklicznie)

## 🏆 4. Competition System

### Scoring
- Start tygodnia: Poniedziałek
- Wyniki: Niedziela 20:00
- Suma punktów tygodniowych

### Champions & Power-ups
- **Steps Champion:** Kroki x2 jeden dzień
- **Training Champion:** +1 pkt za każdy trening
- **Streak Champion:** Shield (1 dzień <8pkt nie psuje)
- **Body Progress Champion:** x2 pkt za ważenie (3 dni)
- **Perfect Days Champion:** +5 bonus punktów

### Nagrody Tygodniowe
- Tydzień 1-2: Seks oralny
- Tydzień 3-4: Masaż 30min + seks oralny
- Tydzień 5-6: Kolacja (przegrany płaci)
- Tydzień 7-8: Weekend spa
- Tydzień 9-10: Shopping (przegrany finansuje)
- Tydzień 11-12: Full day "slave mode"

## 📈 5. Visualizations & Charts

### Main Dashboard
- Live Race Visual (avatary na torze)
- Today's Score (Bob vs Paula)
- Weekly Progress Bar
- Streak Flames 🔥
- Trend & Goal Realization
- Moving Average (7-day)

### Wykresy
- Body Composition (dual-axis)
- Daily Points (stacked bar)
- Weekly Comparison
- Heatmap Calendar
- Spider/Radar Chart

### Time Views
- 7-day (szczegółowy)
- 14-day (2 tygodnie)
- 30-day (miesiąc)
- 90-day (kwartał)
- All-time (historia)
- Compare Periods

## 🎮 6. Gamification

### Achievements
**Consistency:**
- First Steps, Week Warrior, Unstoppable
- Centurion (100 days), Iron Will

**Performance:**
- Perfect Day, Overachiever (20+ pts)
- Morning Person, Sugar Free Master

**Competition:**
- First Blood, Comeback Kid, Dominator
- David vs Goliath, Clean Sweep

**Progress:**
- -1kg/-1% Club, -5kg/-3% Club
- Halfway There, Goal Crusher

### XP & Levels
- Bronze → Silver → Gold → Platinum → Diamond

## 📅 7. Calendar Views

### Month View
- Color coding (red/yellow/green/gold)
- Mini icons (🏃🧘🔥🏆)
- Period marker dla Pauli

### Historical Features
- Time Machine (slider)
- Before/After timeline
- Best/Worst periods
- Export CSV/PDF

## 🤖 8. AI Insights

### Daily Coach
- Morning briefing (7:00)
- Pattern detection
- Correlation analysis
- Predictions & warnings

### Smart Features
- Plateau breaker suggestions
- Optimization tips
- Personalized challenges
- Weekly/Monthly AI reports

## 💾 9. Technical Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- PWA (offline, push notifications)
- Zustand (state)
- React Query

### Backend
- Pipedream (workflows, API)
- Notion Database
- Withings API
- Vercel (hosting)

### Database Schema (Notion)
- Date, User
- 10 Checklist columns
- Body metrics (weight, fat%, etc)
- Points & bonuses
- Streaks & achievements
- Competition data

## 📱 10. PWA Features
- Offline mode
- Push notifications
- Install prompt
- Bottom navigation
- Swipe gestures
- Pull to refresh
- Biometric lock

## 🔔 11. Notifications
- 7:00 - Morning routine
- 12:00 - Suplementy
- 18:30 - Last meal reminder
- 21:00 - Complete checklist
- Niedziela 20:00 - Weekly results

## 🎯 12. Success Metrics
- Daily completion rate >80%
- Weekly engagement 7/7 days
- Goal achievement by week 12
- Streak maintenance >7 days
- Competition participation 100%

---

## 📝 Badania Krwi (start + po 12 tygodniach)

### Dla Obu
- Morfologia z rozmazem + CRP
- Lipidogram
- Glukoza, insulina, HOMA-IR, HbA1c
- ALT, AST, GGTP
- Kreatynina, eGFR
- TSH, fT3, fT4
- Witamina D3, B12, kwas foliowy
- Elektrolity

### Paula Dodatkowo
- Ferrytyna, żelazo, TIBC, saturacja
- Przeciwciała tarczycowe

### Bob Dodatkowo
- Testosteron całkowity/wolny, SHBG
- Kortyzol poranny, Estradiol

---

**Start Development:** Ready to build! 🚀