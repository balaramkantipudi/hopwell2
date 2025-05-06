// components/Layout.js
import "react-tooltip/dist/react-tooltip.css";
import { useEffect, useState } from "react";
import { Montserrat } from "next/font/google";
import { useRouter } from "next/router";
import NextNProgress from "nextjs-progressbar";
import { Toaster } from "react-hot-toast";
import { Crisp } from "crisp-sdk-web";
import { Tooltip } from "react-tooltip";
import ErrorBoundary from "./ErrorBoundary";
import config from "@/config";
// Import our custom auth hook instead of useSession
import { useAuth } from "./AuthContext";

const font = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: 'swap',
});

export default function Layout({ children }) {
  const router = useRouter();
  // Use our custom auth hook instead of useSession
  const { user } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  // Set Crisp Chat Support
  useEffect(() => {
    if (router.isReady && config?.crisp?.id) {
      Crisp.configure(config.crisp.id);

      // If config file has onlyShowOnRoutes, will be hidden on the routes in the array.
      if (config.crisp.onlyShowOnRoutes) {
        if (!config.crisp.onlyShowOnRoutes.includes(router.pathname)) {
          Crisp.chat.hide();
          Crisp.chat.onChatClosed(() => {
            Crisp.chat.hide();
          });
        }
      }
    }
  }, [router.isReady, router.pathname]);

  // Add User Unique ID to Crisp to easily identify users when reaching support
  useEffect(() => {
    if (user && config?.crisp?.id) {
      Crisp.session.setData({ userId: user.id });
    }
  }, [user]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <ErrorBoundary>
      <style jsx global>{`
        html {
          font-family: ${font.style.fontFamily};
        }
        /* Add some additional styling for headings */
        h1, h2, h3, h4, h5, h6 {
          font-weight: 700;
          letter-spacing: -0.025em;
        }
        /* Add a subtle animation for buttons */
        .btn {
          transition: all 0.2s ease-in-out;
        }
        .btn:hover {
          transform: translateY(-2px);
        }
      `}</style>
      {/* Automatically show a progress bar at the top when navigating between pages */}
      <NextNProgress
        color={config.colors.main}
        options={{ showSpinner: false }}
      />
      {children}
      {/* Show Success/Error messages anywhere from the app with toast() */}
      {isMounted && (
        <Toaster
          toastOptions={{
            duration: 3000,
          }}
        />
      )}
      {/* Show tooltips if any JSX elements has these 2 attributes: data-tooltip-id="tooltip" data-tooltip-content="" */}
      <Tooltip
        id="tooltip"
        className="z-[60] !opacity-100 max-w-sm shadow-lg"
      />
    </ErrorBoundary>
  );
}