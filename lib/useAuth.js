// lib/useAuth.js
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

export function useAuth() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
    } else {
      router.replace("/login");
    }
  }, []);

  return { user };
}
