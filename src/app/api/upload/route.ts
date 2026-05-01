import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    // 1. Parse the incoming formData
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    // 2. Validate that a file was actually provided
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided in the request.' },
        { status: 400 }
      );
    }

    // 3. Ensure Supabase is configured
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Supabase client is not initialized.' },
        { status: 500 }
      );
    }

    // 4. Generate a unique file name to avoid collisions
    const fileExt = file.name.split('.').pop() || 'bin';
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    // 5. Upload the file to Supabase Storage 
    // (Using the 'prescriptions' bucket as set up previously. You can change this to another bucket if needed.)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('prescriptions')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    // 6. Handle Supabase upload errors gracefully
    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return NextResponse.json(
        { 
          success: false, 
          error: uploadError.message,
          details: 'Ensure the bucket exists and has public INSERT policies.'
        },
        { status: 500 }
      );
    }

    // 7. Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('prescriptions')
      .getPublicUrl(filePath);

    // 8. Return a successful JSON response
    return NextResponse.json(
      { 
        success: true, 
        message: 'File uploaded successfully',
        url: publicUrl,
        file: {
          name: file.name,
          size: file.size,
          type: file.type
        }
      },
      { status: 200 }
    );

  } catch (error: any) {
    // 9. Catch any unexpected errors (e.g., parsing errors)
    console.error('Unexpected error in /api/upload:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'An unexpected internal server error occurred.' 
      },
      { status: 500 }
    );
  }
}
