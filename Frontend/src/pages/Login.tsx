import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MessageCircle } from "lucide-react";
import { useDispatch } from "react-redux";
import { login, logout } from "@/store/authSlice";
import axios from "axios";

export default function Login() {
  const [emailorPhone, setEmailorPhone] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const { toast } = useToast();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    //if check to secure email/phoneNo input.
    if (emailorPhone.includes("@")) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailorPhone)) {
        toast.error("Please enter a valid email address.");
        return;
      }
    } else if (/^\d+$/.test(emailorPhone)) {
      // Validate phone number format
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(emailorPhone)) {
        toast.error("Please enter a valid 10-digit phone number.");
        return;
      }
    } else {
      // Handle invalid input format
      toast.error("Please enter a valid email address or phone number.");
      return;
    }

    if (rememberMe) {
      toast.warning("You are My GF??", {
        description: "Then why the hell I remember you!!",
      });
    }

    const currUser = {
      emailorPhone,
      password,
    };
    //db call
    axios
      .post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/users/signin`,
        currUser,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      )
      .then((response) => {
        //updating authSlice
        const userData = response.data.data.user;
        dispatch(login({ userData }));
        navigate("/");
        //will give success toast
        toast.success("Woahhh!!", {
          description: "Welcome, to the Website",
        });
      })
      .catch((err) => {
        dispatch(logout());
        console.log("Login failed", err);
        const errorMessage =
          err.response?.data?.message || "Something went wrong";
        //failure toast
        toast.error("Sorry!", {
          description: errorMessage,
        });
      });
  };

  const handleForgetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    toast.error("Bhul gya bhul gya mai kya karu");
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
              Welcome back
            </CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email or PhoneNo</Label>
                <Input
                  id="email"
                  type="text"
                  placeholder="name@example.com | xxxxxxxxxx"
                  value={emailorPhone}
                  onChange={(e) => setEmailorPhone(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button
                    onClick={handleForgetPassword}
                    className="text-sm font-medium text-accent hover:underline"
                    type="button"
                  >
                    Forgot password?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  placeholder="Enter your password"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
              <div className="flex items-center space-x-2 pb-3">
                <Checkbox
                  id="remember"
                  checked={rememberMe} //this is value extracting from state , true or false.
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                />
                <Label
                  htmlFor="remember"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Remember me
                </Label>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-button hover:bg-button/90"
              >
                Sign In
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="font-medium text-accent hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>
            By signing in, you agree to our{" "}
            <Link
              to="/terms"
              className="underline underline-offset-4 hover:text-accent"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              to="/privacy"
              className="underline underline-offset-4 hover:text-accent"
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
