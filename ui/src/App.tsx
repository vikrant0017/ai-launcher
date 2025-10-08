import { ThemeProvider } from "@/components/ThemeProvider";
import { Launcher } from "@/components/Launcher";
import React, { useEffect, useState } from "react";
import Preferences from "./components/Preferences";
import { ConfigProvider } from "./components/ConfigProvider";
import RouteProvider, { Route } from "./components/RouteProvider";
import ActionBar from "./components/ActionBar";
import Notes from "./components/Notes";
import ShortcutProvider from "./components/ShortcutProvider";
import { useShortcut } from "./hooks";

const App = () => {
  useShortcut("Ctrl+N", "Change to Notes Mode", () => {
    setRoute("/notes");
  });

  useShortcut("Ctrl+I", "Change to Launcher Mode", () => {
    setRoute("/launcher");
  });

  useShortcut("Ctrl+P", "Change to Preferences Mode", () => {
    setRoute("/preferences");
  });

  useShortcut("Ctrl+A", "Handle Ctrl-A", (e) => {
    const target = e.target;
    if (target instanceof HTMLElement && target?.tagName != "INPUT") {
      e.preventDefault();
    }
  });

  useShortcut("ESCAPE", "Handle Escape key", (e) => {
    const target = e.target;
    if (target instanceof HTMLElement && target?.tagName === "INPUT") {
      target.blur();
    }
  });

  const [route, setRoute] = useState("/launcher");
  const navItems = [
    {
      id: "ai",
      name: "AI",
      route: "/launcher",
      shortcut: "Ctrl + I",
    },
    {
      id: "notes",
      name: "Notes",
      route: "/notes",
      shortcut: "Ctrl + N",
    },
  ];

  const handleButtonClick = () => {
    setRoute("/preferences");
  };

  const handleNavItemChange = (val: string) => {
    const item = navItems.find(({ id }) => id == val);
    if (item) {
      setRoute(item.route);
    }
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

const AppWrapper = () => {
  console.log("hello");
  return (
    <div>
      <ShortcutProvider>
        <App />
      </ShortcutProvider>
    </div>
  );
};

export default AppWrapper;
