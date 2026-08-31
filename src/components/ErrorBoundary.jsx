import { Component } from 'react'

// Fanger opp uventede feil i en underside slik at resten av nettsiden
// (toppbar, footer) fortsatt vises i stedet for en blank skjerm.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('Uventet feil i siden:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container page">
          <h1>Noe gikk galt</h1>
          <p className="page-lead">
            Prøv å laste siden på nytt. Hvis det fortsetter, gi beskjed til den
            som lagde nettsiden.
          </p>
          <a href="/">Tilbake til forsiden</a>
        </div>
      )
    }
    return this.props.children
  }
}
