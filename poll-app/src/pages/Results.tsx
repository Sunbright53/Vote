// src/pages/Results.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getResults, checkQrPass } from '../api';
import type { RosterItem } from '../types';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Card } from '../components/Card';
import { Countdown } from '../components/Countdown';
import { paletteFor } from '../utils/colors';

ChartJS.register(ArcElement, Tooltip, Legend);

/* ========== 1) Guard: ใส่รหัสก่อนเห็นผลโหวต ========== */
const RESULTS_AUTH_KEY = 'mh_results_auth';

function ResultsGuard({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    // อนุญาต /results?logout=1 เคลียร์สิทธิ์
    const u = new URL(window.location.href);
    if (u.searchParams.get('logout') === '1') {
      localStorage.removeItem(RESULTS_AUTH_KEY);
      u.searchParams.delete('logout');
      window.history.replaceState(null, '', u.toString());
    }
    setAuthed(localStorage.getItem(RESULTS_AUTH_KEY) === '1');
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!pass.trim()) { setErr('กรุณากรอกรหัส'); return; }
    setLoading(true);
    try {
      const res = await checkQrPass(pass.trim());
      if (res.ok) {
        localStorage.setItem(RESULTS_AUTH_KEY, '1');
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
    </div>
  );
}

/* ========== 2) เนื้อหา Results เดิม (ย้ายมาเป็น ResultsInner) ========== */
function ResultsInner() {
  // ใช้ localStorage + ดีฟอลต์ 120 วิ
  const [refreshSec, setRefreshSec] = useState<number>(() => {
    const saved = Number(localStorage.getItem('results-refresh-sec'));
    return Number.isFinite(saved) && saved > 0 ? saved : 120;
  });

  const [counts, setCounts] = useState<Record<string, number>>({});
  const [roster, setRoster] = useState<RosterItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem('results-refresh-sec', String(refreshSec));
  }, [refreshSec]);

  const rosterMap = useMemo(
    () => Object.fromEntries(roster.map((r) => [r.id, r.name])),
    [roster]
  );

  // อ่าน settings มาเติมค่าครั้งแรก ถ้า user ยังไม่เคยปรับ
  const initializedFromSettings = useRef(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { settings, counts, roster } = await getResults();
      setCounts(counts || {});
      setRoster(roster || []);

      if (!initializedFromSettings.current) {
        const saved = Number(localStorage.getItem('results-refresh-sec'));
        const hasSaved = Number.isFinite(saved) && saved > 0;
        const serverSec = Number(settings?.auto_refresh_sec);
        if (!hasSaved && Number.isFinite(serverSec) && serverSec > 0) {
          setRefreshSec(serverSec);
        }
        initializedFromSettings.current = true;
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  // เรียง id ตามคะแนนมาก→น้อย
  const ids = useMemo(
    () => Object.keys(counts).sort((a, b) => (counts[b] ?? 0) - (counts[a] ?? 0)),
    [counts]
  );

  const names = useMemo(() => ids.map((id) => rosterMap[id] ?? id), [ids, rosterMap]);
  const values = useMemo(() => ids.map((id) => counts[id] ?? 0), [ids, counts]);
  const colors = useMemo(() => paletteFor(names), [names]);

  const chartData = useMemo(
    () => ({
      labels: names,
      datasets: [{
        data: values,
        backgroundColor: colors.bg,
        hoverBackgroundColor: colors.hover,
        borderColor: colors.border,
        borderWidth: 2,
        offset: 2,
      }],
    }),
    [names, values, colors]
  );

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    cutout: '58%',
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx: any) => `${ctx.label}: ${ctx.raw}` } },
    },
  }), []);

  const totalVotes = useMemo(() => values.reduce((s, n) => s + n, 0), [values]);

  return (
    <div style={{ padding: 24 }}>
      <h2>ผลโหวต (อัปเดตอัตโนมัติ)</h2>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
        <label>
          รีเฟรชทุก (วินาที):{' '}
          <input
            type="number"
            min={3}
            value={refreshSec}
            onChange={(e) => setRefreshSec(Math.max(3, Number(e.target.value) || 10))}
            style={{ width: 80 }}
          />
        </label>

        <Countdown seconds={refreshSec} onHitZero={refresh} />

        <button className="btn outline" onClick={refresh}>รีเฟรชตอนนี้</button>
        <span className="badge">รวมโหวต: {totalVotes}</span>
      </div>

      <Card>
        {loading ? (
          <p>Loading chart…</p>
        ) : values.length === 0 ? (
          <p>ยังไม่มีคะแนน</p>
        ) : (
          <div
            className="results-wrap"
            style={{ display: 'flex', gap: 16, alignItems: 'stretch', flexWrap: 'wrap' }}
          >
            <div
              className="chart-panel"
              style={{ position: 'relative', flex: '1 1 420px', minWidth: 320, height: 'min(70vh, 640px)', minHeight: 360 }}
            >
              <Doughnut data={chartData} options={chartOptions} />
            </div>

            <aside
              className="legend-panel"
              style={{ flex: '0 0 320px', maxHeight: 'min(70vh, 640px)', overflowY: 'auto', padding: '8px 6px', borderLeft: '1px solid var(--border)' }}
            >
              <div className="legend-title" style={{ fontWeight: 800, margin: '2px 0 10px' }}>รายชื่อ</div>
              <ul className="color-legend" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 6 }}>
                {names.map((name, i) => (
                  <li
                    key={`${name}-${i}`}
                    className="legend-item"
                    style={{ display: 'grid', gridTemplateColumns: '18px 1fr auto', alignItems: 'center', gap: 8, padding: '6px 4px', borderRadius: 8, background: 'rgba(255,255,255,0.02)' }}
                  >
                    <span
                      className="swatch"
                      style={{ width: 14, height: 14, borderRadius: 4, background: colors.bg[i], border: `2px solid ${colors.border[i]}`, display: 'inline-block' }}
                    />
                    <span className="name" title={name} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {name}
                    </span>
                    <span className="val" style={{ fontVariantNumeric: 'tabular-nums' }}>{values[i]}</span>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        )}
      </Card>
    </div>
  );
}

/* ========== 3) Export: ครอบ Guard ========== */
export default function ResultsPage() {
  return (
    <ResultsGuard>
      <ResultsInner />
    </ResultsGuard>
  );
}
