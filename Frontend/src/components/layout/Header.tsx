import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../theme/ThemeProvider";

interface HeaderProps {
  isAuthenticated?: boolean;
}

export function Header({ isAuthenticated = false }: HeaderProps) {
  //add a useEffect which pull from the auth state don't use props
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <MessageCircle className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">ChatConnect</span>
        </Link>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="mr-2"
          >
            {theme === "light" ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>

          {!isAuthenticated ? (
            <>
              <Link to="/login">
                <Button variant="ghost">Log in</Button>
              </Link>
              <Link to="/signup">
                <Button>Sign up</Button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/logout">
                <Button variant="outline">Dashboard</Button>
              </Link>
              <Link to="/logout">
                <Button>Logout</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
