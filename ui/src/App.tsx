import { ThemeProvider } from "@/components/ThemeProvider";
import { Launcher } from "@/components/Launcher";
import React, { useState } from "react";
import Preferences from "./components/Preferences";
import { ConfigProvider } from "./components/ConfigProvider";
import RouteProvider, { Route } from "./components/RouteProvider";
import ActionBar from "./components/ActionBar";
import Notes from "./components/Notes";

const App = () => {
  const [route, setRoute] = useState("/launcher");
  const navItems = {
    ai: "AI",
    notes: "Notes",
  };
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
