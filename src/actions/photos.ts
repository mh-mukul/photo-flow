
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createSupabaseServiceRoleClient } from '@/lib/supabase/server';
import { createSupabaseBrowserClient } from '@/lib/supabase/client'; // Added for getPublicPhotos
import type { Photo } from '@/types';

const PHOTO_BUCKET_NAME = 'photoflow_photos'; // Ensure this matches your Supabase bucket name

// Schemas for validation
const PhotoBaseSchema = z.object({
  alt: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  display_order: z.coerce.number().int().min(0),
});

const CreatePhotoSchema = PhotoBaseSchema.extend({
  file: z.instanceof(File).refine(file => file.size > 0, 'File is required.'),
});

const UpdatePhotoSchema = PhotoBaseSchema.extend({
  id: z.string().uuid(),
});


export type PhotoActionState = {
  message?: string | null;
  errors?: Record<string, string[]> | null;
  success?: boolean;
  photo?: Photo | null;
};


async function getMaxDisplayOrder(supabase: ReturnType<typeof createSupabaseServiceRoleClient>): Promise<number> {
  const { data, error } = await supabase
    .from('photos')
    .select('display_order')
    .order('display_order', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116: "Query returned no rows" - is fine for first photo
    console.error('Error fetching max display order:', error);
    return 0; // Default to 0 if error
  }
  return data ? data.display_order : 0;
}


export async function uploadPhoto(prevState: PhotoActionState | undefined, formData: FormData): Promise<PhotoActionState> {
  const supabase = createSupabaseServiceRoleClient();
  
  // Convert display_order to number if it exists, otherwise it remains undefined for auto-increment logic
  const displayOrderValue = formData.get('display_order');
  const displayOrderNumber = displayOrderValue && displayOrderValue !== '' ? parseInt(displayOrderValue as string, 10) : undefined;


  const validatedFields = CreatePhotoSchema.safeParse({
    file: formData.get('file'),
    alt: formData.get('alt') || null,
    description: formData.get('description') || null,
    // Use the processed displayOrderNumber which can be undefined
    display_order: displayOrderNumber === undefined ? 0 : displayOrderNumber, // Pass 0 if undefined, but it will be overridden if undefined
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation failed.',
      success: false,
    };
  }
  
  const { file, alt, description } = validatedFields.data;
  let { display_order } = validatedFields.data; // This will be 0 if displayOrderNumber was undefined initially

  const filePath = `public/${Date.now()}-${file.name}`;

  // Upload file to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from(PHOTO_BUCKET_NAME)
    .upload(filePath, file);

  if (uploadError) {
    console.error('Storage Upload Error:', uploadError);
    return { message: `Storage Error: ${uploadError.message}`, success: false };
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(PHOTO_BUCKET_NAME)
    .getPublicUrl(filePath);
  
  if (!urlData?.publicUrl) {
    // Attempt to delete the orphaned file from storage if URL retrieval fails
    await supabase.storage.from(PHOTO_BUCKET_NAME).remove([filePath]);
    return { message: 'Could not get public URL for the uploaded file.', success: false };
  }

  // If display_order was not provided by user (i.e., displayOrderNumber was undefined), set it to max + 1
  // The schema gives it a default of 0 if undefined, so we can check against that or the original undefined state.
  // A more robust check would be against the original `displayOrderNumber` variable.
  if (displayOrderNumber === undefined) {
     display_order = (await getMaxDisplayOrder(supabase)) + 1;
  }


  // Insert photo metadata into database
  const { data: photo, error: dbError } = await supabase
    .from('photos')
    .insert({
      src: urlData.publicUrl,
      alt: alt,
      description: description,
      display_order: display_order,
    })
    .select()
    .single();

  if (dbError) {
    console.error('Database Insert Error:', dbError);
    // Attempt to delete the orphaned file from storage if DB insert fails
    await supabase.storage.from(PHOTO_BUCKET_NAME).remove([filePath]);
    return { message: `Database Error: ${dbError.message}`, success: false };
  }

  revalidatePath('/admin/photos');
  revalidatePath('/'); // Revalidate home page where gallery is shown
  return { message: 'Photo uploaded successfully!', success: true, photo };
}

export async function updatePhotoDetails(prevState: PhotoActionState | undefined, formData: FormData): Promise<PhotoActionState> {
  const supabase = createSupabaseServiceRoleClient();
  const id = formData.get('id') as string;

  const validatedFields = UpdatePhotoSchema.safeParse({
    id: id,
    alt: formData.get('alt') || null,
    description: formData.get('description') || null,
    display_order: parseInt(formData.get('display_order') as string, 10),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation failed.',
      success: false,
    };
  }

  const { alt, description, display_order } = validatedFields.data;

  const { data: photo, error } = await supabase
    .from('photos')
    .update({
      alt,
      description,
      display_order,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Update Photo Error:', error);
    return { message: `Database Error: ${error.message}`, success: false };
  }

  revalidatePath('/admin/photos');
  revalidatePath('/');
  return { message: 'Photo details updated successfully!', success: true, photo };
}

export async function deletePhoto(id: string, src: string): Promise<PhotoActionState> {
  const supabase = createSupabaseServiceRoleClient();

  // Extract file path from src URL. Example: https://<project>.supabase.co/storage/v1/object/public/photoflow_photos/public/image.jpg
  // Path in bucket is 'public/image.jpg'
  const urlParts = src.split(`/storage/v1/object/public/${PHOTO_BUCKET_NAME}/`);
  if (urlParts.length < 2) {
      return { message: 'Invalid photo source URL format.', success: false };
  }
  const filePath = urlParts[1];

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from(PHOTO_BUCKET_NAME)
    .remove([filePath]);

  if (storageError) {
    // Log error but proceed to delete from DB to avoid orphaned DB record if file already gone or other issue.
    console.error('Storage Delete Error (proceeding with DB deletion):', storageError);
  }

  // Delete from database
  const { error: dbError } = await supabase.from('photos').delete().eq('id', id);

  if (dbError) {
    console.error('Database Delete Error:', dbError);
    return { message: `Database Error: ${dbError.message}`, success: false };
  }

  revalidatePath('/admin/photos');
  revalidatePath('/');
  return { message: 'Photo deleted successfully!', success: true };
}

export async function getPhotos(): Promise<Photo[]> {
  const supabase = createSupabaseServiceRoleClient(); // Use service role for admin fetching to bypass RLS if needed, or client if RLS is public
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching photos:', error);
    return [];
  }
  return data || [];
}

// For public gallery
export async function getPublicPhotos(): Promise<Photo[]> {
  // This function should be called client-side or in a context where a browser client is appropriate.
  // For server-side rendering of public data where RLS allows public read,
  // createSupabaseServerClient() could be used.
  // For client-side components, createSupabaseBrowserClient() is correct.
  // Assuming this might be called from a server component for the public page:
  const supabase = createSupabaseServiceRoleClient(); // Or createSupabaseServerClient() if RLS allows public access without service role
  
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching public photos:', error);
    return [];
  }
  return data || [];
}
