import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Image, Loader2, Save, X } from 'lucide-react';
import { getProfile, updateProfile, uploadAvatar } from '@/services/userService';
import { cn } from '@/lib/utils';

const getInitials = (username: string) => username.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

export default function EditProfile() {
  const queryClient = useQueryClient();
  const { setAuth } = useAuthStore();
  const [formData, setFormData] = useState({ username: '', email: '' });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  });

  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (updatedUser) => {
      setAuth(updatedUser, useAuthStore.getState().accessToken!);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated successfully!');
    },
    onError: (error) => toast.error(error.message || 'Failed to update profile'),
  });

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    const preview = URL.createObjectURL(file);
    setAvatarPreview(preview);
    setAvatarFile(file);

    try {
      // Mock upload for now - backend stub
      // const avatarUrl = await uploadAvatar(file);
      // setFormData(prev => ({ ...prev, avatar: avatarUrl }));
      toast.success('Avatar upload preview set (backend stub)');
    } catch (error) {
      toast.error('Upload failed');
      setAvatarPreview('');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (profile && !formData.username && !formData.email) return;

    const data: any = {};
    if (formData.username) data.username = formData.username;
    if (formData.email) data.email = formData.email;

    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-xl font-bold">?</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">Profile not found</h2>
          <p className="text-muted-foreground mb-6">Please refresh or log in again.</p>
          <Button onClick={() => window.location.reload()}>Reload</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Profile</h1>
        <p className="text-muted-foreground text-lg mt-1">Update your personal information</p>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-2">
            <User className="h-6 w-6" />
            Profile Details
          </CardTitle>
          <CardDescription>Manage your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            <div className="flex flex-col items-center gap-3">
              <div className="relative group">
                <Avatar className="h-28 w-28 ring-4 ring-background shadow-lg">
                  <AvatarImage 
                    src={avatarPreview || `https://api.dicebear.com/7.x/identicon/svg?seed=${profile.username}`}
                    alt="Profile picture"
                  />
                  <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    {getInitials(profile.username || 'Unknown User')}
                  </AvatarFallback>
                </Avatar>
                <Label
                  htmlFor="avatar-upload"
                  className={cn(
                    "absolute -bottom-2 -right-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 rounded-full shadow-lg cursor-pointer hover:scale-105 transition-all ring-2 ring-white/50",
                    "flex items-center justify-center h-12 w-12 group-hover:bg-blue-600"
                  )}
                >
                  <Image className="h-5 w-5" />
                  <span className="sr-only">Change photo</span>
                </Label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="sr-only"
                  disabled={isUploading}
                />
              </div>
              {isUploading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </div>
              )}
            </div>
            <div className="flex-1 space-y-4 min-w-0">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username || profile.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Enter your username"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || profile.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email"
                  className="mt-1.5"
                />
              </div>
            </div>
          </div>
          <Separator />
          <div className="flex gap-3 pt-2">
            <Button onClick={handleSubmit} disabled={updateMutation.isPending} className="flex-1">
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
            <Button variant="outline" className="px-6">
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
