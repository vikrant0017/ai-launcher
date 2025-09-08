import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Launcher } from "@/components/Launcher";
import React from "react";

const App = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Launcher />
    </ThemeProvider>
  );
};

const root = createRoot(document.body);
root.render(<App />);
