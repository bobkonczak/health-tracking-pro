import { Client } from '@notionhq/client';
import { DailyEntry, User } from '@/src/types';

// Initialize Notion client
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const databaseId = process.env.NOTION_DATABASE_ID!;

// Helper function to format date for Notion
function formatDateForNotion(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Create a new daily entry in Notion
export async function createDailyEntry(entry: DailyEntry) {
  try {
    const response = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        Date: {
          date: {
            start: entry.date,
          },
        },
        User: {
          select: {
            name: entry.user,
          },
        },
        'No Sugar': {
          checkbox: entry.checklist.noSugar,
        },
        'No Alcohol': {
          checkbox: entry.checklist.noAlcohol,
        },
        'Fasting Time': {
          rich_text: [
            {
              text: {
                content: entry.checklist.fastingTime || '',
              },
            },
          ],
        },
        'Fasting Points': {
          number: entry.checklist.fastingPoints,
        },
        'Training': {
          checkbox: entry.checklist.training,
        },
        'Morning Routine': {
          checkbox: entry.checklist.morningRoutine,
        },
        'Sauna': {
          checkbox: entry.checklist.sauna,
        },
        '10k Steps': {
          checkbox: entry.checklist.steps10k,
        },
        'Supplements': {
          checkbox: entry.checklist.supplements,
        },
        'Weighed In': {
          checkbox: entry.checklist.weighedIn,
        },
        'Calories Tracked': {
          checkbox: entry.checklist.caloriesTracked,
        },
        'Daily Points': {
          number: entry.dailyPoints,
        },
        'Bonus Points': {
          number: entry.bonusPoints,
        },
        'Total Points': {
          number: entry.totalPoints,
        },
        'Streak Days': {
          number: entry.streak,
        },
        'Weight': {
          number: entry.metrics?.weight || 0,
        },
        'Body Fat %': {
          number: entry.metrics?.bodyFat || 0,
        },
        'Muscle Mass': {
          number: entry.metrics?.muscleMass || 0,
        },
        'Steps': {
          number: entry.metrics?.steps || 0,
        },
        'Notes': {
          rich_text: [
            {
              text: {
                content: entry.notes || '',
              },
            },
          ],
        },
      },
    });
    return response;
  } catch (error) {
    console.error('Error creating Notion entry:', error);
    throw error;
  }
}

// Get entries for a specific user and date range
export async function getDailyEntries(
  user: User,
  startDate: string,
  endDate: string
): Promise<DailyEntry[]> {
  try {
    // TODO: Fix Notion API v5 compatibility
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await (notion as any).databases.query({
      database_id: databaseId,
      filter: {
        and: [
          {
            property: 'User',
            select: {
              equals: user,
            },
          },
          {
            property: 'Date',
            date: {
              on_or_after: startDate,
            },
          },
          {
            property: 'Date',
            date: {
              on_or_before: endDate,
            },
          },
        ],
      },
      sorts: [
        {
          property: 'Date',
          direction: 'descending',
        },
      ],
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return response.results.map((page: Record<string, any>) => ({
      id: page.id,
      date: page.properties.Date.date.start,
      user: page.properties.User.select.name,
      checklist: {
        noSugar: page.properties['No Sugar'].checkbox,
        noAlcohol: page.properties['No Alcohol'].checkbox,
        fastingTime: page.properties['Fasting Time'].rich_text[0]?.text.content || undefined,
        fastingPoints: page.properties['Fasting Points'].number,
        training: page.properties['Training'].checkbox,
        morningRoutine: page.properties['Morning Routine'].checkbox,
        sauna: page.properties['Sauna'].checkbox,
        steps10k: page.properties['10k Steps'].checkbox,
        supplements: page.properties['Supplements'].checkbox,
        weighedIn: page.properties['Weighed In'].checkbox,
        caloriesTracked: page.properties['Calories Tracked'].checkbox,
      },
      metrics: {
        weight: page.properties['Weight'].number,
        bodyFat: page.properties['Body Fat %'].number,
        muscleMass: page.properties['Muscle Mass'].number,
        steps: page.properties['Steps'].number,
      },
      dailyPoints: page.properties['Daily Points'].number,
      bonusPoints: page.properties['Bonus Points'].number,
      totalPoints: page.properties['Total Points'].number,
      streak: page.properties['Streak Days'].number,
      notes: page.properties['Notes'].rich_text[0]?.text.content || undefined,
    }));
  } catch (error) {
    console.error('Error fetching Notion entries:', error);
    throw error;
  }
}

// Update an existing daily entry
export async function updateDailyEntry(pageId: string, updates: Partial<DailyEntry>) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const properties: Record<string, any> = {};

    if (updates.checklist) {
      if (updates.checklist.noSugar !== undefined) {
        properties['No Sugar'] = { checkbox: updates.checklist.noSugar };
      }
      if (updates.checklist.noAlcohol !== undefined) {
        properties['No Alcohol'] = { checkbox: updates.checklist.noAlcohol };
      }
      if (updates.checklist.training !== undefined) {
        properties['Training'] = { checkbox: updates.checklist.training };
      }
      // Add other checklist items as needed...
    }

    if (updates.dailyPoints !== undefined) {
      properties['Daily Points'] = { number: updates.dailyPoints };
    }
    if (updates.bonusPoints !== undefined) {
      properties['Bonus Points'] = { number: updates.bonusPoints };
    }
    if (updates.totalPoints !== undefined) {
      properties['Total Points'] = { number: updates.totalPoints };
    }

    const response = await notion.pages.update({
      page_id: pageId,
      properties,
    });

    return response;
  } catch (error) {
    console.error('Error updating Notion entry:', error);
    throw error;
  }
}

// Get today's entry for a user
export async function getTodayEntry(user: User): Promise<DailyEntry | null> {
  const today = formatDateForNotion(new Date());
  const entries = await getDailyEntries(user, today, today);
  return entries.length > 0 ? entries[0] : null;
}

// Get weekly competition data
export async function getWeeklyCompetitionData(weekStartDate: string) {
  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekEndDate.getDate() + 6);

  const [bobEntries, paulaEntries] = await Promise.all([
    getDailyEntries('Bob', weekStartDate, formatDateForNotion(weekEndDate)),
    getDailyEntries('Paula', weekStartDate, formatDateForNotion(weekEndDate)),
  ]);

  const bobPoints = bobEntries.reduce((sum, entry) => sum + entry.totalPoints, 0);
  const paulaPoints = paulaEntries.reduce((sum, entry) => sum + entry.totalPoints, 0);

  return {
    bobPoints,
    paulaPoints,
    winner: bobPoints > paulaPoints ? 'Bob' : paulaPoints > bobPoints ? 'Paula' : null,
    bobEntries,
    paulaEntries,
  };
}