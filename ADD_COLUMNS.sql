-- Run these commands in Prisma Studio SQL Editor

-- Add user_role column
ALTER TABLE users ADD COLUMN user_role TEXT;

-- Add team column  
ALTER TABLE users ADD COLUMN team TEXT;

