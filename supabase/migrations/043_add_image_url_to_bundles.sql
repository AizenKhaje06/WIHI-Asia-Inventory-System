-- Migration: Add image_url column to bundles table
-- Date: 2026-05-28
-- Description: Add image_url column to support bundle images

-- Add image_url column to bundles table
ALTER TABLE bundles ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add comment
COMMENT ON COLUMN bundles.image_url IS 'URL to bundle product image in Supabase storage';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_bundles_image_url ON bundles(image_url) WHERE image_url IS NOT NULL;
