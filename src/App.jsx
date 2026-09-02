import Topbar from './components/Topbar.jsx'
import Footer from './components/Footer.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
import RouteMeta from './components/RouteMeta.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import AppRoutes from './routes.jsx'

// Shared frame around every page: top bar on top, page content in the middle,
// footer at the bottom. The pages themselves swap out inside <AppRoutes />.
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
