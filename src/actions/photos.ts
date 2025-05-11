'use server';

import { revalidatePath } from 'next/cache';
import { z, ZodError } from 'zod';
import { createSupabaseServiceRoleClient } from '@/lib/supabase/server';
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
  id: z.string().uuid({ message: 'Invalid photo ID format.' }),
});


export type PhotoActionState = {
  message?: string | null;
  errors?: Record<string, string[]> | null;
  success?: boolean;
  photo?: Photo | null;
};

function checkSupabaseEnvVars(): boolean {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Supabase URL or Service Role Key is not configured in environment variables.");
    return false;
  }
  return true;
}

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
  if (!checkSupabaseEnvVars()) {
    return {
      message: "Server configuration error: Supabase credentials missing. Please contact administrator.",
      success: false,
      errors: { general: ["Server configuration error for database access."] }
    };
  }
  try {
    const supabase = createSupabaseServiceRoleClient();
    
    const validatedFields = CreatePhotoSchema.safeParse({
      src: formData.get('src'),
      alt: formData.get('alt') || null,
      description: formData.get('description') || null,
    });

    if (!validatedFields.success) {
      console.error("Validation Errors (uploadPhoto):", validatedFields.error.flatten().fieldErrors);
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
      console.error('Database Insert Error (uploadPhoto):', dbError);
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
        // errorMessage = error.message; // Avoid exposing too much detail
    }
    
    return {
      message: errorMessage,
      success: false,
      errors: { general: [errorMessage] } 
    };
  }
}

export async function updatePhotoDetails(prevState: PhotoActionState | undefined, formData: FormData): Promise<PhotoActionState> {
  if (!checkSupabaseEnvVars()) {
    return {
      message: "Server configuration error: Supabase credentials missing. Please contact administrator.",
      success: false,
      errors: { general: ["Server configuration error for database access."] }
    };
  }
 try {
    const supabase = createSupabaseServiceRoleClient();
    const id = formData.get('id') as string;

    const validatedFields = UpdatePhotoSchema.safeParse({
      id: id,
      alt: formData.get('alt') || null,
      description: formData.get('description') || null,
    });

    if (!validatedFields.success) {
      console.error("Validation Errors (updatePhotoDetails):", validatedFields.error.flatten().fieldErrors);
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Validation failed. Please check the form fields, especially the ID.',
        success: false,
      };
    }

    const { alt, description } = validatedFields.data; // id is also in validatedFields.data.id

    const { data: photo, error } = await supabase
      .from('photos')
      .update({
        alt,
        description,
        updated_at: new Date().toISOString(),
      })
      .eq('id', validatedFields.data.id) // Use validated id
      .select()
      .single();

    if (error) {
      console.error('Update Photo Error (updatePhotoDetails):', error);
      return { message: `Database Error: ${error.message}`, success: false, errors: { general: ["Failed to update photo details."] } };
    }

    revalidatePath('/admin/photos');
    revalidatePath('/');
    return { message: 'Photo details updated successfully!', success: true, photo };
  } catch (error: unknown) {
    console.error("Unhandled error in updatePhotoDetails action:", error);
    let errorMessage = "An unexpected server error occurred during update. Please check server logs.";
     if (error instanceof ZodError) { // Should be caught by validatedFields, but as a fallback
        return {
            errors: error.flatten().fieldErrors,
            message: "A validation error occurred during processing.",
            success: false,
        };
    } else if (error instanceof Error) {
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
  if (!checkSupabaseEnvVars()) {
    return {
      message: "Server configuration error: Supabase credentials missing. Please contact administrator.",
      success: false,
      errors: { general: ["Server configuration error for database access."] }
    };
  }
  try {
    const supabase = createSupabaseServiceRoleClient();

    // Validate ID format before attempting delete
    const idValidation = z.string().uuid({ message: "Invalid photo ID for deletion."}).safeParse(id);
    if(!idValidation.success) {
      console.error("Invalid ID for deletion:", idValidation.error.flatten().fieldErrors);
      return { message: "Invalid photo ID format for deletion.", success: false, errors: { id: idValidation.error.flatten().fieldErrors.id }};
    }

    // Delete from database
    const { error: dbError } = await supabase.from('photos').delete().eq('id', id);

    if (dbError) {
      console.error('Database Delete Error (deletePhoto):', dbError);
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
  if (!checkSupabaseEnvVars()) {
    // For query functions, throwing an error is more appropriate
    // as they are not typically used with useActionState and don't return PhotoActionState.
    throw new Error("Server configuration error: Supabase credentials missing.");
  }
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching photos (getPhotos):', error);
    // Optionally, could throw error here too for consistency
    return [];
  }
  return data || [];
}

export async function getPublicPhotos(): Promise<Photo[]> {
  if (!checkSupabaseEnvVars()) {
    throw new Error("Server configuration error: Supabase credentials missing.");
  }
  const supabase = createSupabaseServiceRoleClient(); 
  
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching public photos (getPublicPhotos):', error);
    return [];
  }
  // Filter out photos with invalid src before returning
  const validPhotos = (data || []).filter(
    (photo) => typeof photo.src === 'string' && photo.src.trim() !== '' && photo.src.startsWith('http')
  );
  return validPhotos;
}

    