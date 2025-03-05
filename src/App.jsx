import { RouterProvider, createRouter } from "@tanstack/react-router";
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AssetProvider } from './context/AssetContext';
import { SettingsProvider } from './context/SettingsContext';
// import { routeTree } from "./routeTree.gen";
import { useAuth } from './context/AuthContext';

import { router } from './router'

// const router = createRouter({ routeTree });

function InnerApp() {
  // const { isAuthenticated } = useAuth();
    const auth = useAuth()
    return <RouterProvider router={router} context={{ auth }} />
}


export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AssetProvider>
          <SettingsProvider>
            <InnerApp />
          </SettingsProvider>
        </AssetProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
