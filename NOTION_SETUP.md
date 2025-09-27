# Notion Database Setup Guide

## 1. Utwórz nową bazę danych "Health Tracking Pro"

## 2. Dodaj następujące kolumny:

### Podstawowe
- **Date** (Date) - Data wpisu
- **User** (Select) - Opcje: Bob, Paula
- **Week Number** (Formula) - `weeknumber(prop("Date"))`

### Checklist Items (wszystkie Checkbox)
- **No Sugar** (Checkbox)
- **No Alcohol** (Checkbox)
- **Training Done** (Checkbox)
- **Morning Routine** (Checkbox)
- **Sauna** (Checkbox)
- **Supplements Taken** (Checkbox)
- **Calories Tracked** (Checkbox)

### Fasting
- **Fasting Time** (Text) - Godzina ostatniego posiłku (np. "17:30")
- **Fasting Points** (Formula):
```
if(prop("Fasting Time") != "",
  if(toNumber(slice(prop("Fasting Time"), 0, 2)) < 17, 3,
    if(toNumber(slice(prop("Fasting Time"), 0, 2)) < 19, 2, 0)), 0)
```

### Body Metrics (z Withings)
- **Weight** (Number)
- **Body Fat %** (Number)
- **Muscle Mass** (Number)
- **Water %** (Number)
- **Steps** (Number)
- **Steps Achieved** (Checkbox) - Auto gdy Steps >= 10000
- **Weighed In** (Checkbox) - Auto gdy jest Weight
- **Heart Rate** (Number)
- **Sleep Score** (Number)

### Punktacja
- **Daily Points** (Formula):
```
toNumber(prop("No Sugar")) +
toNumber(prop("No Alcohol")) +
prop("Fasting Points") +
toNumber(prop("Training Done")) * 2 +
toNumber(prop("Morning Routine")) * 3 +
toNumber(prop("Sauna")) +
toNumber(prop("Steps Achieved")) * 2 +
toNumber(prop("Supplements Taken")) +
toNumber(prop("Weighed In")) +
toNumber(prop("Calories Tracked")) * 2
```

- **Success Level** (Formula):
```
if(prop("Daily Points") >= 12, "🌟 Gold",
  if(prop("Daily Points") >= 10, "⚪ Silver",
    if(prop("Daily Points") >= 8, "🟤 Bronze", "❌ Failed")))
```

- **Success Bonus** (Formula):
```
if(prop("Daily Points") >= 12, 5,
  if(prop("Daily Points") >= 10, 3,
    if(prop("Daily Points") >= 8, 2, 0)))
```

### Streaks & Competition
- **Streak Days** (Number) - Manualne lub przez Pipedream
- **Streak Bonus** (Formula):
```
if(prop("Streak Days") >= 15, 15,
  if(prop("Streak Days") >= 10, 10,
    if(prop("Streak Days") >= 7, 5,
      if(prop("Streak Days") >= 5, 3,
        if(prop("Streak Days") >= 3, 2, 0)))))
```

- **Total Points** (Formula):
```
prop("Daily Points") + prop("Success Bonus") + prop("Streak Bonus")
```

- **Champions** (Multi-select) - Steps, Training, Streak, Progress, Perfect
- **Power Ups Active** (Multi-select) - Lista aktywnych power-upów

### Dodatkowe
- **Notes** (Text) - Notatki
- **Morning Routine Details** (Text) - Szczegóły porannej rutyny
- **Period Day** (Checkbox) - Dla Pauli
- **Photo** (Files & media) - Progress photos

## 3. Utwórz Views:

### 📊 Today Dashboard
- Filter: Date is Today
- Sort: User
- Properties: User, wszystkie checklisty, Daily Points, Total Points

### 🏆 Weekly Competition
- Group by: Week Number
- Sort: Total Points (descending)
- Properties: User, Sum of Total Points

### 👤 Bob's Stats
- Filter: User is Bob
- Sort: Date (descending)
- Properties: Date, Daily Points, Weight, Body Fat %

### 👤 Paula's Stats
- Filter: User is Paula
- Sort: Date (descending)
- Properties: Date, Daily Points, Weight

### 📈 Charts Data
- Sort: Date
- Properties: Date, User, Weight, Body Fat %, Daily Points

### 🔥 Streaks & Records
- Sort: Streak Days (descending)
- Properties: Date, User, Streak Days, Total Points

### 📅 Calendar View
- View type: Calendar
- Properties: User, Daily Points, Success Level

### 🎯 Goals Tracking
- Filter: Weighed In is Checked
- Properties: Date, User, Weight, Body Fat %, Progress %

## 4. Integracja z Pipedream

### Uzyskaj Notion API Key:
1. Idź do https://www.notion.so/my-integrations
2. Kliknij "New integration"
3. Nazwa: "Health Tracking Pro"
4. Skopiuj "Internal Integration Token"

### Udostępnij bazę:
1. Otwórz bazę w Notion
2. Kliknij "Share" (prawy górny róg)
3. Invite your integration
4. Wybierz "Health Tracking Pro"

### Znajdź Database ID:
1. Otwórz bazę w przeglądarce
2. Skopiuj URL
3. Database ID to 32 znaki po notion.so/ i przed ?
   Przykład: `https://notion.so/abc123def456...` → `abc123def456...`

## 5. Formuły dla Weekly Competition

### Weekly Points Sum (nowa baza lub view):
```
// Grupuj po Week Number i User
// Sumuj Total Points dla każdego tygodnia
```

### Winner Formula:
```
if(prop("Bob Weekly Points") > prop("Paula Weekly Points"), "🏆 Bob",
  if(prop("Paula Weekly Points") > prop("Bob Weekly Points"), "🏆 Paula", "🤝 Remis"))
```

## 6. Automation Rules (via Pipedream):

1. **Auto-check Steps Achieved**: Gdy Steps >= 10000
2. **Auto-check Weighed In**: Gdy Weight jest wypełnione
3. **Update Streak Days**: Codziennie o 23:50
4. **Calculate Weekly Winner**: Niedziela 20:00
5. **Award Power-ups**: Po wyłonieniu championów
6. **Reset Weekly Counters**: Poniedziałek 00:01

---

## Przykładowe zapytania Notion API:

### Pobierz dzisiejsze dane:
```javascript
{
  filter: {
    and: [
      {
        property: "Date",
        date: {
          equals: "2024-01-15" // today
        }
      }
    ]
  }
}
```

### Pobierz dane tygodnia:
```javascript
{
  filter: {
    property: "Week Number",
    formula: {
      number: {
        equals: 3 // current week
      }
    }
  },
  sorts: [
    {
      property: "Total Points",
      direction: "descending"
    }
  ]
}
```