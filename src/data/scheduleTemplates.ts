import type { ScheduleEntry, ScheduleCategory } from '../types';

export interface ScheduleTemplate {
  id: string;
  name: string;
  ageGroup: string;
  description: string;
  entries: Omit<ScheduleEntry, 'id'>[];
}

function entry(
  time: string,
  activity: string,
  category: ScheduleCategory,
  order: number,
  details?: string,
): Omit<ScheduleEntry, 'id'> {
  return { time, activity, category, order, ...(details ? { details } : {}) };
}

export const scheduleTemplates: ScheduleTemplate[] = [
  {
    id: '6mo',
    name: '6 Month Old Routine',
    ageGroup: '~6 months',
    description: 'A typical daytime schedule for a 6-month-old with regular feeds and naps.',
    entries: [
      entry('07:00', 'Wake up & Milk', 'milk', 0),
      entry('08:00', 'Tummy Time', 'tummytime', 1),
      entry('09:00', 'Morning Nap', 'nap', 2),
      entry('10:00', 'Milk', 'milk', 3),
      entry('10:30', 'Walk', 'walk', 4),
      entry('11:30', 'Lunch', 'meal', 5),
      entry('12:00', 'Play', 'play', 6),
      entry('13:00', 'Afternoon Nap', 'nap', 7),
      entry('14:30', 'Milk', 'milk', 8),
      entry('15:00', 'Tummy Time', 'tummytime', 9),
      entry('16:00', 'Walk', 'walk', 10),
      entry('17:00', 'Dinner', 'meal', 11),
      entry('17:30', 'Bath Time', 'bath', 12),
      entry('18:00', 'Milk & Sleep', 'sleep', 13),
    ],
  },
  {
    id: '1yo',
    name: '1 Year Old Routine',
    ageGroup: '~12 months',
    description: 'A typical daytime schedule for a 1-year-old with meals, play and one nap.',
    entries: [
      entry('07:00', 'Wake up & Milk', 'milk', 0),
      entry('07:30', 'Breakfast', 'meal', 1),
      entry('08:30', 'Play', 'play', 2),
      entry('09:30', 'Morning Walk', 'walk', 3),
      entry('10:30', 'Snack & Milk', 'meal', 4),
      entry('11:00', 'Tummy Time / Free Play', 'play', 5),
      entry('12:00', 'Lunch', 'meal', 6),
      entry('12:30', 'Afternoon Nap', 'nap', 7),
      entry('14:30', 'Milk & Snack', 'meal', 8),
      entry('15:00', 'Outdoor Play', 'play', 9),
      entry('16:00', 'Walk', 'walk', 10),
      entry('17:00', 'Dinner', 'meal', 11),
      entry('17:30', 'Bath Time', 'bath', 12),
      entry('18:00', 'Milk', 'milk', 13),
      entry('18:30', 'Storytime & Sleep', 'sleep', 14),
    ],
  },
];
