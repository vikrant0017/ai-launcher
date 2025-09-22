import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Launcher } from "@/components/Launcher";
import React, { useEffect, useState } from "react";
import Preferences from "./components/Preferences";
import { ConfigProvider, useConfig } from "./components/ConfigProvider";

const SimpleRouter = () => {
  // Comopnent rerenders on context value change
  const { apiKey, watchDir, setApiKey, setWatchDir } = useConfig();
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchConfig = async () => {
      const response = await fetch("http://localhost:8001/config", {
        headers: {
          "Content-Type": "application/json",
        },
      });
      const jsonResponse = await response.json();
      setApiKey(jsonResponse.gemini_api_key);
      setWatchDir(jsonResponse.watch_dir);
      setIsLoading(false);
    };
    fetchConfig();
  }, []); // Runs only once
  console.log("Count");

  if (isLoading) {
    return <div>Loading Configuration...</div>;
  }

  return apiKey && watchDir ? <Launcher /> : <Preferences />;
};

const App = () => {
  return (
    <ConfigProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <SimpleRouter />
      </ThemeProvider>
    </ConfigProvider>
  );
};

export default App;
