/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from "react";

interface RouterContextType {
  path: string;
  query: Record<string, string>;
  navigate: (toPath: string, queryParams?: Record<string, string>) => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

export function RouterProvider({ children }: { children: React.ReactNode }) {
  const [path, setPath] = useState<string>(() => {
    // Read from window location or fallback to /main
    const initialPath = window.location.pathname;
    return initialPath === "/" ? "/main" : initialPath;
  });

  const [query, setQuery] = useState<Record<string, string>>(() => {
    return parseQueryParams(window.location.search);
  });

  function parseQueryParams(searchStr: string): Record<string, string> {
    const params: Record<string, string> = {};
    const searchParams = new URLSearchParams(searchStr);
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  }

  const navigate = (toPath: string, queryParams?: Record<string, string>) => {
    const serializedQuery = queryParams
      ? "?" + new URLSearchParams(queryParams).toString()
      : "";
    const fullUrl = toPath + serializedQuery;

    window.history.pushState(null, "", fullUrl);
    setPath(toPath);
    setQuery(queryParams || {});
  };

  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname === "/" ? "/main" : window.location.pathname);
      setQuery(parseQueryParams(window.location.search));
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return (
    <RouterContext.Provider value={{ path, query, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error("useRouter must be used within a RouterProvider");
  }
  return context;
}
