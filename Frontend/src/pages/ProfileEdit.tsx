import { useState } from "react";
import { Link } from "react-router-dom";
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

// Mock user data
const user = {
  id: "1",
  name: "John Doe",
  email: "john.doe@example.com",
  avatar:
    "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  bio: "Software engineer with a passion for UI/UX design. Love traveling and photography in my free time.",
  phone: "+1 (555) 123-4567",
};

export default function ProfileEdit() {
  const [formData, setFormData] = useState(user);
  const { toast } = useToast();

  // This function is changing the data in real time.using state
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would update the user's profile here
    toast.success("Profile Updated", {
      description: "Your profile has been updated successfully.",
    });
  };

  const handleSecuritySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    //Backend call.
    toast.success("Password Updated", {
      description: "Your Password has been updated successfully",
    });
  };

  const handleAccountDelete = () => {
    toast.error("Are you sure you want to delete your account?", {
      description: "Avoid pop up if you don't want to or click Confirm",
      action: {
        label: "Confirm",
        onClick: () => {
          console.log("User confirmed deletion");
          // 🚀 Do your DB delete API call here
          // Example: await deleteAccountAPI(userId);
        },
      },
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
                            alert("hi");
                          }}
                        >
                          <Camera className="h-4 w-4" />
                          <span className="sr-only">Upload avatar</span>
                        </Button>
                      </div>
                      <div className="flex-1 space-y-1 text-center sm:text-left">
                        <h3 className="font-medium">{formData.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {formData.email}
                        </p>
                        <div className="mt-2 flex justify-center sm:justify-start gap-2 pt-2">
                          <Button variant="ghost" size="sm" type="button">
                            Remove
                          </Button>
                        </div>
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
                          onChange={handleChange}
                        />
                      </div>

                      <div className="grid gap-3">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
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
                        <Input id="current-password" type="password" />
                      </div>

                      <div className="grid gap-3">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input id="new-password" type="password" />
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
