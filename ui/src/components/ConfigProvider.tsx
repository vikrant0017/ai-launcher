"use strict";
import React, { useContext, useEffect } from "react";

export type Config = {
  apiKey: string;
  setApiKey: React.Dispatch<React.SetStateAction<string>>;
  watchDir: string;
  setWatchDir: React.Dispatch<React.SetStateAction<string>>;
};

const ConfigProviderContext = React.createContext<Config | undefined>(
  undefined,
);

type ConfigProviderProps = {
  children: React.ReactNode;
};

export function ConfigProvider({ children }: ConfigProviderProps) {
  const [apiKey, setApiKey] = React.useState("");
  const [watchDir, setWatchDir] = React.useState("");

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch("http://localhost:8001/config", {
          headers: {
            "Content-Type": "application/json",
          },
        });
        const jsonResponse = await response.json();
        setApiKey(jsonResponse.gemini_api_key);
        setWatchDir(jsonResponse.watch_dir);
      } catch (error) {
        console.error("Error fetching config", error);
        setApiKey("");
        setWatchDir("");
      }
    };
    fetchConfig();
  }, []); // Runs only once

  return (
    <div className={apiKey}>
      <ConfigProviderContext.Provider
        value={{ apiKey, setApiKey, watchDir, setWatchDir }}
      >
        {children}
      </ConfigProviderContext.Provider>
    </div>
  );
}

export const useConfig = () => {
  const context = useContext(ConfigProviderContext);
  if (context === undefined) {
    throw new Error("useConfig must be used within a ConfigProvider");
  }
  return context;
};
