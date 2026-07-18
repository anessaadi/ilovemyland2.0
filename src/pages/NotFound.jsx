import { Link } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import '../styles/landing.css'

export default function NotFound() {
  return (
    <>
      <Header />
      <section className="main-section main-section2">
        <div className="container">
          <h1 style={{ marginTop: '6em' }}>Page not found</h1>
          <p>
            <Link to="/">Go back home</Link>
          </p>
        </div>
      </section>
      <Footer />
    </>
  )
}
