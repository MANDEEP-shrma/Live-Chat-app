import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Camera, User, Lock, Bell, Save, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import axios from "axios";
import { login, logout } from "@/store/authSlice";

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  phone: string;
}

export default function ProfileEdit() {
  const currUser =
    useSelector((state: RootState) => state.auth.userData) ||
    JSON.parse(localStorage.getItem("currentUser") || "{}");
  const dispatch = useDispatch();
  const user: User = {
    id: currUser.id || "1",
    name: currUser.name || "guest",
    email: currUser.email || "guest23@example.com",
    avatar: currUser.avatar || "",
    bio: currUser.bio || "Hey,I am using chatApp",
    phone: currUser.phoneNo || "XXXXXXXXXX",
  };

  if (!user.avatar) {
    user.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user.name
    )}&background=random`;
  }

  const [formData, setFormData] = useState(user);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  // This function is changing the data in real time.using state
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updateUser = new FormData();
    updateUser.append("newName", formData.name);
    updateUser.append("newBio", formData.bio);
    if (avatarFile) {
      updateUser.append("avatar", avatarFile);
    } else {
      updateUser.append("avatar", formData.avatar);
    }

    axios
      .patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/users/edit-profile`,
        updateUser,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      )
      .then((response) => {
        const updatedUser = response.data.data;
        setFormData((prev) => ({
          ...prev,
          name: updatedUser.name,
          bio: updatedUser.bio,
          avatar: updatedUser.avatar,
        }));
        dispatch(login({ userData: updatedUser }));
        localStorage.setItem("currentUser", JSON.stringify(updatedUser));
        toast.success("Profile Updated", {
          description: "Your profile has been updated successfully.",
        });
      });
  };

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setnewPassword] = useState("");

  const handleSecuritySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    axios
      .patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/users/change-password`,
        { oldPassword: currentPassword, newPassword },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      )
      .then(() => {
        toast.success("Password Updated", {
          description: "Your Password has been updated successfully",
        });
      })
      .catch((err) => {
        console.error("Error updating password:", err);
        toast.error("Failed to update password", {
          description: err.response?.data?.message,
        });
      });
  };

  const handleAccountDelete = () => {
    toast.error("Are you sure you want to delete your account?", {
      description: "Avoid pop up if you don't want to or click Confirm",
      action: {
        label: "Confirm",
        onClick: () => {
          axios
            .get(
              `${import.meta.env.VITE_BACKEND_URL}/api/v1/users/deleteProfile`,
              {
                withCredentials: true,
              }
            )
            .then(() => {
              dispatch(logout());
              navigate("/");
              toast.success("Your account has deleted successfully", {
                description: "We Miss your presence",
              });
            })
            .catch((err) => {
              console.log("profile deletion error ", err);
              toast.error("Something went wrong", {
                description: "Try again later",
              });
            });
        },
      },
    });
  };

  const onClickPhoneNo = () => {
    toast.warning("You can't change your phoneNo", {
      description: "Phone no holds the ownership of this account",
    });
  };

  const onClickEmail = () => {
    toast.warning("You can't change your Email", {
      description: "Email holds the ownership of this account",
    });
  };

  return (
    <div className="min-h-screen bg-muted/40 py-8 px-4 md:px-0">
      <div className="container max-w-5xl">
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

        <div className="flex flex-col space-y-6">
          <h1 className="text-3xl font-bold tracking-tight">
            Profile Settings
          </h1>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="mb-6 grid w-full grid-cols-3 md:w-auto md:inline-flex">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Profile</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <span>Security</span>
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="flex items-center gap-2"
              >
                <Bell className="h-4 w-4" />
                <span>Notifications</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your profile information and how others see you on
                    the platform.
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                  <CardContent className="space-y-6">
                    <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
                      <div className="relative">
                        <Avatar className="h-24 w-24">
                          <AvatarImage
                            src={formData.avatar}
                            alt={formData.name}
                          />
                          <AvatarFallback className="text-2xl">
                            {formData.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <Button
                          size="icon"
                          variant="outline"
                          className="absolute -right-2 -bottom-2 h-8 w-8 rounded-full bg-background"
                          type="button"
                          onClick={() => {
                            document.getElementById("avatar-upload")?.click();
                          }}
                        >
                          <Camera className="h-4 w-4" />
                          <span className="sr-only">Upload avatar</span>
                        </Button>
                        <input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            setAvatarFile(e.target.files?.[0] || null);
                            toast.warning("Image Inserted", {
                              description: "Please save the changes",
                            });
                          }}
                        />
                      </div>
                      <div className="flex-1 space-y-1 text-center mt-2 sm:text-left">
                        <h3 className="font-medium">{formData.name}</h3>
                        <p className="text-md text-muted-foreground">
                          {formData.email}
                        </p>
                        <div className="mt-2 flex justify-center sm:justify-start gap-2 pt-2"></div>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid gap-5">
                      <div className="grid gap-3">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="grid gap-3">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          readOnly
                          onClick={onClickEmail}
                          className="cursor-pointer bg-gray-600"
                        />
                      </div>

                      <div className="grid gap-3">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          readOnly
                          onClick={onClickPhoneNo}
                          className="cursor-pointer bg-gray-600"
                        />
                      </div>

                      <div className="grid gap-3">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          name="bio"
                          value={formData.bio}
                          onChange={handleChange}
                          rows={4}
                          placeholder="Tell us a bit about yourself"
                        />
                        <p className="text-xs text-muted-foreground">
                          Brief description for your profile. This will be
                          visible to other users.
                        </p>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex justify-between border-t px-6 py-4">
                    <Button type="submit" className="gap-1">
                      <Save className="h-4 w-4" />
                      Save Changes
                    </Button>
                  </CardFooter>
                </form>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-destructive">
                    Danger Zone
                  </CardTitle>
                  <CardDescription>
                    Irreversible and destructive actions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border border-destructive/20 p-4">
                    <h3 className="font-medium mb-1">Delete Account</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Once you delete your account, there is no going back. This
                      action cannot be undone.
                    </p>
                    <Button
                      onClick={handleAccountDelete}
                      variant="destructive"
                      className="gap-1"
                    >
                      <Trash className="h-4 w-4" />
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Manage your password and account security.
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleSecuritySubmit}>
                  <CardContent className="space-y-6">
                    <div className="grid gap-5">
                      <div className="grid gap-3">
                        <Label htmlFor="current-password">
                          Current Password
                        </Label>
                        <Input
                          id="current-password"
                          type="password"
                          onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                      </div>

                      <div className="grid gap-3">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input
                          id="new-password"
                          type="password"
                          onChange={(e) => setnewPassword(e.target.value)}
                        />
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="font-medium mb-3">
                        Two-Factor Authentication(Comming Soon)
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Add an extra layer of security to your account by
                        requiring both your password and a code from your phone.
                      </p>
                      <Button className="mb-4" type="button">
                        Soon ! !
                      </Button>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end border-t px-6 py-4">
                    <Button type="submit">Update Password</Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Control how you receive notifications.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Notification settings would go here */}
                    <p className="text-muted-foreground">
                      Notification settings coming soon.
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end border-t px-6 py-4">
                  <Button
                    onClick={() => {
                      toast.success("Prefrence Saved Now Relax");
                    }}
                    type="button"
                  >
                    Save Preferences
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
