-- Migration: Make doctor_id nullable in lab_requests table
ALTER TABLE lab_requests ALTER COLUMN doctor_id INT NULL;
