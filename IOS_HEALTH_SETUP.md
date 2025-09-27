# iOS Health Integration Setup

This guide shows how to set up automatic health data sync from iOS Health app to your Health Tracking Pro dashboard.

## 🎯 Benefits

✅ **Automatic data entry** - No more manual input
✅ **Real-time updates** - Data syncs instantly
✅ **Accurate tracking** - Direct from Apple Health
✅ **Auto-calculations** - Points updated automatically

## 📱 iOS Shortcuts Setup

### Step 1: Create the Shortcut

1. Open **Shortcuts** app on iPhone
2. Tap **"+"** to create new shortcut
3. Name it: **"Health Sync"**

### Step 2: Add Health Data Actions

Add these actions in order:

#### Get Steps Count
1. **Get Numbers from Input** → Set to "Latest Sample"
2. **Get Health Sample** → Choose "Steps" → "Today"

#### Get Weight
1. **Get Health Sample** → Choose "Weight" → "Latest Sample"

#### Get Heart Rate
1. **Get Health Sample** → Choose "Resting Heart Rate" → "Latest Sample"

#### Get Body Fat (if available)
1. **Get Health Sample** → Choose "Body Fat Percentage" → "Latest Sample"

### Step 3: Format and Send Data

#### Create JSON
1. **Get Contents of URL**
   - URL: `https://your-app.vercel.app/api/health-data`
   - Method: **POST**
   - Headers: `Content-Type: application/json`

#### Request Body (Text):
```json
{
  "user": "Bob",
  "date": "2024-01-15",
  "metrics": {
    "steps": [Steps from Health],
    "weight": [Weight from Health],
    "heartRate": [Heart Rate from Health],
    "bodyFat": [Body Fat from Health]
  }
}
```

### Step 4: Set Variables

Replace placeholders:
- **Date**: Use "Get Current Date" → Format as "YYYY-MM-DD"
- **User**: Set to "Bob" or "Paula"
- **Health Values**: Use the health samples from previous steps

## 🔄 Automation Options

### Option 1: Manual Trigger
- Run shortcut manually each morning
- Best for starting out

### Option 2: Time-Based Automation
1. **Automation** tab in Shortcuts
2. **Create Personal Automation**
3. **Time of Day** → Set to 8:00 AM
4. **Run** → Select your "Health Sync" shortcut
5. Enable **"Run Immediately"**

### Option 3: Location-Based
- Trigger when arriving at gym
- Trigger when leaving home in morning

## 📊 What Gets Auto-Updated

When health data is received, the app automatically:

### ✅ Checklist Items
- **10k+ Steps** → +2 points
- **Weighed In** → +1 point

### 📈 Health Tracking
- Weight progress toward goal
- Body fat percentage trends
- Steps averages and streaks

### 🏆 Competition Points
- Daily totals recalculated
- Streaks updated
- Weekly competition scores

## 🛠️ Technical Details

### Webhook Endpoint
```
POST /api/health-data
```

### Expected Data Format
```json
{
  "user": "Bob" | "Paula",
  "date": "YYYY-MM-DD",
  "metrics": {
    "steps": number,
    "weight": number, // kg
    "heartRate": number, // bpm
    "bodyFat": number, // percentage
    "muscleMass": number, // kg (optional)
    "waterPercentage": number, // percentage (optional)
    "sleepScore": number // 0-100 (optional)
  }
}
```

### Response
```json
{
  "success": true,
  "data": {
    "healthMetrics": {...},
    "dailyEntry": {...},
    "autoUpdates": {
      "steps10k": true,
      "weighedIn": true
    }
  }
}
```

## 🔧 Troubleshooting

### Shortcut Not Working?
1. Check iOS Health permissions
2. Verify app URL is correct
3. Ensure WiFi/cellular connection
4. Check shortcut actions order

### Missing Data?
- Some metrics require specific devices (Apple Watch, smart scale)
- Body fat requires compatible scale or manual entry
- Sleep data requires Apple Watch or third-party app

### Manual Backup
- App includes manual entry forms
- Use when automatic sync unavailable
- Data combines automatically

## 🔒 Privacy & Security

- Health data never leaves your devices except to your app
- No third-party analytics or tracking
- Data stored securely in Supabase
- You control all data export/deletion

## 📋 Setup Checklist

- [ ] Health Tracking Pro app deployed
- [ ] Supabase database configured
- [ ] iOS Shortcuts app installed
- [ ] Health permissions granted
- [ ] "Health Sync" shortcut created
- [ ] Test shortcut with sample data
- [ ] Set up automation (optional)
- [ ] Verify auto-calculations work

## 🎮 Pro Tips

1. **Test First**: Run shortcut manually before automation
2. **Multiple Users**: Create separate shortcuts for Bob & Paula
3. **Rich Notifications**: Add notification actions to see results
4. **Backup Plan**: Keep manual entry available
5. **Data Validation**: App validates all incoming data

Ready to go bulletproof with your health tracking! 💪