import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header>
      <Link to="/" className="logo">
        <img src="/ilmc.png" alt="logo" />
      </Link>
      <ul className={`navlist${open ? ' open' : ''}`}>
        <li>
          <a
            href="https://www.linkedin.com/in/mohammed-anes-sa%C3%A2di-364918196/"
            aria-label="Linkedin"
          >
            Contact
          </a>
        </li>
      </ul>

      <div
        className={`bx bx-menu${open ? ' bx-x' : ''}`}
        id="menu-icon"
        onClick={() => setOpen((o) => !o)}
      ></div>
    </header>
  )
}
