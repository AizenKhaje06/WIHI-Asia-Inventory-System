-- Migration: Auto-calculate bundle quantity using database function
-- Date: 2026-03-08
-- Description: Create a function that automatically calculates and updates bundle quantity based on component items

-- Drop existing function first
DROP FUNCTION IF EXISTS calculate_bundle_virtual_stock(text);

-- Function to calculate virtual stock for a bundle
CREATE OR REPLACE FUNCTION calculate_bundle_virtual_stock(bundle_id_param TEXT)
RETURNS INTEGER AS $$
DECLARE
  min_quantity INTEGER := 2147483647; -- Start with max integer
  component_record RECORD;
  can_make INTEGER;
BEGIN
  -- Loop through all bundle items
  FOR component_record IN 
    SELECT bi.item_id, bi.quantity as needed_quantity, i.quantity as available_quantity
    FROM bundle_items bi
    JOIN inventory i ON i.id = bi.item_id
    WHERE bi.bundle_id = bundle_id_param
  LOOP
    -- Calculate how many bundles can be made from this component
    can_make := FLOOR(component_record.available_quantity / component_record.needed_quantity);
    
    -- Keep track of the minimum (limiting factor)
    IF can_make < min_quantity THEN
      min_quantity := can_make;
    END IF;
  END LOOP;
  
  -- If no items found or can't make any, return 0
  IF min_quantity = 2147483647 OR min_quantity < 0 THEN
    RETURN 0;
  END IF;
  
  RETURN min_quantity;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to auto-update bundle quantity after bundle_items insert
CREATE OR REPLACE FUNCTION update_bundle_quantity_after_items()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the bundle's quantity based on virtual stock calculation
  UPDATE bundles
  SET quantity = calculate_bundle_virtual_stock(NEW.bundle_id)
  WHERE id = NEW.bundle_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on bundle_items table
DROP TRIGGER IF EXISTS trigger_update_bundle_quantity ON bundle_items;
CREATE TRIGGER trigger_update_bundle_quantity
AFTER INSERT ON bundle_items
FOR EACH ROW
EXECUTE FUNCTION update_bundle_quantity_after_items();

-- Also update existing bundles
DO $$
DECLARE
  bundle_record RECORD;
BEGIN
  FOR bundle_record IN SELECT id FROM bundles WHERE is_active = true
  LOOP
    UPDATE bundles
    SET quantity = calculate_bundle_virtual_stock(bundle_record.id)
    WHERE id = bundle_record.id;
  END LOOP;
END $$;

-- Add comment
COMMENT ON FUNCTION calculate_bundle_virtual_stock IS 'Calculates how many bundles can be made based on component item availability';
COMMENT ON FUNCTION update_bundle_quantity_after_items IS 'Trigger function to auto-update bundle quantity when bundle items are added';
