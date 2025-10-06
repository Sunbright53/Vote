// src/App.tsx
import { NavLink, Route, Routes } from 'react-router-dom';
import Vote from './pages/Vote';
import Results from './pages/Results';
import Qr from './pages/Qr';
import Done from './pages/Done'; // ← เพิ่ม
import RequireNotVoted from './pages/RequireNotVoted';
import HomeRedirect from './pages/HomeRedirect';



export default function App() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `pixel-btn ${isActive ? 'active' : ''}`;

  return (
    <div>
      <nav className="mh-topnav">
        <NavLink to="/vote" end className={linkClass}>
          Vote
        </NavLink>
        <NavLink to="/results" end className={linkClass}>
          Results
        </NavLink>

      </nav>

      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route
          path="/vote"
          element={
            <RequireNotVoted>
              <Vote />
            </RequireNotVoted>
          }
        />
        <Route path="/" element={<Vote />} />
        <Route path="/vote" element={<Vote />} />
        <Route path="/results" element={<Results />} />
        
        <Route path="/done" element={<Done />} /> {/* ← เพิ่ม */}
      </Routes>
    </div>
  );
}
