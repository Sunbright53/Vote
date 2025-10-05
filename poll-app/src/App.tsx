// src/App.tsx
import { NavLink, Route, Routes } from 'react-router-dom';
import Vote from './pages/Vote';
import Results from './pages/Results';
import Qr from './pages/Qr';

export default function App() {
  return (
    <div>
      <nav className="mh-topnav">
        <NavLink
          to="/vote"
          className={({ isActive }) => `pixel-btn ${isActive ? 'active' : ''}`}
        >
          Vote
        </NavLink>
        <NavLink
          to="/results"
          className={({ isActive }) => `pixel-btn ${isActive ? 'active' : ''}`}
        >
          Results
        </NavLink>
        <NavLink
          to="/qr"
          className={({ isActive }) => `pixel-btn ${isActive ? 'active' : ''}`}
        >
          QR
        </NavLink>
      </nav>

      <Routes>
        <Route path="/" element={<Vote />} />
        <Route path="/vote" element={<Vote />} />
        <Route path="/results" element={<Results />} />
        <Route path="/qr" element={<Qr />} />
      </Routes>
    </div>
  );
}
