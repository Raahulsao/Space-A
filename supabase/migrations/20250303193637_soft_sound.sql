/*
  # Fix Row-Level Security Policies for Users Table

  1. Changes
     - Update RLS policies to allow inserting new users
     - Add policy for unauthenticated users to insert into users table
     - Ensure authenticated users can update their own data

  2. Security
     - Maintain existing read policies
     - Add specific insert policy for registration flow
*/

-- Allow unauthenticated users to insert into users table (for registration)
CREATE POLICY "Allow unauthenticated users to insert"
  ON public.users
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users to insert into users table (for registration)
CREATE POLICY "Allow authenticated users to insert"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Ensure the update policy works correctly
DROP POLICY IF EXISTS "Users can update own data" ON public.users;

CREATE POLICY "Users can update own data"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);