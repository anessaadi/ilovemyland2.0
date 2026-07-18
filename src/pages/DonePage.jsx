import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import { countries } from '../data/countries.js'
import '../styles/done.css'

function mergeFrame(croppedImageSrc, frameSrc) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    const frameImage = new Image()
    const croppedImage = new Image()

    croppedImage.onload = () => {
      frameImage.onload = () => {
        canvas.width = frameImage.width
        canvas.height = frameImage.height

        ctx.drawImage(croppedImage, 0, 0, canvas.width, canvas.height)
        ctx.drawImage(frameImage, 0, 0, canvas.width, canvas.height)

        resolve(canvas.toDataURL())
      }
      frameImage.onerror = reject
      frameImage.src = frameSrc
    }
    croppedImage.onerror = reject
    croppedImage.src = croppedImageSrc
  })
}

export default function DonePage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const country = searchParams.get('country') || ''
  const info = countries.find((c) => c.slug === country)
  const displayName = info ? info.name : country

  const [frames, setFrames] = useState([null, null, null])
  const ranOnce = useRef(false)

  useEffect(() => {
    const croppedImage = localStorage.getItem('croppedImage')
    if (!croppedImage) return

    const suffixes = ['01', '02', '03']
    suffixes.forEach((suffix, i) => {
      mergeFrame(croppedImage, `/${country}${suffix}.png`)
        .then((dataUrl) => {
          setFrames((prev) => {
            const next = [...prev]
            next[i] = dataUrl
            return next
          })
        })
        .catch(() => {})
    })
  }, [country])

  const handleDownload = (src, index) => {
    if (!src) return
    const link = document.createElement('a')
    link.download = `${country || 'frame'}-${index + 1}.png`
    link.href = src
    link.click()
  }

  const startOver = () => {
    localStorage.removeItem('croppedImage')
    navigate(country ? `/${country}` : '/')
  }

  const noImage = !localStorage.getItem('croppedImage')

  return (
    <>
      <Header />
      <section className="main-section">
        <div className="container2">
          <h1 className="h1 h1done">Congrats, your pics are ready!</h1>
          <p className="p p1done">Download the image, then use it as your new profile picture.</p>

          {noImage ? (
            <p className="p">
              We couldn't find a photo to frame. Please go back and upload one first.
            </p>
          ) : (
            <div className="product-grid2">
              {frames.map((src, i) => (
                <div className="product-item2" key={i}>
                  <div className="preview">
                    {src ? (
                      <img id={`frame${i + 1}`} src={src} alt={`${displayName} frame ${i + 1}`} />
                    ) : (
                      <div style={{ padding: '2em' }}>Loading…</div>
                    )}
                  </div>
                  <button
                    className="download-button"
                    onClick={() => handleDownload(src, i)}
                    disabled={!src}
                  >
                    Download&nbsp;&nbsp;<i className="bx bx-download"></i>
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="upload-buttons">
            <button className="use-button" onClick={startOver}>
              Start Over <i className="bx bx-revision"></i>
            </button>
          </div>

          <div className="invite-container">
            <p className="invite-text">Invite your friends</p>
            <div className="icon-container">
              <a href="https://www.facebook.com/sharer/sharer.php?u=https://ilovemycountry.com" target="_blank" rel="noreferrer">
                <i className="bx bxl-facebook-circle"></i>
              </a>
              <a href="https://wa.me/?text=Check out this website: https://ilovemycountry.com" target="_blank" rel="noreferrer">
                <i className="bx bxl-whatsapp"></i>
              </a>
              <a href="https://t.me/share/url?url=https://ilovemycountry.com&text=Check out this website!" target="_blank" rel="noreferrer">
                <i className="bx bxl-telegram"></i>
              </a>
              <a href="https://twitter.com/intent/tweet?url=https://ilovemycountry.com&text=Check out this website!" target="_blank" rel="noreferrer">
                <i className="bx bxl-twitter"></i>
              </a>
              <a href="https://www.linkedin.com/shareArticle?mini=true&url=https://ilovemycountry.com" target="_blank" rel="noreferrer">
                <i className="bx bxl-linkedin-square"></i>
              </a>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  )
}
