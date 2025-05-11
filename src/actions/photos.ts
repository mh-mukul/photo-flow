
'use server';

import { revalidatePath } from 'next/cache';
import { z, ZodError } from 'zod';
import { createSupabaseServiceRoleClient } from '@/lib/supabase/server';
import { createSupabaseBrowserClient } from '@/lib/supabase/client'; // Added for getPublicPhotos
import type { Photo } from '@/types';

// Schemas for validation
const PhotoBaseSchema = z.object({
  alt: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

const CreatePhotoSchema = PhotoBaseSchema.extend({
  src: z.string().url({ message: 'Please enter a valid URL.' }).min(1, 'Image URL is required.'),
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
  try {
    const supabase = createSupabaseServiceRoleClient();
    
    const validatedFields = CreatePhotoSchema.safeParse({
      src: formData.get('src'),
      alt: formData.get('alt') || null,
      description: formData.get('description') || null,
    });

    if (!validatedFields.success) {
      console.error("Validation Errors:", validatedFields.error.flatten().fieldErrors);
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Validation failed. Please check the form fields.',
        success: false,
      };
    }
    
    const { src, alt, description } = validatedFields.data;
    
    const display_order = (await getMaxDisplayOrder(supabase)) + 1;

    const { data: photo, error: dbError } = await supabase
      .from('photos')
      .insert({
        src: src,
        alt: alt,
        description: description,
        display_order: display_order,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database Insert Error:', dbError);
      return { message: `Database Error: ${dbError.message}`, success: false, errors: { general: ["Failed to save photo details to database."] } };
    }

    revalidatePath('/admin/photos');
    revalidatePath('/');
    return { message: 'Photo added successfully!', success: true, photo };

  } catch (error: unknown) {
    console.error("Unhandled error in uploadPhoto action:", error);
    let errorMessage = "An unexpected server error occurred. Please check server logs.";
    
    if (error instanceof ZodError) { 
        return {
            errors: error.flatten().fieldErrors,
            message: "A validation error occurred during processing.",
            success: false,
        };
    } else if (error instanceof Error) {
        // Avoid exposing too much detail from generic Error objects if not desired
    }
    
    return {
      message: errorMessage,
      success: false,
      errors: { general: [errorMessage] } 
    };
  }
}

export async function updatePhotoDetails(prevState: PhotoActionState | undefined, formData: FormData): Promise<PhotoActionState> {
 try {
    const supabase = createSupabaseServiceRoleClient();
    const id = formData.get('id') as string;

    const validatedFields = UpdatePhotoSchema.safeParse({
      id: id,
      alt: formData.get('alt') || null,
      description: formData.get('description') || null,
    });

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Validation failed.',
        success: false,
      };
    }

    const { alt, description } = validatedFields.data;

    const { data: photo, error } = await supabase
      .from('photos')
      .update({
        alt,
        description,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update Photo Error:', error);
      return { message: `Database Error: ${error.message}`, success: false, errors: { general: ["Failed to update photo details."] } };
    }

    revalidatePath('/admin/photos');
    revalidatePath('/');
    return { message: 'Photo details updated successfully!', success: true, photo };
  } catch (error: unknown) {
    console.error("Unhandled error in updatePhotoDetails action:", error);
    let errorMessage = "An unexpected server error occurred during update. Please check server logs.";
     if (error instanceof Error) {
        // errorMessage = error.message; 
    }
    return {
      message: errorMessage,
      success: false,
      errors: { general: [errorMessage] }
    };
  }
}

export async function deletePhoto(id: string, src: string): Promise<PhotoActionState> {
  try {
    const supabase = createSupabaseServiceRoleClient();

    // No longer deleting from Supabase Storage as per new requirement (URL based)
    // const urlParts = src.split(`/storage/v1/object/public/${PHOTO_BUCKET_NAME}/`);
    // if (urlParts.length < 2) {
    //     return { message: 'Invalid photo source URL format.', success: false, errors: { general: ["Cannot determine file path from URL."] } };
    // }
    // const filePath = urlParts[1];

    // const { error: storageError } = await supabase.storage
    //   .from(PHOTO_BUCKET_NAME)
    //   .remove([filePath]);

    // if (storageError) {
    //   console.error('Storage Delete Error (proceeding with DB deletion):', storageError);
    // }

    const { error: dbError } = await supabase.from('photos').delete().eq('id', id);

    if (dbError) {
      console.error('Database Delete Error:', dbError);
      return { message: `Database Error: ${dbError.message}`, success: false, errors: { general: ["Failed to delete photo from database."] } };
    }

    revalidatePath('/admin/photos');
    revalidatePath('/');
    return { message: 'Photo deleted successfully!', success: true };
  } catch (error: unknown) {
    console.error("Unhandled error in deletePhoto action:", error);
    let errorMessage = "An unexpected server error occurred during deletion. Please check server logs.";
    if (error instanceof Error) {
        // errorMessage = error.message;
    }
    return {
      message: errorMessage,
      success: false,
      errors: { general: [errorMessage] }
    };
  }
}

export async function getPhotos(): Promise<Photo[]> {
  const supabase = createSupabaseServiceRoleClient();
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

export async function getPublicPhotos(): Promise<Photo[]> {
  const supabase = createSupabaseServiceRoleClient(); 
  
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
