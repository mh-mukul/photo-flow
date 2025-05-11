
import { getPhotos } from '@/actions/photos';
import { PhotoList } from './components/photo-list';
import { UploadPhotoForm } from './components/photo-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default async function AdminPhotosPage() {
  const photos = await getPhotos();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary tracking-tight">Manage Photos</h1>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Add New Photo by URL</CardTitle>
          <CardDescription>Add a new image to your portfolio by providing its URL.</CardDescription>
        </CardHeader>
        <CardContent>
          <UploadPhotoForm />
        </CardContent>
      </Card>

      <Separator />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Existing Photos</CardTitle>
          <CardDescription>Edit details or delete your current photos. Reordering can be managed if display_order is updated.</CardDescription>
        </CardHeader>
        <CardContent>
          {photos.length > 0 ? (
            <PhotoList initialPhotos={photos} />
          ) : (
            <p className="text-muted-foreground">No photos found. Add your first photo by URL!</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

