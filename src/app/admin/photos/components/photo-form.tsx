
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
import { AlertCircle, UploadCloud, Save } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" aria-disabled={pending} disabled={pending}>
      {isEditing ? (
        pending ? 'Saving...' : <><Save className="mr-2 h-4 w-4" /> Save Changes</>
      ) : (
        pending ? 'Uploading...' : <><UploadCloud className="mr-2 h-4 w-4" /> Upload Photo</>
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
  const [preview, setPreview] = useState<string | null>(photoToEdit?.src || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (state?.success) {
      toast({ title: photoToEdit ? "Success" : "Upload Successful", description: state.message });
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      formRef.current?.reset();
      if (onOpenChange) onOpenChange(false); // Close dialog on success
      if (onSuccess) onSuccess(); // Trigger refetch or list update
    } else if (state?.message && state.errors) {
      toast({ variant: "destructive", title: "Error", description: state.message });
    } else if (state?.message && !state.errors) { // Generic error message
       toast({ variant: "destructive", title: "Error", description: state.message });
    }
  }, [state, toast, photoToEdit, onOpenChange, onSuccess]);

  useEffect(() => {
    if (photoToEdit) {
      setPreview(photoToEdit.src);
    } else {
      setPreview(null); // Clear preview when form is for new upload
    }
  }, [photoToEdit, isOpen]); // Depend on isOpen to reset form state if modal is reused

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };
  
  const formContent = (
    <form action={dispatch} ref={formRef} className="space-y-4">
      {photoToEdit && <Input type="hidden" name="id" value={photoToEdit.id} />}
      
      {!photoToEdit && (
        <div className="space-y-2">
          <Label htmlFor="file">Photo File</Label>
          <Input
            id="file"
            name="file"
            type="file"
            accept="image/*"
            required={!photoToEdit}
            onChange={handleFileChange}
            ref={fileInputRef}
            className={state?.errors?.file ? 'border-destructive' : ''}
          />
          {preview && (
            <div className="mt-2 relative w-full h-48">
              <Image src={preview} alt="Preview" fill objectFit="contain" className="rounded-md border" />
            </div>
          )}
          {state?.errors?.file && <p className="text-xs text-destructive">{state.errors.file.join(', ')}</p>}
        </div>
      )}

      {photoToEdit && preview && (
         <div className="mt-2 relative w-full h-48">
            <Image src={preview} alt={photoToEdit.alt || "Photo preview"} fill objectFit="contain" className="rounded-md border" />
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

      {/* Display Order field removed as per requirement */}

      {state?.message && !state.success && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Operation Failed</AlertTitle>
          <AlertDescription>
            {state.message}
            {state.errors && Object.values(state.errors).flat().map((err, i) => <div key={i}>{err}</div>)}
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

  if (isOpen && onOpenChange) { // Render as a Dialog
    return (
      <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) {
           if (!photoToEdit) { 
            setPreview(null);
            if(fileInputRef.current) fileInputRef.current.value = '';
            formRef.current?.reset();
          }
        }
        onOpenChange(open);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{photoToEdit ? 'Edit Photo' : 'Upload New Photo'}</DialogTitle>
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
                <><UploadCloud className="mr-2 h-4 w-4" /> Upload Photo</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return formContent;
}
