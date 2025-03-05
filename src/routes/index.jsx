import { createFileRoute, redirect } from '@tanstack/react-router'
import { Outlet, useMatchRoute } from '@tanstack/react-router'
import { Navigation } from '../components/Navigation/Navigation'
import { useTheme } from '../context/ThemeContext'
import { TabMenu } from '../components/TabMenu/TabMenu'
import { HeaderPanel } from '../components/Panels/HeaderPanel'
import { useSettings } from '../context/SettingsContext';
import  Screener from '../components/Screener/Screener';
import { OverviewTab } from '../components/Tabs/Overview';
import { QuantitativeTab } from '../components/Tabs/Quantitative';
import { QualitativeTab } from '../components/Tabs/Qualitative';
import { useEffect, useRef } from 'react'
// import { useAuth } from '../context/AuthContext';

// const { isAuthenticated } = useAuth();

const tabsConfig = [
  {
    id: 'overview',
    label: 'Overview',
    content: <OverviewTab />
  },
  {
    id: 'quantitative',
    label: 'Quantitative Analysis',
    content: <QuantitativeTab />
  },
  {
    id: 'qualitative',
    label: 'Qualitative Analysis',
    content: <QualitativeTab />
  }
];

function renderBody() {
  const { showScreener } = useSettings();
  return showScreener ? <Screener /> 
  : <><HeaderPanel /><TabMenu tabs={tabsConfig} /></>;
}

function RootComponent() {
  const renderCount = useRef(0)
  const matchRoute = useMatchRoute()
  const isLoginPage = matchRoute({ to: '/login' })
  const { isDarkMode } = useTheme()
  
  useEffect(() => {
    renderCount.current += 1
  })

  return (
    <div
      className={`app-container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}
    >
      {!isLoginPage && <Navigation />}
      <main
        className={`main-content ${isLoginPage ? 'login-layout' : 'default-layout'}`}
      >
        {renderBody()}
        <div className="content-area">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export const Route = createFileRoute('/')({
  beforeLoad: async ({ context, location }) => {
    // console.log('context', context.auth)
    // console.log('isAuthenticated', context.auth.isAuthenticated())
    // console.log('location', location)
    if (!context.auth.isAuthenticated()) {
      throw redirect({
        to: '/presentation',
        // search: {
        //   // Use the current location to power a redirect after login
        //   // (Do not use `router.state.resolvedLocation` as it can
        //   // potentially lag behind the actual current location)
        //   redirect: location.href,
        // },
      })
    }
  },
  component: RootComponent,
})

// function Index() {
//   return (
//     <div className="p-2">
//       <h3>Welcome Home!</h3>
//     </div>
//   );
// }
