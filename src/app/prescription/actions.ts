'use server';

import { supabase } from '@/lib/supabase';

export async function savePrescriptionOrder(formData: FormData) {
  if (!supabase) {
    return { success: false, message: 'Supabase client is not initialized.' };
  }

  try {
    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const file = formData.get('prescription') as File;

    if (!file || !name || !phone) {
      return { success: false, message: 'Missing required fields or file.' };
    }

    // 1. Upload file to Supabase Storage
    // Requirement: Use unique file name (timestamp + original name)
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const fileName = `${timestamp}_${sanitizedFileName}`;
    const filePath = `${fileName}`;

    // Convert file to ArrayBuffer for reliable upload in Node.js/Server Actions
    const arrayBuffer = await file.arrayBuffer();
    
    const { error: uploadError } = await supabase.storage
      .from('prescriptions')
      .upload(filePath, arrayBuffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Detailed Upload Error:', uploadError);
      
      let friendlyMessage = `Upload Failed: ${uploadError.message}.`;
      if (uploadError.message.includes('Bucket not found')) {
        friendlyMessage = "Upload Failed: Bucket 'prescriptions' not found. Please create it in your Supabase dashboard (Storage tab).";
      } else if (uploadError.message.includes('Permission denied') || uploadError.message === 'Unauthorized') {
        friendlyMessage = "Upload Failed: Permission Denied. Ensure you have run the SQL setup and created the Storage RLS policies.";
      }
      
      return { success: false, message: friendlyMessage };
    }

    // 2. Get Public URL
    const { data } = supabase.storage
      .from('prescriptions')
      .getPublicUrl(filePath);
      
    const publicUrl = data.publicUrl;

    // 3. Save metadata to Database
    // Requirement: Columns: id, name, phone, file_url, created_at
    const { error: dbError } = await supabase
      .from('prescriptions')
      .insert([
        {
          name,
          phone,
          file_url: publicUrl,
        }
      ]);

    if (dbError) {
      console.error('Database error:', dbError);
      return { success: false, message: 'Failed to save record to database. ' + dbError.message };
    }

    return { 
      success: true, 
      message: 'Prescription uploaded successfully!',
      prescriptionUrl: publicUrl
    };
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return { success: false, message: error.message || 'An unexpected error occurred.' };
  }
}


