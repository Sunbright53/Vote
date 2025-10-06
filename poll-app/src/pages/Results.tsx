import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { getResults, checkQrPass } from '../api';
import type { RosterItem } from '../types';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Card } from '../components/Card';
import { Countdown } from '../components/Countdown';
import { paletteFor } from '../utils/colors';



/* ========== 1) Guard: ใส่รหัสก่อนเห็นผลโหวต (ต่อรอบงาน + มีอายุ) ========== */
const resultAuthKey = (batch: string) => `mh_results_auth_${batch}`;
type AuthCache = { ok: 1; exp: number }; // exp = epoch ms

function readAuth(batch: string): boolean {
  try {
    const raw = localStorage.getItem(resultAuthKey(batch));
    if (!raw) return false;
    const obj = JSON.parse(raw) as AuthCache;
    return obj?.ok === 1 && obj.exp > Date.now();
  } catch {
    return false;
  }
}

function writeAuth(batch: string, hours = 12) {
  const exp = Date.now() + hours * 60 * 60 * 1000;
  localStorage.setItem(resultAuthKey(batch), JSON.stringify({ ok: 1, exp }));
}

function ResultsGuard({ children }: { children: React.ReactNode }) {
  const [batch, setBatch] = useState<string>('default');
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // โหลด batch จาก settings ครั้งเดียว แล้วเช็คสิทธิ์ตาม batch
  useEffect(() => {
    (async () => {
      const u = new URL(window.location.href);

      // ดึง settings เพื่อทราบ current_batch
      try {
        const { settings } = await getResults();
        const b = String(settings?.current_batch || 'default').trim() || 'default';
        setBatch(b);

        // ?logout=1 เพื่อล้างเฉพาะคีย์ของรอบนี้
        if (u.searchParams.get('logout') === '1') {
          localStorage.removeItem(resultAuthKey(b));
          u.searchParams.delete('logout');
          window.history.replaceState(null, '', u.toString());
        }

        setAuthed(readAuth(b));
      } catch {
        // ถ้าโหลด settings ไม่ได้ ให้ใช้ default ไปก่อน
        setAuthed(readAuth('default'));
      }
    })();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!pass.trim()) { setErr('กรุณากรอกรหัส'); return; }
    setLoading(true);
    try {
      const res = await checkQrPass(pass.trim()); // ตรวจกับ GAS/ชีต
      if (res.ok) {
        writeAuth(batch, 12);           // ✅ ผูกกับ batch และหมดอายุใน 12 ชม.
        setAuthed(true);
      } else {
        setErr('รหัสไม่ถูกต้อง');
      }
    } catch {
      setErr('เครือข่ายมีปัญหา ลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  if (authed) return <>{children}</>;

  return (
    <div className="mh-wrap">
      <h1 className="mh-title">ใส่รหัสเพื่อดูผลโหวต</h1>
      <form onSubmit={submit} style={{ display: 'grid', gap: 12, maxWidth: 360 }}>
        <input
          type="password"
          placeholder="รหัสผ่าน (QR pass)"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          className="input"
        />
        <button className="pixel-btn" disabled={loading}>
          {loading ? 'กำลังตรวจสอบ…' : 'เข้าสู่หน้าแสดงผล'}
        </button>
        {err && <span className="toast error">{err}</span>}
      </form>

      {/* ปุ่มล้างสิทธิ์เฉพาะรอบนี้ (เผื่อดีบัก) */}
      <button
        className="btn outline mt-3"
        onClick={() => { localStorage.removeItem(resultAuthKey(batch)); setAuthed(false); }}
      >
        ล้างสิทธิ์รอบนี้
      </button>
    </div>
  );
}
