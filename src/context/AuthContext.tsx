import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types/user';
import { ref, set, serverTimestamp } from 'firebase/database';
import { database } from '../lib/firebase';
import { supabase } from '../lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  signUp: (data: SignUpData) => Promise<{ user: User } | { error: string }>;
  signIn: (data: SignInData) => Promise<{ user: User } | { error: string }>;
  signOut: () => Promise<void>;
  updateUserStatus: (status: boolean) => Promise<void>;
}

interface SignUpData {
  full_name: string;
  username: string;
  gender: 'Male' | 'Female';
  branch: string;
  email: string;
  password: string;
}

interface SignInData {
  email: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Add this new function to sync user data to Firebase
  const syncUserToFirebase = async (userData: User) => {
    try {
      // Store user data in Firebase
      const userRef = ref(database, `users/${userData.id}`);
      await set(userRef, {
        ...userData,
        lastSeen: serverTimestamp()
      });

      // Set initial online status
      const userStatusRef = ref(database, `status/${userData.id}`);
      await set(userStatusRef, {
        isOnline: true,
        lastChanged: serverTimestamp()
      });
    } catch (error) {
      console.error('Error syncing user to Firebase:', error);
    }
  };

  // Initialize user session from Supabase
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          await fetchUserProfile(session.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
      try {
        if (session?.user) {
          await fetchUserProfile(session.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Modify the fetchUserProfile function to sync with Firebase
  const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error) throw error;

      if (profile) {
        const userData: User = {
          id: profile.id,
          full_name: profile.full_name,
          username: profile.username,
          gender: profile.gender,
          branch: profile.branch,
          email: profile.email,
          created_at: profile.created_at,
          last_seen: profile.last_seen || new Date().toISOString(),
          avatar_url: profile.avatar_url
        };
        
        // Sync to Firebase before setting local state
        await syncUserToFirebase(userData);
        setUser(userData);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  };

  const checkUsernameExists = async (username: string): Promise<boolean> => {
    const { data } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .single();
    
    return !!data;
  };

  const signUp = async (data: SignUpData) => {
    try {
      const { email, password, ...userData } = data;

      // Validate username format
      const usernameRegex = /^(STAR|MOON)-\d{3}$/;
      if (!usernameRegex.test(userData.username)) {
        return { error: 'Username must be in format STAR-XXX or MOON-XXX where XXX is a number between 000-999' };
      }

      // Check if username already exists
      const usernameExists = await checkUsernameExists(userData.username);
      if (usernameExists) {
        return { error: 'Username already exists. Please choose a different username.' };
      }

      // Check if email already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .single();

      if (existingUser) {
        return { error: 'Email already registered. Please use a different email.' };
      }

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name,
            username: userData.username
          }
        }
      });

      if (authError) {
        return { error: authError.message };
      }

      if (!authData.user) {
        return { error: 'Failed to create account' };
      }

      // Create user profile
      const newUser: User = {
        id: authData.user.id,
        full_name: userData.full_name,
        username: userData.username,
        gender: userData.gender,
        branch: userData.branch,
        email: email,
        created_at: new Date().toISOString(),
        last_seen: new Date().toISOString(),
        avatar_url: null
      };

      // Create profile in Supabase
      const { error: profileError } = await supabase
        .from('users')
        .insert([newUser]);

      if (profileError) {
        await supabase.auth.admin.deleteUser(authData.user.id);
        return { error: 'Failed to create user profile. Please try again.' };
      }

      // Sync to Firebase
      await syncUserToFirebase(newUser);
      setUser(newUser);
      return { user: newUser };
    } catch (error: any) {
      console.error('Sign up error:', error);
      return { error: 'Failed to create account. Please try again.' };
    }
  };

  const signIn = async (data: SignInData) => {
    try {
      const { email, password } = data;
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        if (authError.message === 'Invalid login credentials') {
          return { error: 'Invalid email or password.' };
        }
        throw authError;
      }

      if (!authData.user) {
        return { error: 'Failed to sign in' };
      }

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        return { error: 'Failed to fetch user profile' };
      }

      if (!profile) {
        return { error: 'User profile not found' };
      }

      const userData: User = {
        id: profile.id,
        full_name: profile.full_name,
        username: profile.username,
        gender: profile.gender,
        branch: profile.branch,
        email: profile.email,
        created_at: profile.created_at,
        last_seen: new Date().toISOString(),
        avatar_url: profile.avatar_url
      };

      // Update last seen in Supabase
      await supabase
        .from('users')
        .update({ last_seen: userData.last_seen })
        .eq('id', userData.id);

      // Sync to Firebase
      await syncUserToFirebase(userData);
      setUser(userData);
      return { user: userData };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: 'Failed to sign in. Please try again.' };
    }
  };

  const signOut = async () => {
    try {
      if (user) {
        // Update Firebase status to offline
        const userStatusRef = ref(database, `status/${user.id}`);
        await set(userStatusRef, {
          isOnline: false,
          lastChanged: serverTimestamp()
        });

        // Update last seen in Supabase
        await supabase
          .from('users')
          .update({ last_seen: new Date().toISOString() })
          .eq('id', user.id);
      }

      // Sign out from Supabase
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const updateUserStatus = async (status: boolean) => {
    if (!user) return;
    
    const userStatusRef = ref(database, `status/${user.id}`);
    await set(userStatusRef, {
      isOnline: status,
      lastChanged: serverTimestamp()
    });
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        signUp, 
        signIn, 
        signOut,
        updateUserStatus 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};