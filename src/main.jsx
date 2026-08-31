import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

// Rekkefølgen er viktig: Bootstrap først, så vår egen CSS på toppen
// slik at våre farger og justeringer vinner.
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'

import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
