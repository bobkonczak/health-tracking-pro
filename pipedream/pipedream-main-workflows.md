# 🤖 PIPEDREAM WORKFLOWS: Health Tracking Pro Automation

## 📋 OVERVIEW
Kompletny zestaw 6 workflow do automatyzacji aplikacji Health Tracking Pro

## 🔧 WORKFLOW 1: Withings Daily Sync
**Schedule: 6:00, 12:00, 20:00**

### Zadanie:
Synchronizuj dane z Withings API dla Bob i Paula, zaktualizuj Notion

### Steps:
```javascript
// Step 1: Fetch Bob's Withings Data
const bobData = await fetchWithingsData({
  userId: process.env.BOB_WITHINGS_USER_ID,
  accessToken: process.env.BOB_WITHINGS_TOKEN
});

// Step 2: Fetch Paula's Withings Data  
const paulaData = await fetchWithingsData({
  userId: process.env.PAULA_WITHINGS_USER_ID,
  accessToken: process.env.PAULA_WITHINGS_TOKEN
});

// Step 3: Update Notion Database
const today = new Date().toISOString().split('T')[0];

// Update Bob's entry
await updateNotionEntry('Bob', today, {
  'Weight': { number: bobData.weight },
  'Body Fat %': { number: bobData.bodyFat },
  'Steps': { number: bobData.steps },
  'Steps Achieved': { checkbox: bobData.steps >= 10000 },
  'Weighed In': { checkbox: !!bobData.weight },
  'Heart Rate': { number: bobData.heartRate },
  'Sleep Score': { number: bobData.sleepScore }
});

// Update Paula's entry (similar)
```

---

## 🔥 WORKFLOW 2: Streak Calculator
**Schedule: Daily 23:55**

### Zadanie:
Oblicz streaki dla każdego użytkownika i zaktualizuj bonusy

### Steps:
```javascript
// Step 1: Get last 30 days data
const bobEntries = await getRecentEntries('Bob', 30);
const paulaEntries = await getRecentEntries('Paula', 30);

// Step 2: Calculate current streaks
function calculateStreak(entries) {
  let streak = 0;
  for (let i = entries.length - 1; i >= 0; i--) {
    if (entries[i].dailyPoints >= 8) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

const bobStreak = calculateStreak(bobEntries);
const paulaStreak = calculateStreak(paulaEntries);

// Step 3: Update today's entries with streak data
await updateTodayStreak('Bob', bobStreak);
await updateTodayStreak('Paula', paulaStreak);
```

---

## 🏆 WORKFLOW 3: Weekly Competition
**Schedule: Sunday 20:00**

### Zadanie:
Oblicz wyniki tygodnia, wyłoń championów, przyznaj power-ups

### Steps:
```javascript
// Step 1: Get current week data
const currentWeek = getWeekNumber(new Date());
const weekData = await getWeeklyData(currentWeek);

// Step 2: Calculate champions
const champions = {
  steps: getStepsChampion(weekData),
  training: getTrainingChampion(weekData),
  streak: getStreakChampion(weekData),
  progress: getProgressChampion(weekData),
  perfect: getPerfectDaysChampion(weekData)
};

// Step 3: Award power-ups for next week
await awardPowerUps(champions);

// Step 4: Send results notification
await sendWeeklyResults(weekData, champions);
```

---

## 📱 WORKFLOW 4: Push Notifications
**Multiple Schedules**

### Morning Routine (7:00):
```javascript
await sendNotification({
  title: '☀️ Morning Routine Time!',
  body: 'Start your day right with sun salutation and meditation',
  users: ['Bob', 'Paula']
});
```

### Supplements (12:00):
```javascript
await sendNotification({
  title: '💊 Supplements Time!',
  body: 'Don\'t forget your lunch supplements',
  users: ['Bob', 'Paula']
});
```

### Fasting Reminder (18:30):
```javascript
await sendNotification({
  title: '🍽️ Last Meal Reminder!',
  body: 'Finish eating before 19:00 for 2 points (17:00 for 3 points!)',
  users: ['Bob', 'Paula']
});
```

### Checklist Completion (21:00):
```javascript
// Check today's progress
const today = new Date().toISOString().split('T')[0];
const bobData = await getDailyData('Bob', today);
const paulaData = await getDailyData('Paula', today);

// Send personalized reminders
if (!bobData || bobData.points.daily < 8) {
  await sendPersonalizedReminder('Bob', bobData?.points.daily || 0);
}

if (!paulaData || paulaData.points.daily < 8) {
  await sendPersonalizedReminder('Paula', paulaData?.points.daily || 0);
}
```

---

## 🔄 WORKFLOW 5: API Endpoint
**HTTP Trigger**

### Zadanie:
REST API dla aplikacji do CRUD operations

### Endpoints:

#### GET /daily
```javascript
// Get daily data for user
const { user, date } = steps.trigger.event.query;
const data = await getDailyEntry(user, date || today);
return $.respond({ status: 200, body: data });
```

#### POST /checklist
```javascript
// Update checklist
const { user, date, updates } = steps.trigger.event.body;
await updateChecklist(user, date, updates);
await recalculateStreak(user);
return $.respond({ status: 200, body: { success: true } });
```

#### GET /competition
```javascript
// Get current week competition
const weekData = await getCurrentWeekCompetition();
return $.respond({ status: 200, body: weekData });
```

---

## 📊 WORKFLOW 6: Analytics & Backup
**Schedule: Daily 2:00 AM**

### Zadanie:
Backup danych, generuj raporty, analytics

### Steps:
```javascript
// Step 1: Export full database
const fullData = await exportNotionDatabase();
await saveToBackup(fullData, `backup-${today}.json`);

// Step 2: Calculate analytics
const analytics = await calculateDailyAnalytics();
await saveAnalytics(analytics);

// Step 3: Check for achievements
const newAchievements = await checkForNewAchievements();
if (newAchievements.length > 0) {
  await awardAchievements(newAchievements);
  await sendAchievementNotifications(newAchievements);
}
```

---

## 🔑 Environment Variables Needed:

```bash
# Notion
NOTION_API_KEY=secret_xxxxx
NOTION_DATABASE_ID=xxxxx

# Withings
BOB_WITHINGS_USER_ID=xxxxx
BOB_WITHINGS_TOKEN=xxxxx
PAULA_WITHINGS_USER_ID=xxxxx  
PAULA_WITHINGS_TOKEN=xxxxx

# App Integration
HEALTH_APP_WEBHOOK=https://your-app.vercel.app/api/webhook
API_SECRET=random-secret-key

# Push Notifications
VAPID_PUBLIC_KEY=xxxxx
VAPID_PRIVATE_KEY=xxxxx
```

---

## 🚀 DEPLOYMENT PLAN:

1. **Setup Notion Database** (Workflow 1)
2. **Configure Withings API** 
3. **Deploy all 6 workflows**
4. **Connect to app** (update .env)
5. **Test full integration**

## ✅ Success Metrics:
- Automatic data sync 3x daily
- Real-time streak calculation  
- Weekly competition automation
- Push notifications working
- Zero manual data entry needed

---

**INSTRUKCJA:**
Stwórz każdy workflow osobno w Pipedream, używając podanych steps i schedules. Testuj każdy przed przejściem do następnego.
