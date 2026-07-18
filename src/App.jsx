import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import CountryPage from './pages/CountryPage.jsx'
import DonePage from './pages/DonePage.jsx'
import NotFound from './pages/NotFound.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/done" element={<DonePage />} />
      <Route path="/:country" element={<CountryPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
