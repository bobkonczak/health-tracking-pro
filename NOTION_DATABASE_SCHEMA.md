# Notion Database Schema - Health Tracking Pro

## Main Database: "Health Tracking Pro"

### Properties / Columns

| Property Name | Type | Description | Formula/Settings |
|---------------|------|-------------|------------------|
| **Date** | Date | Data wpisu | Primary sort key |
| **User** | Select | Bob / Paula | Options: Bob, Paula |
| **No Sugar** | Checkbox | Brak cukru (1 pkt) | - |
| **No Alcohol** | Checkbox | Brak alkoholu (1 pkt) | - |
| **Fasting Time** | Text | Godzina ostatniego posiłku | Format: "19:00" |
| **Fasting Points** | Number | Punkty za fasting (0-3) | 0 = po 19:00, 2 = przed 19:00, 3 = przed 17:00 |
| **Training** | Checkbox | Zrobiony trening (2 pkt) | - |
| **Morning Routine** | Checkbox | Morning routine (3 pkt) | - |
| **Sauna** | Checkbox | Sauna (1 pkt) | - |
| **10k Steps** | Checkbox | 10k+ kroków (2 pkt) | Auto-check from Withings |
| **Supplements** | Checkbox | Suplementy wzięte (1 pkt) | - |
| **Weighed In** | Checkbox | Ważenie się (1 pkt) | Auto-check from Withings |
| **Calories Tracked** | Checkbox | Spisane kalorie (2 pkt) | - |
| **Daily Points** | Formula | Suma punktów dziennych | Sum of all checklist points |
| **Bonus Points** | Number | Punkty bonusowe | Success levels + streaks |
| **Total Points** | Formula | Razem punkty | Daily Points + Bonus Points |
| **Streak Days** | Number | Dni streak (8+ pkt) | Calculated by Pipedream |
| **Weight** | Number | Waga (kg) | From Withings API |
| **Body Fat %** | Number | Procent tłuszczu | From Withings API |
| **Muscle Mass** | Number | Masa mięśniowa (kg) | From Withings API |
| **Water %** | Number | Procent wody | From Withings API |
| **Steps** | Number | Liczba kroków | From Withings API |
| **Heart Rate** | Number | Średnie tętno | From Withings API |
| **Sleep Score** | Number | Jakość snu (0-100) | From Withings API |
| **Week Number** | Formula | Numer tygodnia | week(prop("Date")) |
| **Champions** | Multi-select | Championi tygodnia | Steps, Training, Streak, Progress, Perfect |
| **Power Ups Active** | Multi-select | Aktywne power-ups | StepsX2, TrainingBonus, Shield, etc. |
| **Period** | Checkbox | Okres (Paula) | For filtering out period weight gains |
| **Notes** | Text | Notatki | Optional daily notes |
| **Created Time** | Created time | Czas utworzenia | Auto-generated |
| **Last Edited** | Last edited time | Ostatnia edycja | Auto-generated |

## Formulas

### Daily Points Formula
```
if(prop("No Sugar"), 1, 0) +
if(prop("No Alcohol"), 1, 0) +
prop("Fasting Points") +
if(prop("Training"), 2, 0) +
if(prop("Morning Routine"), 3, 0) +
if(prop("Sauna"), 1, 0) +
if(prop("10k Steps"), 2, 0) +
if(prop("Supplements"), 1, 0) +
if(prop("Weighed In"), 1, 0) +
if(prop("Calories Tracked"), 2, 0)
```

### Total Points Formula
```
prop("Daily Points") + prop("Bonus Points")
```

### Week Number Formula
```
week(prop("Date"))
```

## Views

### 1. Today Dashboard
- **Filter:** Date = Today
- **Sort:** User (A to Z)
- **Display:** All properties visible

### 2. Weekly Competition
- **Group by:** Week Number
- **Filter:** Date within current week
- **Sort:** Total Points (descending)
- **Display:** User, Daily Points, Bonus Points, Total Points

### 3. Bob Stats
- **Filter:** User = Bob
- **Sort:** Date (descending)
- **Display:** Date, checklist items, metrics, points

### 4. Paula Stats
- **Filter:** User = Paula
- **Sort:** Date (descending)
- **Display:** Date, checklist items, metrics, points

### 5. Calendar View
- **View Type:** Calendar
- **Group by:** Date
- **Color by:** Total Points (gradient)

### 6. Charts Data
- **Filter:** None (all data)
- **Sort:** Date (ascending)
- **Display:** Essential fields for chart generation

### 7. Streaks & Records
- **Filter:** Daily Points >= 8
- **Sort:** Streak Days (descending)
- **Display:** User, Date, Streak Days, Total Points

### 8. Body Metrics
- **Filter:** Weight > 0 OR Body Fat % > 0
- **Sort:** Date (descending)
- **Display:** User, Date, Weight, Body Fat %, Muscle Mass

## Database Setup Instructions

1. **Create new database in Notion**
2. **Add all properties** with correct types and settings
3. **Set up formulas** for calculated fields
4. **Create views** as specified above
5. **Configure API integration**:
   - Get Integration Token
   - Share database with integration
   - Copy Database ID
6. **Test API connection** with sample data

## Pipedream Integration Points

### Withings Sync (Daily - 8:00 AM)
- Fetch weight, body composition, steps
- Auto-check "Weighed In" and "10k Steps"
- Update metrics fields

### Streak Calculation (Daily - 23:55)
- Calculate current streaks for both users
- Update "Streak Days" field
- Calculate and set "Bonus Points"

### Weekly Competition (Sunday - 20:00)
- Sum weekly points for both users
- Determine champions in each category
- Award power-ups
- Send notifications

### Achievement System (Real-time)
- Monitor for achievement unlocks
- Update achievement fields
- Trigger celebration notifications

## Data Validation Rules

1. **Date**: Must be between 2024-09-15 and today
2. **Fasting Time**: Must be valid time format (HH:MM)
3. **Points**: Cannot be negative
4. **Weight**: Between 40-150 kg (reasonable range)
5. **Body Fat %**: Between 5-50% (reasonable range)
6. **Steps**: Between 0-50000 (reasonable range)

## Backup & Export

- **Daily backup**: Export to JSON via Pipedream
- **Weekly export**: CSV for external analysis
- **Monthly archive**: Full database export
- **Restore procedure**: Import from backup files