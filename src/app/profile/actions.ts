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
    // Check if profile already exists for this email
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    let result;

    if (existingProfile) {
      // Update existing profile
      result = await supabase
        .from('profiles')
        .update({ name, mobile_no, address })
        .eq('email', email)
        .select()
        .single();
    } else {
      // Insert new profile
      result = await supabase
        .from('profiles')
        .insert([{ name, email, mobile_no, address }])
        .select()
        .single();
    }

    if (result.error) {
      console.error('Error saving profile:', result.error);
      return { success: false, message: result.error.message };
    }

    return { success: true, message: 'Profile saved successfully!', data: result.data };
  } catch (err: any) {
    console.error('Unexpected error saving profile:', err);
    return { success: false, message: err.message || 'An unexpected error occurred.' };
  }
}
