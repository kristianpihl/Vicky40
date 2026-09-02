import { Routes, Route } from 'react-router-dom'

import Home from './pages/Home.jsx'
import Rsvp from './pages/Rsvp.jsx'
import Program from './pages/Program.jsx'
import Guests from './pages/Guests.jsx'
import WhoWhichDay from './pages/WhoWhichDay.jsx'
import Venue from './pages/Venue.jsx'
import Oslo from './pages/Oslo.jsx'
import OsloBars from './pages/OsloBars.jsx'
import Faq from './pages/Faq.jsx'
import Gallery from './pages/Gallery.jsx'
import PromoVideo from './pages/PromoVideo.jsx'
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
      <Route path="/oslo/bars" element={<OsloBars />} />
      <Route path="/faq" element={<Faq />} />
      <Route path="/photos" element={<Gallery />} />
      <Route path="/promo-video" element={<PromoVideo />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
