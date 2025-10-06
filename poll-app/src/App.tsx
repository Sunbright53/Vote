// src/App.tsx
import { NavLink, Route, Routes } from 'react-router-dom';

// ✅ ใช้ alias @ (ต้องมีใน tsconfig + vite.config แล้ว)
import Vote from '@/pages/Vote';
import Results from '@/pages/Results';     // <- ต้องเป็น default export ในไฟล์ Results.tsx
import Qr from '@/pages/Qr';
import Done from '@/pages/Done';
import RequireNotVoted from '@/pages/RequireNotVoted';
import HomeRedirect from '@/pages/HomeRedirect';

export default function App() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `pixel-btn ${isActive ? 'active' : ''}`;

  return (
    <div>
      <nav className="mh-topnav">
        <NavLink to="/vote" end className={linkClass}>Vote</NavLink>
        <NavLink to="/results" end className={linkClass}>Results</NavLink>
        {/* <NavLink to="/qr" end className={linkClass}>QR</NavLink>  // ถ้าอยากให้มีปุ่ม QR */}
      </nav>

      <Routes>
        {/* หน้าแรก → เด้งไป /vote */}
        <Route path="/" element={<HomeRedirect />} />

        {/* โหวต: ต้องยังไม่เคยโหวต */}
        <Route
          path="/vote"
          element={
            <RequireNotVoted>
              <Vote />
            </RequireNotVoted>
          }
        />

        {/* ผลโหวต */}
        <Route path="/results" element={<Results />} />

        {/* หน้าขอบคุณ */}
        <Route path="/done" element={<Done />} />

        {/* (ถ้ามี) หน้า QR */}
        <Route path="/qr" element={<Qr />} />

        {/* fallback อะไรที่ไม่ตรง path ให้กลับบ้าน */}
        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </div>
  );
}
