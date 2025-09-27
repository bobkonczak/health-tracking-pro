# Pipedream Workflows Configuration

## 🔧 Wymagane Workflows

### 1. **Withings Daily Sync** (Schedule: 6:00, 12:00, 20:00)

```javascript
// Step 1: Fetch Bob's Withings Data
const bobWithingsData = await fetchWithingsData({
  userId: process.env.BOB_WITHINGS_USER_ID,
  accessToken: process.env.BOB_WITHINGS_TOKEN
});

// Step 2: Fetch Paula's Withings Data
const paulaWithingsData = await fetchWithingsData({
  userId: process.env.PAULA_WITHINGS_USER_ID,
  accessToken: process.env.PAULA_WITHINGS_TOKEN
});

// Step 3: Update Notion Database
const today = new Date().toISOString().split('T')[0];

// Update Bob's entry
await notion.pages.update({
  page_id: await findOrCreateDailyEntry('Bob', today),
  properties: {
    'Weight': { number: bobWithingsData.weight },
    'Body Fat %': { number: bobWithingsData.bodyFat },
    'Steps': { number: bobWithingsData.steps },
    'Steps Achieved': { checkbox: bobWithingsData.steps >= 10000 },
    'Weighed In': { checkbox: !!bobWithingsData.weight },
    'Heart Rate': { number: bobWithingsData.heartRate },
    'Sleep Score': { number: bobWithingsData.sleepScore }
  }
});

// Update Paula's entry
await notion.pages.update({
  page_id: await findOrCreateDailyEntry('Paula', today),
  properties: {
    'Weight': { number: paulaWithingsData.weight },
    'Body Fat %': { number: paulaWithingsData.bodyFat },
    'Steps': { number: paulaWithingsData.steps },
    'Steps Achieved': { checkbox: paulaWithingsData.steps >= 10000 },
    'Weighed In': { checkbox: !!paulaWithingsData.weight },
    'Heart Rate': { number: paulaWithingsData.heartRate },
    'Sleep Score': { number: paulaWithingsData.sleepScore }
  }
});
```

### 2. **Daily Streak Calculator** (Schedule: 23:50)

```javascript
// Step 1: Get last 30 days of data
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

const response = await notion.databases.query({
  database_id: process.env.NOTION_DATABASE_ID,
  filter: {
    property: 'Date',
    date: {
      on_or_after: thirtyDaysAgo.toISOString()
    }
  },
  sorts: [{ property: 'Date', direction: 'descending' }]
});

// Step 2: Calculate streaks for each user
const calculateStreak = (user) => {
  const userEntries = response.results
    .filter(page => page.properties['User'].select.name === user)
    .sort((a, b) => new Date(b.properties.Date.date.start) - new Date(a.properties.Date.date.start));

  let streak = 0;
  for (const entry of userEntries) {
    if (entry.properties['Daily Points'].formula.number >= 8) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
};

const bobStreak = calculateStreak('Bob');
const paulaStreak = calculateStreak('Paula');

// Step 3: Update today's entries with streak
const today = new Date().toISOString().split('T')[0];

await notion.pages.update({
  page_id: await findDailyEntry('Bob', today),
  properties: {
    'Streak Days': { number: bobStreak }
  }
});

await notion.pages.update({
  page_id: await findDailyEntry('Paula', today),
  properties: {
    'Streak Days': { number: paulaStreak }
  }
});
```

### 3. **Weekly Competition Results** (Schedule: Sunday 20:00)

```javascript
// Step 1: Calculate weekly points
const currentWeek = getWeekNumber(new Date());
const weekData = await notion.databases.query({
  database_id: process.env.NOTION_DATABASE_ID,
  filter: {
    property: 'Week Number',
    formula: { number: { equals: currentWeek } }
  }
});

// Step 2: Sum points for each user
const bobPoints = weekData.results
  .filter(p => p.properties['User'].select.name === 'Bob')
  .reduce((sum, p) => sum + p.properties['Total Points'].formula.number, 0);

const paulaPoints = weekData.results
  .filter(p => p.properties['User'].select.name === 'Paula')
  .reduce((sum, p) => sum + p.properties['Total Points'].formula.number, 0);

// Step 3: Determine winner and champions
const winner = bobPoints > paulaPoints ? 'Bob' : paulaPoints > bobPoints ? 'Paula' : 'Tie';

// Calculate category champions
const champions = {
  steps: calculateChampion('Steps', weekData.results),
  training: calculateChampion('Training Done', weekData.results),
  streak: calculateChampion('Streak Days', weekData.results),
  perfectDays: calculatePerfectDaysChampion(weekData.results)
};

// Step 4: Send notification
await sendPushNotification({
  title: '🏆 Weekly Results!',
  body: `${winner === 'Tie' ? 'It\'s a tie!' : `${winner} wins!`}\n` +
        `Bob: ${bobPoints} pts | Paula: ${paulaPoints} pts\n` +
        `Champions: Steps-${champions.steps}, Training-${champions.training}`,
  data: {
    type: 'weekly-results',
    winner,
    bobPoints,
    paulaPoints,
    champions
  }
});

// Step 5: Award power-ups
if (champions.steps) {
  await awardPowerUp(champions.steps, 'steps_double', 'Kroki x2 na jeden dzień');
}
if (champions.training) {
  await awardPowerUp(champions.training, 'training_bonus', '+1 pkt za każdy trening');
}
```

### 4. **API Endpoint - Get Daily Data**

```javascript
export default defineComponent({
  async run({ steps, $ }) {
    const { user, date } = steps.trigger.event.query;

    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID,
      filter: {
        and: [
          { property: 'User', select: { equals: user } },
          { property: 'Date', date: { equals: date } }
        ]
      }
    });

    if (response.results.length === 0) {
      return $.respond({
        status: 404,
        body: { error: 'No data found' }
      });
    }

    const page = response.results[0];
    const data = {
      id: page.id,
      date: page.properties.Date.date.start,
      user: page.properties.User.select.name,
      checklist: {
        noSugar: page.properties['No Sugar'].checkbox,
        noAlcohol: page.properties['No Alcohol'].checkbox,
        training: page.properties['Training Done'].checkbox,
        // ... rest of checklist
      },
      points: {
        daily: page.properties['Daily Points'].formula.number,
        bonus: page.properties['Success Bonus'].formula.number,
        streak: page.properties['Streak Bonus'].formula.number,
        total: page.properties['Total Points'].formula.number
      },
      metrics: {
        weight: page.properties.Weight.number,
        bodyFat: page.properties['Body Fat %'].number,
        steps: page.properties.Steps.number
      }
    };

    return $.respond({
      status: 200,
      body: data
    });
  }
});
```

### 5. **API Endpoint - Update Checklist**

```javascript
export default defineComponent({
  async run({ steps, $ }) {
    const { user, date, updates } = steps.trigger.event.body;

    // Find or create entry
    let pageId = await findDailyEntry(user, date);
    if (!pageId) {
      pageId = await createDailyEntry(user, date);
    }

    // Prepare properties update
    const properties = {};

    if (updates.noSugar !== undefined) {
      properties['No Sugar'] = { checkbox: updates.noSugar };
    }
    if (updates.noAlcohol !== undefined) {
      properties['No Alcohol'] = { checkbox: updates.noAlcohol };
    }
    if (updates.training !== undefined) {
      properties['Training Done'] = { checkbox: updates.training };
    }
    // ... map all other fields

    // Update Notion
    await notion.pages.update({
      page_id: pageId,
      properties
    });

    // Recalculate streak if needed
    if (updates.training || updates.morningRoutine) {
      await recalculateStreak(user);
    }

    return $.respond({
      status: 200,
      body: { success: true, pageId }
    });
  }
});
```

### 6. **Notification Scheduler** (Multiple schedules)

```javascript
// Morning Routine Reminder - 7:00
export const morningReminder = async () => {
  await sendPushNotification({
    title: '☀️ Morning Routine Time!',
    body: 'Start your day right with sun salutation and meditation',
    data: { type: 'reminder', category: 'morning' }
  });
};

// Supplements Reminder - 12:00
export const supplementsReminder = async () => {
  await sendPushNotification({
    title: '💊 Supplements Time!',
    body: 'Don\'t forget your lunch supplements',
    data: { type: 'reminder', category: 'supplements' }
  });
};

// Fasting Reminder - 18:30
export const fastingReminder = async () => {
  await sendPushNotification({
    title: '🍽️ Last Meal Reminder!',
    body: 'Finish eating before 19:00 for 2 points (17:00 for 3 points!)',
    data: { type: 'reminder', category: 'fasting' }
  });
};

// Daily Checklist Reminder - 21:00
export const checklistReminder = async () => {
  // Check today's completion
  const today = new Date().toISOString().split('T')[0];
  const bobData = await getDailyData('Bob', today);
  const paulaData = await getDailyData('Paula', today);

  if (!bobData || bobData.points.daily < 8) {
    await sendPushNotification({
      title: '📝 Bob - Complete Your Checklist!',
      body: `Current: ${bobData?.points.daily || 0} points. Need ${8 - (bobData?.points.daily || 0)} more!`,
      user: 'bob'
    });
  }

  if (!paulaData || paulaData.points.daily < 8) {
    await sendPushNotification({
      title: '📝 Paula - Complete Your Checklist!',
      body: `Current: ${paulaData?.points.daily || 0} points. Need ${8 - (paulaData?.points.daily || 0)} more!`,
      user: 'paula'
    });
  }
};
```

## 🔑 Environment Variables Required

```bash
# Notion
NOTION_API_KEY=secret_xxxxx
NOTION_DATABASE_ID=xxxxx

# Withings
BOB_WITHINGS_USER_ID=xxxxx
BOB_WITHINGS_TOKEN=xxxxx
PAULA_WITHINGS_USER_ID=xxxxx
PAULA_WITHINGS_TOKEN=xxxxx

# Push Notifications
VAPID_PUBLIC_KEY=xxxxx
VAPID_PRIVATE_KEY=xxxxx

# App
APP_URL=https://your-app.vercel.app
API_SECRET=random-secret-key
```

## 📊 Helper Functions

```javascript
// Find daily entry
async function findDailyEntry(user, date) {
  const response = await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_ID,
    filter: {
      and: [
        { property: 'User', select: { equals: user } },
        { property: 'Date', date: { equals: date } }
      ]
    }
  });
  return response.results[0]?.id || null;
}

// Create daily entry
async function createDailyEntry(user, date) {
  const response = await notion.pages.create({
    parent: { database_id: process.env.NOTION_DATABASE_ID },
    properties: {
      'Date': { date: { start: date } },
      'User': { select: { name: user } }
    }
  });
  return response.id;
}

// Get week number
function getWeekNumber(date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}
```

## 🚀 Testing Endpoints

Use these URLs to test your Pipedream workflows:

```bash
# Get daily data
GET https://your-pipedream-url.m.pipedream.net/daily?user=Bob&date=2024-01-15

# Update checklist
POST https://your-pipedream-url.m.pipedream.net/checklist
{
  "user": "Bob",
  "date": "2024-01-15",
  "updates": {
    "noSugar": true,
    "training": true
  }
}

# Get weekly competition
GET https://your-pipedream-url.m.pipedream.net/competition/current

# Trigger sync manually
POST https://your-pipedream-url.m.pipedream.net/sync
```