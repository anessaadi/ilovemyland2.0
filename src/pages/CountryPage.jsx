import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import { countries } from '../data/countries.js'
import '../styles/done.css'

const MAX_DIMENSION = 540
const MIN_SCALE = 0.5
const MAX_SCALE = 3

export default function CountryPage() {
  const { country } = useParams()
  const navigate = useNavigate()

  const info = countries.find((c) => c.slug === country)
  const displayName = info ? info.name : country

  const [editing, setEditing] = useState(false)
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 })
  const [popupOpen, setPopupOpen] = useState(false)
  const [githubUsername, setGithubUsername] = useState('')
  const [githubPreview, setGithubPreview] = useState(null)
  const [loadingGithub, setLoadingGithub] = useState(false)

  const editorRef = useRef(null)
  const pictureRef = useRef(null)

  // transform state kept in a ref so wheel/mouse handlers stay fast,
  // but we also mirror to a small state trigger for the initial reset.
  const transform = useRef({ scale: 1, posX: 0, posY: 0 })

  useEffect(() => {
    // reset editor state whenever the country param changes
    setEditing(false)
    setImgSize({ width: 0, height: 0 })
    transform.current = { scale: 1, posX: 0, posY: 0 }
  }, [country])

  if (!info) {
    return (
      <>
        <Header />
        <section className="main-section">
          <div className="container">
            <h1 className="h1" style={{ marginTop: '8em' }}>
              Country not found
            </h1>
            <p className="p">We couldn't find a page for "{country}".</p>
          </div>
        </section>
        <Footer />
      </>
    )
  }

  const [pictureSrc, setPictureSrc] = useState('')

  const applyTransform = () => {
    const { scale, posX, posY } = transform.current
    if (pictureRef.current) {
      pictureRef.current.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`
    }
  }

  const loadImageFromSrc = (src, crossOrigin) => {
    const img = new Image()
    if (crossOrigin) img.crossOrigin = crossOrigin
    img.onload = () => {
      const scaleFactor = Math.min(MAX_DIMENSION / img.width, MAX_DIMENSION / img.height, 1)
      setImgSize({
        width: img.width * scaleFactor,
        height: img.height * scaleFactor,
      })
      transform.current = { scale: 1, posX: 0, posY: 0 }
      // picture src is set via state below, then transform applied after paint
      setPictureSrc(src)
      requestAnimationFrame(applyTransform)
      setEditing(true)
    }
    img.onerror = () => {
      alert('Failed to load that image. Please try another one.')
    }
    img.src = src
  }

  const handleUploadClick = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.style.display = 'none'
    document.body.appendChild(input)

    input.addEventListener('change', (e) => {
      const file = e.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = () => {
          loadImageFromSrc(reader.result, null)
        }
        reader.readAsDataURL(file)
      }
      document.body.removeChild(input)
    })

    input.click()
  }

  // ---- Zoom (wheel) ----
  const handleWheel = (e) => {
    e.preventDefault()
    const zoomSpeed = 0.1
    const { scale, posX, posY } = transform.current
    const newScale = scale + (e.deltaY > 0 ? -zoomSpeed : zoomSpeed)
    const clamped = Math.max(MIN_SCALE, Math.min(newScale, MAX_SCALE))
    const ratio = clamped / scale

    const rect = pictureRef.current.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    transform.current = {
      scale: clamped,
      posX: mouseX - (mouseX - posX) * ratio,
      posY: mouseY - (mouseY - posY) * ratio,
    }
    applyTransform()
  }

  // ---- Drag (mouse) ----
  const handleMouseDown = (e) => {
    const startX = e.clientX - transform.current.posX
    const startY = e.clientY - transform.current.posY
    pictureRef.current.style.cursor = 'grabbing'

    const onMouseMove = (moveEvent) => {
      transform.current.posX = moveEvent.clientX - startX
      transform.current.posY = moveEvent.clientY - startY
      applyTransform()
    }
    const onMouseUp = () => {
      pictureRef.current.style.cursor = 'grab'
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  // ---- Touch (pinch + drag) ----
  const touchState = useRef({ initialDistance: 0, initialScale: 1, lastX: 0, lastY: 0, dragging: false })

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      touchState.current.initialDistance = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      )
      touchState.current.initialScale = transform.current.scale
    } else if (e.touches.length === 1) {
      touchState.current.dragging = true
      touchState.current.lastX = e.touches[0].pageX
      touchState.current.lastY = e.touches[0].pageY
    }
  }

  const handleTouchMove = (e) => {
    if (e.touches.length === 2) {
      e.preventDefault()
      const newDistance = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      )
      const newScale = touchState.current.initialScale * (newDistance / touchState.current.initialDistance)
      transform.current.scale = Math.max(MIN_SCALE, Math.min(newScale, MAX_SCALE))
      applyTransform()
    } else if (e.touches.length === 1 && touchState.current.dragging) {
      e.preventDefault()
      const touchX = e.touches[0].pageX
      const touchY = e.touches[0].pageY
      transform.current.posX += touchX - touchState.current.lastX
      transform.current.posY += touchY - touchState.current.lastY
      touchState.current.lastX = touchX
      touchState.current.lastY = touchY
      applyTransform()
    }
  }

  const handleTouchEnd = () => {
    touchState.current.dragging = false
  }

  // ---- Crop ----
  const handleCrop = () => {
    const src = pictureRef.current?.src
    if (!src) {
      alert('Failed to crop the image. Please check the source or try again.')
      return
    }

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const editorRect = editorRef.current.getBoundingClientRect()
      const pictureRect = pictureRef.current.getBoundingClientRect()

      canvas.width = editorRect.width
      canvas.height = editorRect.height

      const scaleFactorX = img.naturalWidth / pictureRect.width
      const scaleFactorY = img.naturalHeight / pictureRect.height

      const offsetX = (editorRect.left - pictureRect.left) * scaleFactorX
      const offsetY = (editorRect.top - pictureRect.top) * scaleFactorY

      ctx.drawImage(
        img,
        offsetX,
        offsetY,
        editorRect.width * scaleFactorX,
        editorRect.height * scaleFactorY,
        0,
        0,
        canvas.width,
        canvas.height
      )

      try {
        const croppedImage = canvas.toDataURL()
        localStorage.setItem('croppedImage', croppedImage)
        navigate(`/done?country=${encodeURIComponent(country)}`)
      } catch (err) {
        alert('Could not process this image (it may be from an untrusted source). Please try uploading it instead.')
      }
    }
    img.src = src
  }

  const handleStartAgain = () => {
    setEditing(false)
    setPictureSrc('')
    setImgSize({ width: 0, height: 0 })
    transform.current = { scale: 1, posX: 0, posY: 0 }
  }

  // ---- GitHub picture popup ----
  const fetchGitHubPicture = () => {
    if (!githubUsername.trim()) {
      alert('Please enter a GitHub username.')
      return
    }
    setLoadingGithub(true)
    setGithubPreview(null)
    const src = `https://github.com/${encodeURIComponent(githubUsername.trim())}.png?size=400`
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      setLoadingGithub(false)
      setGithubPreview(src)
    }
    img.onerror = () => {
      setLoadingGithub(false)
      alert('Could not find a GitHub picture for that username.')
    }
    img.src = src
  }

  const startCropping = () => {
    if (githubPreview) {
      setPopupOpen(false)
      loadImageFromSrc(githubPreview, 'anonymous')
    }
  }

  const closePopup = () => {
    setPopupOpen(false)
    setGithubPreview(null)
    setGithubUsername('')
  }

  return (
    <>
      <Header />
      <section className="main-section">
        <img
          src={`/${country}001.png`}
          alt="Country flag decoration"
          className="img-group section-static"
          style={{ display: editing ? 'none' : undefined }}
        />
        <div className="container">
          {!editing && (
            <div className="section-static1">
              <h1 className="h1">Support {displayName} online!</h1>
              <p className="p">Show your love to {displayName} by changing your profile picture</p>
              <div className="upload-buttons">
                <button className="upload-button upload-button2" id="uploadBtn" onClick={handleUploadClick}>
                  <i className="bx bxs-image-alt"></i> Upload a picture
                </button>
                <button className="use-button" onClick={() => setPopupOpen(true)}>
                  Use <i className="bx bxl-github"></i> picture
                </button>

                {popupOpen && (
                  <div id="popup" className="popup-modal" style={{ display: 'flex' }}>
                    <div className="popup-content">
                      <span className="close-btn" onClick={closePopup}>
                        &times;
                      </span>
                      <h4>Enter GitHub Username</h4>
                      <input
                        type="text"
                        id="github-username"
                        placeholder="Enter GitHub Username"
                        value={githubUsername}
                        onChange={(e) => setGithubUsername(e.target.value)}
                      />
                      <button onClick={fetchGitHubPicture} disabled={loadingGithub}>
                        {loadingGithub ? 'Loading...' : 'Submit'}
                      </button>

                      {githubPreview && (
                        <img src={githubPreview} alt="GitHub avatar preview" className="profile-img" />
                      )}

                      {githubPreview && (
                        <button id="continue-cropping" onClick={startCropping}>
                          Continue Cropping
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <p className="privacy-notice">
                <i className="bx bxs-check-shield"></i>&nbsp;We do not store or save any of your photos
              </p>
            </div>
          )}

          <div className="section-edit" style={{ display: editing ? 'flex' : 'none' }}>
            <h1>Zoom in, zoom out, align</h1>
            <div id="editor" ref={editorRef} onWheel={handleWheel}>
              <img
                id="picture"
                alt="Your Picture"
                ref={pictureRef}
                src={pictureSrc}
                style={{ width: imgSize.width, height: imgSize.height }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              />
              <div id="frame" style={{ backgroundImage: "url('/frame0001.png')" }}></div>
            </div>
            <div className="upload-buttons">
              <button className="upload-button upload-button2" id="cropBtn" onClick={handleCrop}>
                Add frame
              </button>
              <button className="use-button" onClick={handleStartAgain}>
                Start again
              </button>
            </div>
          </div>

          <h2>How it works</h2>
          <div className="steps">
            <div className="step">
              <div className="circle">1</div>
              <h3>Upload Your Image</h3>
              <p>
                Begin by uploading the photo you want to use by clicking the upload button located
                at the top of the page.
              </p>
            </div>
            <div className="step">
              <div className="circle">2</div>
              <h3>Adjust and Crop</h3>
              <p>
                Use the editing tool to fit your image perfectly within the {displayName} frame.
                Easily crop and position the photo so it matches your desired look and message.
              </p>
            </div>
            <div className="step">
              <div className="circle">3</div>
              <h3>Save Your Profile Pic</h3>
              <p>
                Once you're happy with your design, press and hold on the image to download it.
                Now you're ready to share your personalized profile picture to show support for{' '}
                {displayName}.
              </p>
            </div>
          </div>

          <div className="keywords">
            <h2>Keywords</h2>
            <div className="tags">
              <a>{displayName} flag frame</a>
              <a>Profile picture with {displayName} flag</a>
              <a>Add {displayName} flag to photo</a>
              <a>{displayName} photo frame online</a>
              <a>Show support for {displayName}</a>
              <a>{displayName} profile picture generator</a>
              <a>{displayName} flag overlay</a>
              <a>{displayName} solidarity photo frame</a>
              <a>Custom {displayName} flag frame</a>
              <a>Upload photo add {displayName} frame</a>
              <a>Generate {displayName} flag photo</a>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  )
}
