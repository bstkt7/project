/*
  # Add ticket comments table

  1. New Tables
    - `ticket_comments`
      - `id` (uuid, primary key)
      - `ticket_id` (uuid, foreign key to tickets)
      - `content` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `ticket_comments` table
    - Add policies for public access
*/

CREATE TABLE IF NOT EXISTS ticket_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES tickets(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
  ON ticket_comments
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert"
  ON ticket_comments
  FOR INSERT
  TO public
  WITH CHECK (true);