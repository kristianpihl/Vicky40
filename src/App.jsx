import Topbar from './components/Topbar.jsx'
import Footer from './components/Footer.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import RouteMeta from './components/RouteMeta.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import AppRoutes from './routes.jsx'

// Felles ramme rundt alle sider: toppbar øverst, sideinnhold i midten,
// footer nederst. Selve sidene byttes ut inne i <AppRoutes />.
export default function App() {
  return (
    <div className="app-shell">
      <ScrollToTop />
      <RouteMeta />
      <Topbar />
      <main className="app-main">
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  )
}
