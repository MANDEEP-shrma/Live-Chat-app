import axios from "axios";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Signup() {
  const [name, setName] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords are not matching");
      return;
    }

    if (phoneNo.length != 10) {
      toast.warning("Enter 10 Digit Valid Phone No");
      return;
    }
    if (!avatarFile) {
      toast.error("Please upload an avatar!");
      return;
    }
    if (!agreeTerms) {
      toast.error("Please Agree the Terms and Conditions");
      return;
    }
    if (agreeTerms) {
      toast.warning("Bina padhe hi agree karliya!!!", {
        description: "Easy peasy",
      });
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    //This is new to me :- when you are sending avatar you have to convert normal data into multipart-formdata
    const newUser = new FormData();
    newUser.append("name", name);
    newUser.append("phoneNo", phoneNo);
    newUser.append("email", email);
    newUser.append("password", password);
    newUser.append("avatar", avatarFile); // Important! File type

    //Db calls
    axios
      .post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/users/register`,
        newUser,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )
      .then((response) => {
        toast.success("WELCOME!!", {
          description: response.data,
        });

        window.location.href = "/login";

        //Now here I will not  update the state of authSlice because the user just registered we will wait for signin.
      })
      .catch((err) => {
        console.log(err);
        toast.error("AHH!!", {
          description: err.response?.data?.message || "Something Went wrong",
        });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 lg:p-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-primary">
            <MessageCircle className="h-8 w-8" />
            <span className="text-3xl font-bold">ChatConnect</span>
          </Link>
        </div>

        <Card className="w-full shadow-lg">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl font-bold text-center">
              Create an account
            </CardTitle>
            <CardDescription className="text-center">
              Enter your information to create your account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneno">Phone No</Label>
                <Input
                  id="phoneno"
                  placeholder="xxxxxxxxxx"
                  value={phoneNo}
                  onChange={(e) => setPhoneNo(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm it here"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="avatar">Avatar</Label>
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                  className="w-full"
                />
              </div>
              <div className="flex items-start space-x-2 pb-3">
                <Checkbox
                  id="terms"
                  checked={agreeTerms}
                  onCheckedChange={(checked) => setAgreeTerms(checked === true)}
                  required
                />
                <Label
                  htmlFor="terms"
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree to the{" "}
                  <Link to="/terms" className="text-accent hover:underline">
                    terms of service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-accent hover:underline">
                    privacy policy
                  </Link>
                </Label>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-button hover:bg-button/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Create Account"}
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-accent hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
