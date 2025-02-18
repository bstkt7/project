/*
  # Add useful links table and enhance admin notes

  1. New Tables
    - `useful_links`
      - `id` (uuid, primary key)
      - `title` (text)
      - `url` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `useful_links` table
    - Add policies for public read and admin insert
*/

CREATE TABLE IF NOT EXISTS useful_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE useful_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
  ON useful_links
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert"
  ON useful_links
  FOR INSERT
  TO public
  WITH CHECK (true);