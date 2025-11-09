-- Add theme column to gift_memberships table
ALTER TABLE gift_memberships 
ADD COLUMN IF NOT EXISTS theme text DEFAULT 'default' CHECK (theme IN ('default', 'christmas', 'birthday', 'adoption'));

-- Add theme column to scheduled_gifts table
ALTER TABLE scheduled_gifts 
ADD COLUMN IF NOT EXISTS theme text DEFAULT 'default' CHECK (theme IN ('default', 'christmas', 'birthday', 'adoption'));

-- Add comment explaining the theme column
COMMENT ON COLUMN gift_memberships.theme IS 'Email template theme: default, christmas, birthday, or adoption';
COMMENT ON COLUMN scheduled_gifts.theme IS 'Email template theme: default, christmas, birthday, or adoption';