import React, { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { Camera, User } from 'lucide-react';

export default function Profile() {
  const { userData } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState('/placeholder.svg');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = () => {
    // Here you would typically make an API call to update the profile
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully.",
    });
    setIsEditing(false);
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // For now, just show a success message
      // In a real app, you would upload the file to a server
      toast({
        title: "Photo Selected",
        description: "Profile photo will be updated after saving changes.",
      });
      
      // Create a preview URL for the selected image
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
    }
  };

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (userData?.firstName) {
      return userData.firstName.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>
      
      <div className="grid gap-6">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative group">
                <Avatar className="h-24 w-24 cursor-pointer" onClick={handleImageClick}>
                  <AvatarImage src={profileImage} alt={userData?.firstName || 'User'} />
                  <AvatarFallback className="text-2xl">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                {/* Edit overlay */}
                <div 
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={handleImageClick}
                >
                  <Camera className="h-6 w-6 text-white" />
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                  aria-label="Upload profile photo"
                />
              </div>
              <div>
                <CardTitle>{userData?.firstName || 'User'}</CardTitle>
                <CardDescription>{userData?.emailAddress || 'No email provided'}</CardDescription>
                <p className="text-sm text-muted-foreground mt-1">Click on the photo to update your profile picture</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                defaultValue={userData?.firstName || ''} 
                disabled={!isEditing}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                defaultValue={userData?.emailAddress || ''} 
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone" 
                defaultValue={userData?.mobileNumber || ''} 
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input 
                id="state" 
                defaultValue={userData?.userState || ''} 
                disabled={!isEditing}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveProfile}>
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your account details and preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">Account ID</h4>
                <p className="text-sm text-muted-foreground">{userData?.id || 'N/A'}</p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">Account Status</h4>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
              <div className="h-2 w-2 rounded-full bg-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 