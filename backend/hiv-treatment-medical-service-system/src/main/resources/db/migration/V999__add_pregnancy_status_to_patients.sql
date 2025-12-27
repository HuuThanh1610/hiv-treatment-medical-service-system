-- Migration to add is_pregnant column to patients table
ALTER TABLE patients ADD COLUMN is_pregnant BOOLEAN DEFAULT FALSE;
