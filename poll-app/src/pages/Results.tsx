import { useCallback, useEffect, useMemo, useState } from 'react';
import { getResults } from '../api';
import type { RosterItem } from '../types';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Card } from '../components/Card';
import { Countdown } from '../components/Countdown';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Results() {
  const [auto, setAuto] = useState(10);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [roster, setRoster] = useState<RosterItem[]>([]);
  const [loading, setLoading] = useState(true);

  const rosterMap = useMemo(
    () => Object.fromEntries(roster.map(r => [r.id, r.name])),
    [roster]
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { settings, counts, roster } = await getResults();
      setCounts(counts || {});
      setRoster(roster || []);
      setAuto(settings.auto_refresh_sec || 10);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const labels = useMemo(
    () => Object.keys(counts).sort((a,b)=>counts[b]-counts[a]),
    [counts]
  );

  const data = useMemo(() => ({
    labels: labels.map(id => `${rosterMap[id] ?? id} (${id})`),
    datasets: [{ data: labels.map(id => counts[id]) }]
  }), [labels, counts, rosterMap]);

  return (
    <div style={{ padding: 24 }}>
      <h2>ผลโหวต (อัปเดตอัตโนมัติ)</h2>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
        <label>
          รีเฟรชทุก (วินาที):{' '}
          <input
            type="number"
            min={3}
            value={auto}
            onChange={e => setAuto(Math.max(3, Number(e.target.value) || 10))}
            style={{ width: 80 }}
          />
        </label>
        <Countdown seconds={auto} onHitZero={refresh} />
        <button className="btn outline" onClick={refresh}>รีเฟรชตอนนี้</button>
      </div>

      <Card>
        {loading ? <p>Loading chart…</p> : <Pie data={data} />}
      </Card>

      <Card>
        <h3>ตารางสรุป</h3>
        <table border={1} cellPadding={6} cellSpacing={0}>
          <thead>
            <tr><th>ชื่อ</th><th>ID</th><th>คะแนน</th></tr>
          </thead>
          <tbody>
            {labels.map(id => (
              <tr key={id}>
                <td>{rosterMap[id] ?? '-'}</td>
                <td>{id}</td>
                <td>{counts[id]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
