/*
  # Add ticket status field

  1. Changes
    - Add `status` column to `tickets` table with default value 'pending'
    - Add enum type for ticket status
  
  2. Security
    - Update RLS policies to allow status updates
*/

-- Create enum type for ticket status
CREATE TYPE ticket_status AS ENUM ('pending', 'completed');

-- Add status column to tickets table
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS status ticket_status DEFAULT 'pending';

-- Update RLS policies to allow status updates
CREATE POLICY "Allow public update"
  ON tickets
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);