-- Migration: Remove category and sku columns from bundles table
-- Date: 2026-03-08
-- Description: Remove unused category and sku fields from bundles table

-- Step 1: Drop the products_unified view first (it depends on category column)
DROP VIEW IF EXISTS products_unified CASCADE;

-- Step 2: Remove category column from bundles table
ALTER TABLE bundles DROP COLUMN IF EXISTS category;

-- Step 3: Remove sku column from bundles table
ALTER TABLE bundles DROP COLUMN IF EXISTS sku;

-- Add comment
COMMENT ON TABLE bundles IS 'Bundles table without category and sku fields - simplified structure';
