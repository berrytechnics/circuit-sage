-- Migration tracking table
-- This table tracks which migrations have been applied to prevent duplicate runs

CREATE TABLE IF NOT EXISTS schema_migrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename VARCHAR(255) NOT NULL UNIQUE,
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  checksum VARCHAR(64),
  execution_time_ms INTEGER
);

-- Create index on filename for faster lookups
CREATE INDEX IF NOT EXISTS idx_schema_migrations_filename ON schema_migrations(filename);
CREATE INDEX IF NOT EXISTS idx_schema_migrations_applied_at ON schema_migrations(applied_at);

-- Add comment
COMMENT ON TABLE schema_migrations IS 'Tracks database migrations to prevent duplicate execution';



