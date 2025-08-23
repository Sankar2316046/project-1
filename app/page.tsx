
"use client";
import { useAuth } from "@/shared/provider/authContext";

export default function Home() {
  const { user, loading } = useAuth();
  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : user ? (
        <p>Logged in as {user.email}</p>
      ) : (
        <p>Not logged in</p>
      )}
    </div>
  );
}
