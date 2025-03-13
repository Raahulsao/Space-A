/*
  # Create users table and security policies

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `full_name` (text, not null)
      - `username` (text, unique, not null)
      - `gender` (text, not null)
      - `branch` (text, not null)
      - `email` (text, unique, not null)
      - `created_at` (timestamptz, default now())
      - `last_seen` (timestamptz, nullable)
      - `avatar_url` (text, nullable)
  
  2. Security
    - Enable RLS on `users` table
    - Add policies for:
      - Users can read their own data
      - Users can read other users' basic info
      - Users can update their own data
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name text NOT NULL,
  username text UNIQUE NOT NULL,
  gender text NOT NULL CHECK (gender IN ('Male', 'Female')),
  branch text NOT NULL,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  last_seen timestamptz,
  avatar_url text
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow users to read their own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow users to read other users' basic info
CREATE POLICY "Users can read other users' basic info"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() <> id);

-- Allow users to update their own data
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);