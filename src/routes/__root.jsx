import { createRootRouteWithContext } from '@tanstack/react-router'
import { createRootRoute, Outlet, useMatchRoute } from "@tanstack/react-router";
import { Navigation } from '../components/Navigation/Navigation';
import { useTheme } from '../context/ThemeContext';

function RootComponent() {
  const matchRoute = useMatchRoute();
  const isLoginPage = matchRoute({ to: '/login' });
  const { isDarkMode } = useTheme();

  return (
    <div className={`app-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      {!isLoginPage && <Navigation />}
      <main className={`main-content ${isLoginPage ? 'login-layout' : 'default-layout'}`}>
        <Outlet />
      </main>
    </div>
  );
}

export const Route = createRootRouteWithContext()({
  component: () => <Outlet />,
})