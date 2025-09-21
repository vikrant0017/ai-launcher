import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Launcher } from "@/components/Launcher";
import React, { useEffect } from "react";
import Preferences from "./components/Preferences";
import { ConfigProvider, useConfig } from "./components/ConfigProvider";

const SimpleRouter = () => {
  // Comopnent rerenders on context value change
  const { apiKey, watchDir, setApiKey, setWatchDir } = useConfig();
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
    };
    fetchConfig();
  }, []); // Runs only once
  console.log("Count");

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

const root = createRoot(document.body);
root.render(<App />);
