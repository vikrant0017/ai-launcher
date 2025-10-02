import React, { createContext, useContext } from "react";

interface Context {
  route: string;
  setRoute: (route: string) => void;
}

const RouteContext = createContext<Context | undefined>(undefined);

type RouteProviderProps = {
  children: React.ReactElement<RouteProps>[];
  currentRoute: string;
  onRouteChange: (route: string) => void;
};

export default function RouteProvider({
  children,
  currentRoute,
  onRouteChange,
}: RouteProviderProps) {
  const routeChild = React.Children.toArray(children).filter((child) => {
    return (
      React.isValidElement(child) &&
      (child.props as RouteProps).route &&
      (child.props as RouteProps).route === currentRoute
    );
  });
  return (
    <RouteContext.Provider
      value={{ route: currentRoute, setRoute: onRouteChange }}
    >
      {routeChild}
    </RouteContext.Provider>
  );
}

interface RouteProps {
  children: React.ReactNode;
  route: string;
}

export const Route: React.FC<RouteProps> = ({ children, route }) => {
  // Store route as a property for parent component filtering
  return <div data-route={route}>{children}</div>;
};

export const useRoute = () => {
  const context = useContext(RouteContext);
  if (context == null) {
    throw new Error("Component must be inside ConfigProvider");
  }
  return context;
};
