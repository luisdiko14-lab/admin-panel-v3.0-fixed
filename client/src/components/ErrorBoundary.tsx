import { useState, useEffect, ReactNode } from "react";
import { X } from "lucide-react";

export function ErrorBoundary({ children }: { children: ReactNode }) {
  useEffect(() => {
    const originalFetch = window.fetch;
    
    window.fetch = function(...args) {
      return originalFetch.apply(this, args).then((response) => {
        if (response.status === 401 || response.status === 403) {
          const confirmed = confirm(
            "Your session has expired. Do you want to go to the login page? Click OK to proceed or Cancel to stay."
          );
          if (confirmed) {
            window.location.href = "/";
          }
        }
        return response;
      });
    } as typeof window.fetch;

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return <>{children}</>;
}
