import { useEffect, useState } from 'react'
import { site } from '../content/site.js'

// Regner ut hvor lang tid det er igjen til måltidspunktet.
function getTimeLeft(target) {
  const total = target.getTime() - Date.now()
  const clamped = Math.max(total, 0)
  return {
    total,
    days: Math.floor(clamped / (1000 * 60 * 60 * 24)),
    hours: Math.floor((clamped / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((clamped / (1000 * 60)) % 60),
    seconds: Math.floor((clamped / 1000) % 60),
  }
}

// Nedteller som oppdaterer seg hvert sekund.
// Måldato hentes fra site.partyStart, men kan overstyres med en prop.
export default function Countdown({ target = site.partyStart }) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(target))

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft(target)), 1000)
    return () => clearInterval(id)
  }, [target])

  if (timeLeft.total <= 0) {
    return (
      <div className="countdown-done">
        <p className="countdown-done-text">Festen er i gang! 🎉</p>
      </div>
    )
  }

  const units = [
    { label: 'dager', value: timeLeft.days },
    { label: 'timer', value: timeLeft.hours },
    { label: 'min', value: timeLeft.minutes },
    { label: 'sek', value: timeLeft.seconds },
  ]

  return (
    <div className="countdown" aria-label="Nedtelling til festen">
      {units.map((unit) => (
        <div className="countdown-unit" key={unit.label}>
          <span className="countdown-value">
            {String(unit.value).padStart(2, '0')}
          </span>
          <span className="countdown-label">{unit.label}</span>
        </div>
      ))}
    </div>
  )
}
