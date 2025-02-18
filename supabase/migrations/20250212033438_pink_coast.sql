/*
  # Add admin notes table

  1. New Tables
    - `admin_notes`
      - `id` (uuid, primary key)
      - `title` (text)
      - `content` (text)
      - `created_at` (timestamp)
  2. Security
    - Enable RLS on `admin_notes` table
    - Add policy for public read access
    - Add policy for public insert
*/

CREATE TABLE IF NOT EXISTS admin_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
  ON admin_notes
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert"
  ON admin_notes
  FOR INSERT
  TO public
  WITH CHECK (true);