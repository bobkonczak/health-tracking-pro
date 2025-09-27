# 🚀 PIPEDREAM WORKFLOW: Automatyczny Setup Notion Database

## 📋 ZADANIE
Stwórz Pipedream workflow który AUTOMATYCZNIE utworzy bazę danych Notion dla aplikacji "Health Tracking Pro" z wszystkimi wymaganymi polami, formułami i widokami.

## 🎯 CEL
Zamiast ręcznego tworzenia 30+ kolumn w Notion, workflow ma zrobić to wszystko automatycznie w jednym uruchomieniu.

## 📊 SPECYFIKACJA BAZY DANYCH

### Nazwa bazy: "Health Tracking Pro"

### Kolumny do utworzenia:

#### 🔢 Podstawowe
- **Date** (Date) - Data wpisu
- **User** (Select) - Opcje: "Bob", "Paula"  
- **Week Number** (Formula) - `week(prop("Date"))`

#### ✅ Checklist Items (wszystkie Checkbox)
- **No Sugar** (Checkbox) - Brak cukru
- **No Alcohol** (Checkbox) - Brak alkoholu
- **Training Done** (Checkbox) - Zrobiony trening
- **Morning Routine** (Checkbox) - Morning routine
- **Sauna** (Checkbox) - Sauna
- **Supplements Taken** (Checkbox) - Suplementy wzięte
- **Calories Tracked** (Checkbox) - Spisane kalorie

#### 🍽️ Fasting
- **Fasting Time** (Text) - Godzina ostatniego posiłku (format: "17:30")
- **Fasting Points** (Formula):
```
if(prop("Fasting Time") != "", 
  if(toNumber(slice(prop("Fasting Time"), 0, 2)) < 17, 3, 
    if(toNumber(slice(prop("Fasting Time"), 0, 2)) < 19, 2, 0)), 0)
```

#### 📈 Body Metrics (z Withings)
- **Weight** (Number) - Waga w kg
- **Body Fat %** (Number) - Procent tłuszczu
- **Muscle Mass** (Number) - Masa mięśniowa w kg  
- **Water %** (Number) - Procent wody
- **Steps** (Number) - Liczba kroków
- **Steps Achieved** (Checkbox) - Auto gdy Steps >= 10000
- **Weighed In** (Checkbox) - Auto gdy jest Weight
- **Heart Rate** (Number) - Średnie tętno
- **Sleep Score** (Number) - Jakość snu (0-100)

#### 🏆 Punktacja
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

#### 🔥 Streaks & Competition  
- **Streak Days** (Number) - Dni streak (8+ pkt)
- **Streak Bonus** (Formula):
```
if(prop("Streak Days") >= 15, 15, 
  if(prop("Streak Days") >= 10, 10, 
    if(prop("Streak Days") >= 7, 5, 
      if(prop("Streak Days") >= 5, 3, 
        if(prop("Streak Days") >= 3, 2, 0)))))
```

- **Total Points** (Formula): `prop("Daily Points") + prop("Success Bonus") + prop("Streak Bonus")`
- **Champions** (Multi-select) - Opcje: "Steps", "Training", "Streak", "Progress", "Perfect"
- **Power Ups Active** (Multi-select) - Opcje: "StepsX2", "TrainingBonus", "Shield", "BodyProgressX2", "BonusPoints"

#### 📝 Dodatkowe
- **Notes** (Text) - Notatki
- **Morning Routine Details** (Text) - Szczegóły porannej rutyny  
- **Period Day** (Checkbox) - Dla Pauli
- **Photo** (Files & media) - Progress photos

## 🎯 WIDOKI DO UTWORZENIA

1. **📊 Today Dashboard**
   - Filter: Date = Today  
   - Sort: User (A to Z)
   - Properties: Wszystkie podstawowe

2. **🏆 Weekly Competition**
   - Group by: Week Number
   - Sort: Total Points (descending)  
   - Properties: User, Daily Points, Total Points

3. **👤 Bob Stats**
   - Filter: User = Bob
   - Sort: Date (descending)
   - Properties: Date, checklist items, metrics, points

4. **👤 Paula Stats**  
   - Filter: User = Paula
   - Sort: Date (descending)
   - Properties: Date, checklist items, metrics, points

5. **📅 Calendar View**
   - View Type: Calendar
   - Color by: Success Level

6. **📈 Charts Data**
   - Sort: Date (ascending)
   - Properties: Essential fields for charts

## 🔧 WORKFLOW KROKI

### Krok 1: Setup
```javascript
// Import Notion API
const { Client } = require('@notionhq/client');
const notion = new Client({ auth: process.env.NOTION_API_KEY });
```

### Krok 2: Utwórz bazę danych
```javascript
const database = await notion.databases.create({
  parent: {
    type: "page_id",
    page_id: process.env.NOTION_PARENT_PAGE_ID // ID strony gdzie ma być baza
  },
  title: [
    {
      type: "text",
      text: {
        content: "Health Tracking Pro"
      }
    }
  ],
  properties: {
    // ... wszystkie properties według specyfikacji
  }
});
```

### Krok 3: Dodaj sample data
```javascript
// Dodaj przykładowe wpisy dla testowania
const today = new Date().toISOString().split('T')[0];

await notion.pages.create({
  parent: { database_id: database.id },
  properties: {
    "Date": { date: { start: today } },
    "User": { select: { name: "Bob" } },
    "No Sugar": { checkbox: true },
    "Training Done": { checkbox: true },
    // ... więcej sample data
  }
});
```

## 🚀 UŻYCIE

1. Skonfiguruj environment variables:
   - `NOTION_API_KEY` - twój integration token
   - `NOTION_PARENT_PAGE_ID` - ID strony gdzie ma być baza

2. Uruchom workflow

3. Otrzymasz:
   - Database ID nowej bazy
   - Pełny URL do bazy
   - Confirmation wszystkich utworzonych pól i widoków

## ✅ REZULTAT
Po uruchomieniu workflow otrzymasz kompletną bazę danych Notion gotową do integracji z aplikacją Health Tracking Pro - zero ręcznej pracy!

---

**INSTRUKCJA DLA PIPEDREAM:**
Stwórz workflow który wykona wszystkie powyższe kroki automatycznie. Workflow ma zwrócić Database ID i URL nowej bazy na końcu.
