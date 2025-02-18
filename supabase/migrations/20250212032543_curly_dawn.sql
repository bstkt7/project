/*
  # Create tickets table

  1. New Tables
    - `tickets`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text) 
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `tickets` table
    - Add policy for public read access
*/

CREATE TABLE IF NOT EXISTS tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
  ON tickets
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert"
  ON tickets
  FOR INSERT
  TO public
  WITH CHECK (true);