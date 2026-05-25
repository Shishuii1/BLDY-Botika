-- Run if you see "Unknown column" errors on an existing database
USE pharmasys;

ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500) NULL;
ALTER TABLE users ADD COLUMN last_login DATETIME NULL;
ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) NULL;
ALTER TABLE users ADD COLUMN reset_token_expires DATETIME NULL;

-- Ignore "Duplicate column" errors if a column already exists
