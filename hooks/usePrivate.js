import { useEffect } from "react";
import { signIn } from "next-auth/react";
import { useAuth } from "@/components/AuthContext";

// Use this on all private routes. It will redirect the user to the login page if not authenticated,
// and to the trip-planner page after login (instead of dashboard)
export const usePrivate = (callbackUrl = "/trip-planner") => {
  const { data: session, status } =  useAuth();

  useEffect(() => {
    if (status === "unauthenticated") {
      signIn(undefined, { callbackUrl });
    }
  }, [status]);

  return [session, status];
};