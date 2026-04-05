'use server';

import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export async function savePrescriptionOrder(formData: FormData) {
  if (!supabase) {
    return { success: false, message: 'Supabase client is not initialized.' };
  }

  try {
    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const address = formData.get('address') as string;
    const extra_notes = formData.get('extra_notes') as string;
    const file = formData.get('prescription') as File;

    if (!file || !name || !phone || !address) {
      return { success: false, message: 'Missing required fields or file.' };
    }

    // 1. Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    // Note: We use the existing bucket check or attempt upload directly
    const { error: uploadError } = await supabase.storage
      .from('prescriptions')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Detailed Upload Error:', uploadError);
      
      let friendlyMessage = `Upload Failed: ${uploadError.message}.`;
      if (uploadError.message.includes('Bucket not found')) {
        friendlyMessage = "Upload Failed: Bucket 'prescriptions' not found. Please double-check that the name is exactly 'prescriptions' (all lowercase) in your Supabase Storage dashboard.";
      } else if (uploadError.message.includes('Permission denied') || uploadError.message === 'Unauthorized') {
        friendlyMessage = "Upload Failed: Permission Denied. You must add an 'INSERT' policy to your 'prescriptions' bucket in Supabase Storage to allow uploads.";
      }
      
      return { success: false, message: friendlyMessage };
    }

    // 2. Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('prescriptions')
      .getPublicUrl(filePath);

    // 3. Save metadata to Database
    const { error: dbError } = await supabase
      .from('prescriptions')
      .insert([
        {
          name,
          phone,
          address,
          extra_notes,
          prescription_url: publicUrl,
        }
      ]);

    if (dbError) {
      console.error('Database error:', dbError);
      return { success: false, message: 'Failed to save order details.' };
    }

    return { 
      success: true, 
      message: 'Prescription uploaded and order placed successfully!',
      prescriptionUrl: publicUrl
    };
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return { success: false, message: error.message || 'An unexpected error occurred.' };
  }
}
