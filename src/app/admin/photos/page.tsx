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
          <CardTitle>Upload New Photo</CardTitle>
          <CardDescription>Add a new image to your portfolio.</CardDescription>
        </CardHeader>
        <CardContent>
          <UploadPhotoForm />
        </CardContent>
      </Card>

      <Separator />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Existing Photos</CardTitle>
          <CardDescription>Edit, reorder, or delete your current photos.</CardDescription>
        </CardHeader>
        <CardContent>
          {photos.length > 0 ? (
            <PhotoList initialPhotos={photos} />
          ) : (
            <p className="text-muted-foreground">No photos found. Upload your first photo!</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
