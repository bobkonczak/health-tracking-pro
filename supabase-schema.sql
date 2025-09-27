-- Health Tracking Pro Database Schema for Supabase
-- Run this in your Supabase SQL editor

-- Enable Row Level Security
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User enum type
CREATE TYPE user_type AS ENUM ('Bob', 'Paula');

-- Daily entries table - main checklist and points
CREATE TABLE daily_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  date DATE NOT NULL,
  user_name user_type NOT NULL,

  -- Checklist items
  no_sugar BOOLEAN DEFAULT FALSE,
  no_alcohol BOOLEAN DEFAULT FALSE,
  fasting_time TIME,
  fasting_points INTEGER DEFAULT 0,
  training BOOLEAN DEFAULT FALSE,
  morning_routine BOOLEAN DEFAULT FALSE,
  sauna BOOLEAN DEFAULT FALSE,
  steps_10k BOOLEAN DEFAULT FALSE,
  supplements BOOLEAN DEFAULT FALSE,
  weighed_in BOOLEAN DEFAULT FALSE,
  calories_tracked BOOLEAN DEFAULT FALSE,

  -- Points calculation
  daily_points INTEGER DEFAULT 0,
  bonus_points INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,

  -- Metadata
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure one entry per user per day
  UNIQUE(date, user_name)
);

-- Health metrics table - automated from iOS Health
CREATE TABLE health_metrics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  date DATE NOT NULL,
  user_name user_type NOT NULL,

  -- Body metrics
  weight DECIMAL(5,2), -- kg
  body_fat DECIMAL(4,1), -- percentage
  muscle_mass DECIMAL(5,2), -- kg
  water_percentage DECIMAL(4,1), -- percentage

  -- Activity metrics
  steps INTEGER,
  heart_rate INTEGER, -- resting heart rate
  sleep_score INTEGER, -- 0-100

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure one entry per user per day
  UNIQUE(date, user_name)
);

-- Weekly competitions table
CREATE TABLE competitions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  week_number INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,

  -- Points
  bob_points INTEGER DEFAULT 0,
  paula_points INTEGER DEFAULT 0,
  winner user_type,

  -- Champions in different categories
  steps_champion user_type,
  training_champion user_type,
  streak_champion user_type,
  body_progress_champion user_type,
  perfect_days_champion user_type,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(week_number, start_date)
);

-- Streaks tracking table
CREATE TABLE streaks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_name user_type UNIQUE NOT NULL,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  last_activity_date DATE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers to all tables
CREATE TRIGGER update_daily_entries_updated_at
  BEFORE UPDATE ON daily_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_health_metrics_updated_at
  BEFORE UPDATE ON health_metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_competitions_updated_at
  BEFORE UPDATE ON competitions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_streaks_updated_at
  BEFORE UPDATE ON streaks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-update checklist based on health metrics
CREATE OR REPLACE FUNCTION update_daily_entry_from_health_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update daily entry with health-based achievements
  INSERT INTO daily_entries (date, user_name, steps_10k, weighed_in)
  VALUES (
    NEW.date,
    NEW.user_name,
    CASE WHEN NEW.steps >= 10000 THEN TRUE ELSE FALSE END,
    CASE WHEN NEW.weight IS NOT NULL THEN TRUE ELSE FALSE END
  )
  ON CONFLICT (date, user_name)
  DO UPDATE SET
    steps_10k = CASE WHEN NEW.steps >= 10000 THEN TRUE ELSE EXCLUDED.steps_10k END,
    weighed_in = CASE WHEN NEW.weight IS NOT NULL THEN TRUE ELSE EXCLUDED.weighed_in END,
    updated_at = NOW();

  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update daily entries when health metrics are inserted/updated
CREATE TRIGGER auto_update_daily_entry_from_health
  AFTER INSERT OR UPDATE ON health_metrics
  FOR EACH ROW EXECUTE FUNCTION update_daily_entry_from_health_metrics();

-- Function to calculate daily points
CREATE OR REPLACE FUNCTION calculate_daily_points(entry_id UUID)
RETURNS INTEGER AS $$
DECLARE
  entry_record daily_entries%ROWTYPE;
  points INTEGER := 0;
BEGIN
  SELECT * INTO entry_record FROM daily_entries WHERE id = entry_id;

  -- Calculate points based on checklist
  IF entry_record.no_sugar THEN points := points + 1; END IF;
  IF entry_record.no_alcohol THEN points := points + 1; END IF;
  IF entry_record.fasting_points > 0 THEN points := points + entry_record.fasting_points; END IF;
  IF entry_record.training THEN points := points + 2; END IF;
  IF entry_record.morning_routine THEN points := points + 3; END IF;
  IF entry_record.sauna THEN points := points + 1; END IF;
  IF entry_record.steps_10k THEN points := points + 2; END IF;
  IF entry_record.supplements THEN points := points + 1; END IF;
  IF entry_record.weighed_in THEN points := points + 1; END IF;
  IF entry_record.calories_tracked THEN points := points + 2; END IF;

  -- Update the daily_points in the record
  UPDATE daily_entries
  SET daily_points = points, updated_at = NOW()
  WHERE id = entry_id;

  RETURN points;
END;
$$ language 'plpgsql';

-- Function to calculate bonus points based on streak and daily performance
CREATE OR REPLACE FUNCTION calculate_bonus_points(daily_points INTEGER, streak INTEGER)
RETURNS INTEGER AS $$
DECLARE
  bonus INTEGER := 0;
BEGIN
  -- Bonus for daily performance
  IF daily_points >= 12 THEN bonus := bonus + 5; -- Gold level
  ELSIF daily_points >= 10 THEN bonus := bonus + 3; -- Silver level
  ELSIF daily_points >= 8 THEN bonus := bonus + 2; -- Bronze level
  END IF;

  -- Streak bonuses
  IF streak >= 15 THEN bonus := bonus + 15;
  ELSIF streak >= 10 THEN bonus := bonus + 10;
  ELSIF streak >= 7 THEN bonus := bonus + 5;
  ELSIF streak >= 5 THEN bonus := bonus + 3;
  ELSIF streak >= 3 THEN bonus := bonus + 2;
  END IF;

  RETURN bonus;
END;
$$ language 'plpgsql';

-- Insert initial streak records for both users
INSERT INTO streaks (user_name, current_streak, best_streak, last_activity_date)
VALUES
  ('Bob', 0, 0, CURRENT_DATE),
  ('Paula', 0, 0, CURRENT_DATE)
ON CONFLICT (user_name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX idx_daily_entries_user_date ON daily_entries(user_name, date);
CREATE INDEX idx_health_metrics_user_date ON health_metrics(user_name, date);
CREATE INDEX idx_competitions_week ON competitions(week_number);
CREATE INDEX idx_daily_entries_date ON daily_entries(date);
CREATE INDEX idx_health_metrics_date ON health_metrics(date);

-- Enable Row Level Security (optional - for multi-tenant apps)
-- ALTER TABLE daily_entries ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE daily_entries IS 'Daily checklist entries and points for Bob and Paula';
COMMENT ON TABLE health_metrics IS 'Health data automatically synced from iOS Health app';
COMMENT ON TABLE competitions IS 'Weekly competition tracking and winners';
COMMENT ON TABLE streaks IS 'Current and best streak tracking for both users';