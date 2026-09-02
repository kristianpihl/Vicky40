import { Component } from 'react'

// Catches unexpected errors in a page so the rest of the site
// (top bar, footer) still shows instead of a blank screen.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('Unexpected error in page:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container page">
          <h1>Something went wrong</h1>
          <p className="page-lead">
            Try reloading the page. If it keeps happening, let the person who
            made this site know.
          </p>
          <a href="/">Back to the front page</a>
        </div>
      )
    }
    return this.props.children
  }
}
