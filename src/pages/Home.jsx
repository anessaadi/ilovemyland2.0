import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import { countries } from '../data/countries.js'
import '../styles/landing.css'

export default function Home() {
  const [selected, setSelected] = useState('')
  const navigate = useNavigate()

  const handleGo = () => {
    if (selected) {
      navigate(`/${selected}`)
    } else {
      alert('Please select a country first!')
    }
  }

  return (
    <>
      <Header />
      <section className="main-section main-section2">
        <div className="container">
          <main className="sub-container">
            <section className="hero">
              <h1>
                Show Your{' '}
                <span style={{ color: '#d70000', fontFamily: "'CustomFont', sans-serif" }}>
                  Love
                </span>
                <br /> for Your Country <br /> Effortlessly
              </h1>
              <p>Show your love for your country by adding a flag frame to your profile picture.</p>

              <div className="country-selector">
                <select
                  id="country-dropdown"
                  value={selected}
                  onChange={(e) => setSelected(e.target.value)}
                >
                  <option value="">Select Your Country</option>
                  {countries.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <button id="go-button" onClick={handleGo}>
                  Go
                </button>
              </div>
            </section>
            <section className="image-section">
              <img
                src="/usaphone002.png"
                alt="Placeholder"
                className="placeholder-image"
                style={{ maxWidth: 400 }}
              />
            </section>
          </main>

          <h2>How it works</h2>
          <div className="steps">
            <div className="step">
              <div className="circle">1</div>
              <h3>Upload Your Image</h3>
              <p>
                Begin by uploading the photo you want to use by clicking the upload button
                located at the top of the page.
              </p>
            </div>
            <div className="step">
              <div className="circle">2</div>
              <h3>Adjust and Align</h3>
              <p>
                Use the editing tool to fit your image perfectly within the flag frame. Easily
                crop and position the photo so it matches your desired look and message.
              </p>
            </div>
            <div className="step">
              <div className="circle">3</div>
              <h3>Save Your Profile Pic</h3>
              <p>
                Once you're happy with your design, press and hold on the image to download it.
                Now you're ready to share your personalized profile picture.
              </p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  )
}
