-- Add embed_html column to items table for Instagram/Facebook embeds
ALTER TABLE items ADD COLUMN IF NOT EXISTS embed_html TEXT;
