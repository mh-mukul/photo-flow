'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { deletePhoto } from '@/actions/photos';
import type { Photo } from '@/types';
import { UploadPhotoForm } from './photo-form'; // For editing
import { Edit3, Trash2, GripVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation'; // For revalidating path

interface PhotoListProps {
  initialPhotos: Photo[];
}

export function PhotoList({ initialPhotos }: PhotoListProps) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleDelete = async (id: string, src: string) => {
    const result = await deletePhoto(id, src);
    if (result.success) {
      setPhotos(prevPhotos => prevPhotos.filter(p => p.id !== id));
      toast({ title: "Success", description: result.message });
      router.refresh(); // Revalidate and fetch new data
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message || "Failed to delete photo." });
    }
  };

  const handleEditSuccess = () => {
    // This will be called when the edit form successfully updates a photo.
    // We need to refresh the list from the server or update the local state.
    // For simplicity, we'll rely on revalidation and router.refresh() to update.
    setIsEditDialogOpen(false);
    setEditingPhoto(null);
    router.refresh(); // Revalidate and fetch new data for the list
  };
  
  const openEditDialog = (photo: Photo) => {
    setEditingPhoto(photo);
    setIsEditDialogOpen(true);
  };


  // Basic reordering logic (example: move up/down by changing display_order)
  // This is a placeholder and would need a proper implementation for saving order changes.
  // For now, display_order is edited in the form.

  return (
    <div className="space-y-4">
      {photos.map((photo) => (
        <Card key={photo.id} className="flex flex-col sm:flex-row items-start gap-4 p-4 shadow-md hover:shadow-lg transition-shadow duration-300">
          <div className="relative w-full sm:w-40 h-32 sm:h-24 rounded-md overflow-hidden border shrink-0">
            <Image src={photo.src} alt={photo.alt || 'Photo'} layout="fill" objectFit="cover" />
          </div>
          <div className="flex-grow">
            <CardHeader className="p-0 mb-2">
              <CardTitle className="text-lg break-all">{photo.alt || 'Untitled Photo'}</CardTitle>
            </CardHeader>
            <CardContent className="p-0 text-sm text-muted-foreground space-y-1">
              <p className="line-clamp-2 break-all"><strong>Description:</strong> {photo.description || 'N/A'}</p>
              <p><strong>Order:</strong> {photo.display_order}</p>
              <p className="text-xs"><strong>ID:</strong> {photo.id}</p>
              <p className="text-xs"><strong>Created:</strong> {new Date(photo.created_at).toLocaleDateString()}</p>
            </CardContent>
          </div>
          <CardFooter className="p-0 flex flex-col sm:flex-row sm:items-center gap-2 mt-2 sm:mt-0 self-start sm:self-center shrink-0">
            {/* Basic reorder buttons - conceptual, not fully implemented for drag/drop or complex logic */}
            {/* <Button variant="ghost" size="icon" title="Reorder (Conceptual)">
              <GripVertical className="h-5 w-5" />
            </Button> */}
            <Button variant="outline" size="sm" onClick={() => openEditDialog(photo)}>
              <Edit3 className="mr-2 h-4 w-4" /> Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the photo from storage and the database.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(photo.id, photo.src)}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>
      ))}

      {editingPhoto && (
        <UploadPhotoForm
          photoToEdit={editingPhoto}
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}
