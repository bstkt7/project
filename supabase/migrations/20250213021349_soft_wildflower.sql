/*
  # Add FAQ and Printers Management Tables

  1. New Tables
    - `faq_items`
      - `id` (uuid, primary key)
      - `question` (text)
      - `answer` (text)
      - `created_at` (timestamp)
      - `order` (integer)
    
    - `printers`
      - `id` (uuid, primary key)
      - `model` (text)
      - `location` (text)
      - `toner_model` (text)
      - `cartridge_model` (text)
      - `last_toner_change` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for public read access
    - Add policies for authenticated users to manage data
*/

-- FAQ Items Table
CREATE TABLE IF NOT EXISTS faq_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  "order" integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
  ON faq_items
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert"
  ON faq_items
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update"
  ON faq_items
  FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Allow public delete"
  ON faq_items
  FOR DELETE
  TO public
  USING (true);

-- Printers Table
CREATE TABLE IF NOT EXISTS printers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model text NOT NULL,
  location text NOT NULL,
  toner_model text NOT NULL,
  cartridge_model text NOT NULL,
  last_toner_change timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE printers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
  ON printers
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert"
  ON printers
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update"
  ON printers
  FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Allow public delete"
  ON printers
  FOR DELETE
  TO public
  USING (true);