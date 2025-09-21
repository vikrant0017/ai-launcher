"use strict";
import React, { useContext } from "react";

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
