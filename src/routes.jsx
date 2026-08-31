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

// Alle nettadresser samlet ett sted. Vil du endre en URL, gjør det her
// og i navLinks i src/content/site.js.
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/rsvp" element={<Rsvp />} />
      <Route path="/program" element={<Program />} />
      <Route path="/gjester" element={<Guests />} />
      <Route path="/hvem-kommer-hvilken-dag" element={<WhoWhichDay />} />
      <Route path="/stedet" element={<Venue />} />
      <Route path="/oslo" element={<Oslo />} />
      <Route path="/oslo/barer" element={<OsloBars />} />
      <Route path="/praktisk-info" element={<Faq />} />
      <Route path="/bilder" element={<Gallery />} />
      <Route path="/promo-video" element={<PromoVideo />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
