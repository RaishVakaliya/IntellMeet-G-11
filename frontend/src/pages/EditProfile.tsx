import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { User, Image, Loader2, Save, X } from 'lucide-react';
import { getProfile, updateProfile, uploadAvatar } from '@/services/userService';
import { cn } from '@/lib/utils';

const getInitials = (username: string) =>
  username
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

export default function EditProfile() {
  const queryClient = useQueryClient();
  const { setAuth } = useAuthStore();

  // FIX 1: formData is seeded from real profile data once loaded
  const [formData, setFormData] = useState({ username: '', email: '' });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  });

  // FIX 2: Seed form with real profile data when it loads
  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username ?? '',
        email: profile.email ?? '',
      });
      // Show real avatar from profile (not dicebear placeholder)
      if (profile.avatarUrl) {
        setAvatarPreview(profile.avatarUrl);
      }
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (updatedUser) => {
      setAuth(updatedUser, useAuthStore.getState().accessToken!);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated successfully!');
    },
    onError: (error: Error) =>
      toast.error(error.message || 'Failed to update profile'),
  });

  // FIX 3: Avatar upload is fully wired — calls real uploadAvatar service
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Show local preview immediately for responsiveness
    const preview = URL.createObjectURL(file);
    setAvatarPreview(preview);
    setAvatarFile(file);
    setIsUploading(true);

    try {
      const avatarUrl = await uploadAvatar(file);
      // Replace blob URL with the real server URL
      setAvatarPreview(avatarUrl);
      setAvatarFile(null);
      // Persist the new avatar URL to the profile
      updateMutation.mutate({ avatarUrl });
    } catch (error) {
      toast.error('Avatar upload failed');
      // Roll back preview to original profile avatar
      setAvatarPreview(profile?.avatarUrl ?? '');
      setAvatarFile(null);
    } finally {
      setIsUploading(false);
      // Revoke the temporary blob URL to free memory
      URL.revokeObjectURL(preview);
    }
  };

  // FIX 4: Submit sends only changed fields; guard no longer blocks valid saves
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data: Record<string, string> = {};
    if (formData.username && formData.username !== profile?.username)
      data.username = formData.username;
    if (formData.email && formData.email !== profile?.email)
      data.email = formData.email;

    if (Object.keys(data).length === 0) {
      toast.info('No changes to save');
      return;
    }

    updateMutation.mutate(data);
  };

  // FIX 5: Cancel resets form to real profile values
  const handleCancel = () => {
    if (profile) {
      setFormData({ username: profile.username ?? '', email: profile.email ?? '' });
      setAvatarPreview(profile.avatarUrl ?? '');
      setAvatarFile(null);
    }
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
            {/* Avatar section */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative group">
                <Avatar className="h-28 w-28 ring-4 ring-background shadow-lg">
                  {/* FIX 6: Show real avatarPreview (seeded from profile.avatarUrl) — no dicebear fallback */}
                  <AvatarImage src={avatarPreview} alt={`${profile.username}'s profile picture`} />
                  <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    {getInitials(profile.username || 'Unknown User')}
                  </AvatarFallback>
                </Avatar>
                <Label
                  htmlFor="avatar-upload"
                  className={cn(
                    'absolute -bottom-2 -right-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 rounded-full shadow-lg cursor-pointer hover:scale-105 transition-all ring-2 ring-white/50',
                    'flex items-center justify-center h-12 w-12',
                    isUploading && 'opacity-50 pointer-events-none',
                  )}
                >
                  {isUploading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Image className="h-5 w-5" />
                  )}
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
                <p className="text-sm text-muted-foreground animate-pulse">Uploading…</p>
              )}
            </div>

            {/* Fields section — values come from real formData seeded by profile */}
            <div className="flex-1 space-y-4 min-w-0">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, username: e.target.value }))
                  }
                  placeholder="Enter your username"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="Enter your email"
                  className="mt-1.5"
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleSubmit}
              disabled={updateMutation.isPending || isUploading}
              className="flex-1"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
            {/* FIX 7: Cancel now resets form to real profile values */}
            <Button
              variant="outline"
              className="px-6"
              onClick={handleCancel}
              disabled={updateMutation.isPending}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}