import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Assuming you're using react-router
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"; // Make sure these are properly imported
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User, UserX, FileText, HelpCircle, LogOut } from "lucide-react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { logout } from "@/store/authSlice";
import { useToast } from "@/hooks/use-toast";

interface UserMenuProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export function UserMenu({ user }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const handleLogout = () => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/users/logout`, {
        withCredentials: true,
      })
      .then(() => {
        dispatch(logout());
        navigate("/");
        toast.success("Miss You!!,", {
          description: "Hope to see you again.",
        });
      })
      .catch((err) => {
        console.log(err);
        toast.error("Oh oo..", {
          description: err,
        });
      });
  };

  return (
    <div className="relative">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger>
          <div className="relative h-10 w-10 cursor-pointer">
            <Avatar className="h-10 w-10 transition-all hover:scale-105">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 z-50" align="end">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <Link
                to="/profile/edit"
                className="flex w-full cursor-pointer items-center"
              >
                <User className="mr-2 h-4 w-4" />
                <span>Edit Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link
                to="/blocked-users"
                className="flex w-full cursor-pointer items-center"
              >
                <UserX className="mr-2 h-4 w-4" />
                <span>Blocked Users</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Link
              to="/terms"
              className="flex w-full cursor-pointer items-center"
            >
              <FileText className="mr-2 h-4 w-4" />
              <span>Terms & Conditions</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link
              to="/support"
              className="flex w-full cursor-pointer items-center"
            >
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>Support</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <button
              onClick={handleLogout}
              className="flex w-full cursor-pointer items-center text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
