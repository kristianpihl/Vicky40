import { useEffect, useState } from 'react'
import { site } from '../content/site.js'

// Works out how much time is left until the target moment.
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

// Countdown that updates every second.
// The target date comes from site.partyStart, but can be overridden with a prop.
export default function Countdown({ target = site.partyStart }) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(target))

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft(target)), 1000)
    return () => clearInterval(id)
  }, [target])

  if (timeLeft.total <= 0) {
    return (
      <div className="countdown-done">
        <p className="countdown-done-text">The party has started! 🎉</p>
      </div>
    )
  }

  const units = [
    { label: 'days', value: timeLeft.days },
    { label: 'hours', value: timeLeft.hours },
    { label: 'min', value: timeLeft.minutes },
    { label: 'sec', value: timeLeft.seconds },
  ]

  return (
    <div className="countdown" aria-label="Countdown to the party">
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
