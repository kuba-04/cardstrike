import { supabaseClient } from '@/db/supabase.client';
import type { User } from '@supabase/supabase-js';
import type { Database } from '@/db/database.types';

type CustomUser = Database['public']['Tables']['users']['Row'];

export class UserService {
  async ensureUserExists(authUser: User): Promise<CustomUser> {
    const { data: existingUser, error: fetchError } = await supabaseClient
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw new Error(`Failed to fetch user: ${fetchError.message}`);
    }

    if (existingUser) {
      return existingUser;
    }

    // Create new user record if it doesn't exist
    const { data: newUser, error: insertError } = await supabaseClient
      .from('users')
      .insert({
        id: authUser.id,
        email: authUser.email!,
        username: authUser.email!.split('@')[0], // Default username from email
        email_verified: authUser.confirmed_at !== null, // Use confirmed_at to determine email verification
        password_hash: '', // We don't need to store this as Supabase Auth handles it
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to create user: ${insertError.message}`);
    }

    return newUser;
  }

  async getUser(userId: string): Promise<CustomUser | null> {
    const { data: user, error } = await supabaseClient
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to fetch user: ${error.message}`);
    }

    return user;
  }

  async updateUser(userId: string, updates: Partial<Omit<CustomUser, 'id' | 'created_at'>>): Promise<CustomUser> {
    const { data: updatedUser, error } = await supabaseClient
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }

    return updatedUser;
  }
} 