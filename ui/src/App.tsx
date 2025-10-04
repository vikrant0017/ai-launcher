import { ThemeProvider } from "@/components/ThemeProvider";
import { Launcher } from "@/components/Launcher";
import React, { useEffect, useState } from "react";
import Preferences from "./components/Preferences";
import { ConfigProvider } from "./components/ConfigProvider";
import RouteProvider, { Route } from "./components/RouteProvider";
import ActionBar from "./components/ActionBar";
import Notes from "./components/Notes";
import { useShortcut } from "@/hooks";

const App = () => {
  const [route, setRoute] = useState("/launcher");
  const navItems = {
    ai: "AI",
    notes: "Notes",
  };

  useShortcut("Ctrl-N", () => {
    setRoute("/notes");
  });
  useShortcut("Ctrl-I", () => {
    setRoute("/launcher");
  });

  useShortcut("Ctrl-P", () => {
    setRoute("/preferences");
  });

  useShortcut("Ctrl-A", (e) => {
    const target = e.target;
    if (target instanceof HTMLElement && target?.tagName != "INPUT") {
      e.preventDefault();
    }
  });

  useShortcut("ESCAPE", (e) => {
    const target = e.target;
    if (target instanceof HTMLElement && target?.tagName === "INPUT") {
      target.blur();
    }
  });

  const navItemsRoute: Record<string, string> = {
    ai: "/launcher",
    notes: "/notes",
  };

  const handleButtonClick = () => {
    setRoute("/preferences");
  };

  const handleNavItemChange = (val: string) => {
    setRoute(navItemsRoute[val]);
  };

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <ConfigProvider>
        <div className="flex h-screen flex-col justify-between">
          <RouteProvider currentRoute={route} onRouteChange={setRoute}>
            <Route route="/launcher">
              <Launcher />
            </Route>
            <Route route="/preferences">
              <Preferences />
            </Route>
            <Route route="/notes">
              <Notes />
            </Route>
          </RouteProvider>
          <div className="border-t-1">
            <ActionBar
              navItems={navItems}
              onButtonClick={handleButtonClick}
              onNavItemChange={handleNavItemChange}
            />
          </div>
        </div>
      </ConfigProvider>
    </ThemeProvider>
  );
};

export default App;
