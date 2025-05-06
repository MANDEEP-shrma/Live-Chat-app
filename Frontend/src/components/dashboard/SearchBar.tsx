import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { addFriend } from "@/store/friendSlice";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useRef } from "react";

interface User {
  _id: string;
  name: string;
  avatar: string;
  email: string;
}

export function SearchBar() {
  const [inputValue, setInputValue] = useState("");
  const [results, setResults] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const dispatch = useDispatch();
  const { toast } = useToast();

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        clearSearch();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearch = async () => {
    if (inputValue.trim().length === 0) return;

    setIsLoading(true);
    setShowResults(true);

    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/v1/users/search-contact?emailorPhone=${inputValue}`,
        {
          withCredentials: true,
        }
      );
      const data = response.data.data;
      console.log(data);
      setResults(data);
    } catch (error) {
      console.error("Error searching users:", error);
      toast.error(
        (error as any).response?.data?.message || "Something went wrong"
      );
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setInputValue("");
    setResults(null);
    setShowResults(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleAddFriend = () => {
    console.log(results);
    axios
      .post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/users/add-friend`,
        {
          friendId: results?._id,
        },
        {
          withCredentials: true,
        }
      )
      .then((response) => {
        console.log(response);
        dispatch(addFriend({ friend: response.data.data.user }));
        const existingFriends = JSON.parse(
          localStorage.getItem("friends") || "[]"
        );
        localStorage.setItem(
          "friends",
          JSON.stringify([...existingFriends, response.data.data.user])
        );
        toast.success("Friend added successfully");

        // Clear search input and hide results after successfully adding a friend
        clearSearch();
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "something went wrong.");
      });
  };

  return (
    <div className="w-full" ref={containerRef}>
      {/* Search input */}
      <div className="relative flex items-center mb-2">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 cursor-pointer"
          onClick={handleSearch}
        />
        <Input
          type="search"
          placeholder="Search for friends using email or phone"
          className="pl-10 pr-10 py-5 bg-gray-800 border-gray-700 text-white w-full"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
        {inputValue && (
          <X
            className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 cursor-pointer"
            onClick={clearSearch}
          />
        )}
      </div>

      {/* Results display - fixed container with consistent height */}
      {showResults && (
        <div className="w-full rounded-md bg-gray-800 border border-gray-700 overflow-hidden min-h-[80px]">
          {isLoading ? (
            <div className="py-6 px-3 text-center text-gray-300">
              Searching...
            </div>
          ) : results ? (
            <div className="flex items-center px-4 py-3 hover:bg-gray-700">
              <div className="flex-shrink-0">
                {results.avatar ? (
                  <img
                    src={results.avatar}
                    alt={results.name || "User Avatar"}
                    className="h-12 w-12 rounded-full"
                    onError={(e) => {
                      // Fallback if avatar fails to load
                      (e.target as HTMLImageElement).src =
                        "/default-avatar.png";
                    }}
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-gray-600 flex items-center justify-center text-white text-lg font-semibold">
                    {results.name ? results.name.charAt(0).toUpperCase() : "U"}
                  </div>
                )}
              </div>
              <div className="ml-4 flex-grow">
                <p className="text-base font-medium text-white">
                  {results.name || "User"}
                </p>
                <p className="text-sm text-gray-400">{results.email}</p>
              </div>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 text-sm"
                onClick={handleAddFriend}
              >
                Add Friend
              </button>
            </div>
          ) : (
            <div className="py-6 px-3 text-center text-gray-300">
              No user found with this email or phone number
            </div>
          )}
        </div>
      )}
    </div>
  );
}
