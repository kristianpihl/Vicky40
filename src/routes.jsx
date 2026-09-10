import { Routes, Route, Navigate } from 'react-router-dom'

import Home from './pages/Home.jsx'
import Rsvp from './pages/Rsvp.jsx'
import Program from './pages/Program.jsx'
import Guests from './pages/Guests.jsx'
import WhoWhichDay from './pages/WhoWhichDay.jsx'
import Venue from './pages/Venue.jsx'
import Oslo from './pages/Oslo.jsx'
import OsloArticle from './pages/OsloArticle.jsx'
import Faq from './pages/Faq.jsx'
import Gallery from './pages/Gallery.jsx'
import PromoVideo from './pages/PromoVideo.jsx'
import Updates from './pages/Updates.jsx'
import AdminLayout from './components/AdminLayout.jsx'
import AdminRsvps from './pages/AdminRsvps.jsx'
import AdminPhotos from './pages/AdminPhotos.jsx'
import AdminProgram from './pages/AdminProgram.jsx'
import AdminFaq from './pages/AdminFaq.jsx'
import AdminFront from './pages/AdminFront.jsx'
import AdminVenue from './pages/AdminVenue.jsx'
import AdminOslo from './pages/AdminOslo.jsx'
import AdminGuests from './pages/AdminGuests.jsx'
import NotFound from './pages/NotFound.jsx'

// All URLs in one place. To change a URL, do it here and in
// navLinks in src/content/site.js (and pageMeta.js).
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/rsvp" element={<Rsvp />} />
      <Route path="/program" element={<Program />} />
      <Route path="/guests" element={<Guests />} />
      <Route path="/who-is-coming-when" element={<WhoWhichDay />} />
      <Route path="/venue" element={<Venue />} />
      <Route path="/oslo" element={<Oslo />} />
      <Route path="/oslo/:id" element={<OsloArticle />} />
      <Route path="/faq" element={<Faq />} />
      <Route path="/photos" element={<Gallery />} />
      <Route path="/promo-video" element={<PromoVideo />} />
      <Route path="/updates" element={<Updates />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/rsvps" replace />} />
        <Route path="rsvps" element={<AdminRsvps />} />
        <Route path="front" element={<AdminFront />} />
        <Route path="program" element={<AdminProgram />} />
        <Route path="venue" element={<AdminVenue />} />
        <Route path="faq" element={<AdminFaq />} />
        <Route path="oslo" element={<AdminOslo />} />
        <Route path="guests" element={<AdminGuests />} />
        <Route path="photos" element={<AdminPhotos />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
