
'use client';

import { useEffect, useRef, useState, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { uploadPhoto, updatePhotoDetails, type PhotoActionState } from '@/actions/photos';
import type { Photo } from '@/types';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, UploadCloud, Save, Link as LinkIcon } from 'lucide-react'; // Added LinkIcon
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" aria-disabled={pending} disabled={pending}>
      {isEditing ? (
        pending ? 'Saving...' : <><Save className="mr-2 h-4 w-4" /> Save Changes</>
      ) : (
        pending ? 'Adding...' : <><UploadCloud className="mr-2 h-4 w-4" /> Add Photo</>
      )}
    </Button>
  );
}

interface UploadPhotoFormProps {
  photoToEdit?: Photo | null;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void; // Callback for successful upload/update
}

export function UploadPhotoForm({
  photoToEdit,
  isOpen,
  onOpenChange,
  onSuccess,
}: UploadPhotoFormProps) {
  const initialState: PhotoActionState | undefined = undefined;
  const formAction = photoToEdit ? updatePhotoDetails : uploadPhoto;
  const [state, dispatch] = useActionState(formAction, initialState);
  // Preview for existing photo to edit, or if user pastes a URL for a new photo
  const [preview, setPreview] = useState<string | null>(photoToEdit?.src || null);
  const [currentSrcValue, setCurrentSrcValue] = useState<string>(photoToEdit?.src || '');


  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (state?.success) {
      toast({ title: photoToEdit ? "Success" : "Photo Added", description: state.message });
      setPreview(null);
      setCurrentSrcValue('');
      formRef.current?.reset();
      if (onOpenChange) onOpenChange(false); 
      if (onSuccess) onSuccess(); 
    } else if (state?.message && (state.errors || !state.success)) { 
      toast({ variant: "destructive", title: "Error", description: state.message });
    }
  }, [state, toast, photoToEdit, onOpenChange, onSuccess]);

  useEffect(() => {
    if (photoToEdit) {
      setPreview(photoToEdit.src);
      setCurrentSrcValue(photoToEdit.src);
    } else {
      setPreview(null); 
      setCurrentSrcValue('');
    }
  }, [photoToEdit, isOpen]); 

  const handleSrcChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const url = event.target.value;
    setCurrentSrcValue(url);
    // Basic validation for URL format to enable preview
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
        setPreview(url);
    } else {
        setPreview(null);
    }
  };
  
  const formContent = (
    <form action={dispatch} ref={formRef} className="space-y-4">
      {photoToEdit && <Input type="hidden" name="id" value={photoToEdit.id} />}
      
      {!photoToEdit && (
        <div className="space-y-2">
          <Label htmlFor="src">Photo URL</Label>
          <div className="flex items-center space-x-2">
            <LinkIcon className="h-5 w-5 text-muted-foreground" />
            <Input
              id="src"
              name="src"
              type="url"
              placeholder="https://example.com/image.jpg"
              required
              className={state?.errors?.src ? 'border-destructive' : ''}
              value={currentSrcValue}
              onChange={handleSrcChange}
            />
          </div>
          {state?.errors?.src && <p className="text-xs text-destructive">{state.errors.src.join(', ')}</p>}
        </div>
      )}

      {(preview || (photoToEdit && photoToEdit.src)) && (
         <div className="mt-2 relative w-full h-48">
            <Image 
                src={preview || photoToEdit!.src} 
                alt={photoToEdit?.alt || "Photo preview"} 
                fill style={{objectFit:"contain"}} 
                className="rounded-md border"
                onError={() => setPreview('/placeholder-error.png')} // Fallback for broken image links
            />
        </div>
      )}


      <div className="space-y-2">
        <Label htmlFor="alt">Alternative Text (for accessibility)</Label>
        <Input
          id="alt"
          name="alt"
          type="text"
          placeholder="e.g., Sunset over mountains"
          defaultValue={photoToEdit?.alt || ''}
          className={state?.errors?.alt ? 'border-destructive' : ''}
        />
        {state?.errors?.alt && <p className="text-xs text-destructive">{state.errors.alt.join(', ')}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (shown on hover)</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="e.g., A beautiful landscape shot during golden hour."
          defaultValue={photoToEdit?.description || ''}
          className={state?.errors?.description ? 'border-destructive' : ''}
        />
        {state?.errors?.description && <p className="text-xs text-destructive">{state.errors.description.join(', ')}</p>}
      </div>

      {state?.message && !state.success && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Operation Failed</AlertTitle>
          <AlertDescription>
            {state.message}
            {state.errors && Object.entries(state.errors).map(([field, fieldErrors]) => (
              <div key={field} className="mt-1">
                {Array.isArray(fieldErrors) ? fieldErrors.join(', ') : String(fieldErrors)}
              </div>
            ))}
          </AlertDescription>
        </Alert>
      )}
      
      {!isOpen && ( 
        <div className="flex justify-end">
          <SubmitButton isEditing={!!photoToEdit} />
        </div>
      )}
    </form>
  );

  if (isOpen && onOpenChange) { 
    return (
      <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) {
           if (!photoToEdit) { 
            setPreview(null);
            setCurrentSrcValue('');
            formRef.current?.reset();
          }
        }
        onOpenChange(open);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{photoToEdit ? 'Edit Photo Details' : 'Add New Photo by URL'}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {formContent}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
             <Button 
              onClick={() => {
                formRef.current?.requestSubmit(); 
              }}
            >
              {photoToEdit ? (
                <><Save className="mr-2 h-4 w-4" /> Save Changes</>
              ) : (
                <><UploadCloud className="mr-2 h-4 w-4" /> Add Photo</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return formContent;
}

