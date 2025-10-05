// src/pages/Results.tsx
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getResults } from '../api';
import type { RosterItem } from '../types';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Card } from '../components/Card';
import { Countdown } from '../components/Countdown';
import { paletteFor } from '../utils/colors'; // หรือ '@/utils/colors'

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Results() {
  // === ใช้ localStorage + ดีฟอลต์ 120 วิ
  const [refreshSec, setRefreshSec] = useState<number>(() => {
    const saved = Number(localStorage.getItem('results-refresh-sec'));
    return Number.isFinite(saved) && saved > 0 ? saved : 120;
  });

  const [counts, setCounts] = useState<Record<string, number>>({});
  const [roster, setRoster] = useState<RosterItem[]>([]);
  const [loading, setLoading] = useState(true);

  // บันทึกค่าเมื่อผู้ใช้เปลี่ยน
  useEffect(() => {
    localStorage.setItem('results-refresh-sec', String(refreshSec));
  }, [refreshSec]);

  const rosterMap = useMemo(
    () => Object.fromEntries(roster.map((r) => [r.id, r.name])),
    [roster]
  );

  // อ่านค่า settings มาใช้ "ครั้งแรก" เท่านั้น (ถ้า localStorage ยังไม่มี)
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

  useEffect(() => {
    refresh();
  }, [refresh]);

  // เรียง id ตามคะแนนมาก→น้อย
  const ids = useMemo(
    () => Object.keys(counts).sort((a, b) => (counts[b] ?? 0) - (counts[a] ?? 0)),
    [counts]
  );

  // ชื่อที่จะแสดงในกราฟ/legend (fallback เป็น id)
  const names = useMemo(() => ids.map((id) => rosterMap[id] ?? id), [ids, rosterMap]);

  // คะแนน
  const values = useMemo(() => ids.map((id) => counts[id] ?? 0), [ids, counts]);

  // พาเล็ตสีคงที่ตามลำดับชื่อ
  const colors = useMemo(() => paletteFor(names), [names]);

  // ข้อมูลกราฟ
  const chartData = useMemo(
    () => ({
      labels: names,
      datasets: [
        {
          data: values,
          backgroundColor: colors.bg,
          hoverBackgroundColor: colors.hover,
          borderColor: colors.border,
          borderWidth: 2,
          offset: 2,
        },
      ],
    }),
    [names, values, colors]
  );

  // ปิด legend ของ Chart.js (เราวาดเองด้านขวา) + container สูงแบบ responsive
  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      cutout: '58%',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx: any) => `${ctx.label}: ${ctx.raw}`,
          },
        },
      },
    }),
    []
  );

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

        {/* Countdown จะอ้างอิง refreshSec เสมอ และเรียก refresh เมื่อครบเวลา */}
        <Countdown seconds={refreshSec} onHitZero={refresh} />

        <button className="btn outline" onClick={refresh}>
          รีเฟรชตอนนี้
        </button>
        <span className="badge">รวมโหวต: {totalVotes}</span>
      </div>

      <Card>
        {loading ? (
          <p>Loading chart…</p>
        ) : values.length === 0 ? (
          <p>ยังไม่มีคะแนน</p>
        ) : (
          // ====== กราฟโดนัท + legend ด้านขวา ======
          <div
            className="results-wrap"
            style={{
              display: 'flex',
              gap: 16,
              alignItems: 'stretch',
              flexWrap: 'wrap',
            }}
          >
            {/* พาเนลกราฟ: สูง responsive */}
            <div
              className="chart-panel"
              style={{
                position: 'relative',
                flex: '1 1 420px',
                minWidth: 320,
                height: 'min(70vh, 640px)',
                minHeight: 360,
              }}
            >
              <Doughnut data={chartData} options={chartOptions} />
            </div>

            {/* พาเนลรายชื่อ/สี ด้านขวา (เลื่อนดูได้) */}
            <aside
              className="legend-panel"
              style={{
                flex: '0 0 320px',
                maxHeight: 'min(70vh, 640px)',
                overflowY: 'auto',
                padding: '8px 6px',
                borderLeft: '1px solid var(--border)',
              }}
            >
              <div className="legend-title" style={{ fontWeight: 800, margin: '2px 0 10px' }}>
                รายชื่อ
              </div>
              <ul
                className="color-legend"
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'grid',
                  gap: 6,
                }}
              >
                {names.map((name, i) => (
                  <li
                    key={`${name}-${i}`}
                    className="legend-item"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '18px 1fr auto',
                      alignItems: 'center',
                      gap: 8,
                      padding: '6px 4px',
                      borderRadius: 8,
                      background: 'rgba(255,255,255,0.02)',
                    }}
                  >
                    <span
                      className="swatch"
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: 4,
                        background: colors.bg[i],
                        border: `2px solid ${colors.border[i]}`,
                        display: 'inline-block',
                      }}
                    />
                    <span className="name" title={name} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {name}
                    </span>
                    <span className="val" style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {values[i]}
                    </span>
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
