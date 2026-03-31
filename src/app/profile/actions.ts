'use server';

import { supabase } from '@/lib/supabase';

export async function saveProfile(formData: FormData) {
  if (!supabase) {
    return { success: false, message: 'Supabase client is not initialized.' };
  }

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const mobile_no = formData.get('mobile_no') as string;
  const address = formData.get('address') as string;

  if (!name || !email || !mobile_no) {
    return { success: false, message: 'Name, email, and mobile number are required.' };
  }

  try {
    // Check if profile already exists using maybeSingle to avoid PGRST116 error if not found
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing profile:', checkError);
      return { success: false, message: checkError.message };
    }

    let result;
    if (existingProfile) {
      // Update existing record
      result = await supabase
        .from('profiles')
        .update({ name, mobile_no, address })
        .eq('email', email)
        .select()
        .maybeSingle();
    } else {
      // Insert new record
      result = await supabase
        .from('profiles')
        .insert([{ name, email, mobile_no, address }])
        .select()
        .maybeSingle();
    }

    if (result.error) {
      console.error('Error saving profile:', result.error);
      return { success: false, message: result.error.message };
    }

    if (!result.data) {
      // This might happen due to RLS policies
      return { 
        success: true, 
        message: 'Profile saved (but row cannot be returned due to security filters).',
        data: null 
      };
    }

    return { success: true, message: 'Profile saved successfully!', data: result.data };
  } catch (err: any) {
    console.error('Unexpected error saving profile:', err);
    return { success: false, message: err.message || 'An unexpected error occurred.' };
  }
}
