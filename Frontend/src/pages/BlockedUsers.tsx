import React, { useEffect, useState } from "react";
import axios from "axios";
import { UserCircle } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { useToast } from "@/hooks/use-toast";

interface BlockedUser {
  _id: string;
  name: string;
  avatar?: string;
}

const BlockedUser: React.FC = () => {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBlockedUsers = async () => {
      try {
        setLoading(true);
        // Replace with your actual API endpoint
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/users/all-blockedusers`,
          { withCredentials: true }
        );
        console.log(response);
        setBlockedUsers(response.data.data);
        setError(null);
      } catch (err: any) {
        if (err.response.data.message === "No blocked users found") {
          setBlockedUsers([]);
        } else {
          console.error("Failed to fetch blocked users:", err);
          setError("Failed to load blocked users. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBlockedUsers();
  }, []);

  const handleUnblock = (userId: string) => {
    console.log(userId);
    axios
      .post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/users/unblock`,
        {
          userId,
        },
        {
          withCredentials: true,
        }
      )
      .then(() => {
        toast.success("User Removed from your Block list successfully");
      })
      .catch((err) => {
        toast.error(
          err.response?.data?.message ||
            "Some unexpected happen try again later"
        );
      });
    console.log(`Unblock user with ID: ${userId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-300">Loading blocked users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-900 text-white">
      <Header isAuthenticated={true} />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-8 text-white">Blocked Users</h1>

        {blockedUsers.length === 0 ? (
          <div className="text-center p-8 bg-gray-800 rounded-lg">
            <p className="text-gray-300">You haven't blocked any users yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {blockedUsers.map((user) => (
              <div
                key={user._id}
                className="flex items-center justify-between p-4 bg-gray-800/70 rounded-lg border border-gray-700"
              >
                <div className="flex items-center space-x-4">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={`${user.name}'s avatar`}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                      <UserCircle className="w-10 h-10 text-gray-400" />
                    </div>
                  )}
                  <span className="font-medium text-gray-200">{user.name}</span>
                </div>

                <button
                  onClick={() => handleUnblock(user._id)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Unblock
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockedUser;
