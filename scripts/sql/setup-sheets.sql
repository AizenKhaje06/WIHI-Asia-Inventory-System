-- This is a reference for the Google Sheets structure
-- You need to manually create these sheets in your Google Sheets document

-- Sheet 1: Inventory
-- Columns: ID, Name, SKU, Category, Quantity, Cost Price, Selling Price, Reorder Level, Supplier, Last Updated

-- Sheet 2: Transactions
-- Columns: ID, Item ID, Item Name, Quantity, Cost Price, Selling Price, Total Cost, Total Revenue, Profit, Timestamp, Type

-- Example data for Inventory sheet:
-- ITEM-1234567890, Laptop, LAP-001, Electronics, 50, 800.00, 1200.00, 10, Tech Supplier, 2025-01-10T10:00:00Z
-- ITEM-1234567891, Mouse, MOU-001, Accessories, 200, 10.00, 25.00, 50, Office Supplies Co, 2025-01-10T10:00:00Z

-- Example data for Transactions sheet:
-- TXN-1234567890, ITEM-1234567890, Laptop, 2, 800.00, 1200.00, 1600.00, 2400.00, 800.00, 2025-01-10T14:30:00Z, sale
