import { useEffect, useMemo, useState } from 'react';
import { getRoster, submitVote } from '../api';
import type { RosterItem } from '../types';
import { Card } from '../components/Card';
import { useNavigate } from 'react-router-dom';

export default function Vote() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [roster, setRoster] = useState<RosterItem[]>([]);
  const [min, setMin] = useState(2);
  const [max, setMax] = useState(2);
  const [picked, setPicked] = useState<Record<string, boolean>>({});
  const [msg, setMsg] = useState<{ type: 'info' | 'error' | 'success'; text: string } | null>(null);

  const nav = useNavigate();

  /** โหลด roster + settings */
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { settings, roster } = await getRoster();
        setRoster(Array.isArray(roster) ? roster : []);
        if (typeof settings?.min_picks === 'number') setMin(settings.min_picks);
        if (typeof settings?.max_picks === 'number') setMax(settings.max_picks);
      } catch {
        setMsg({ type: 'error', text: 'โหลดรายชื่อไม่สำเร็จ' });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /** auto-hide toast */
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 2500);
    return () => clearTimeout(t);
  }, [msg]);

  /** จัดกลุ่มและเรียงชื่อ */
const byGroup = useMemo(() => {
  const m: Record<string, RosterItem[]> = {};

  roster.forEach((r) => {
    const g = r.group?.trim() || 'อื่น ๆ'; // ถ้า group ว่าง ให้ใส่ชื่อกลุ่ม "อื่น ๆ"
    (m[g] ||= []).push(r);
  });

  // เรียงชื่อในแต่ละกลุ่มเป็นลำดับอักษรไทย
  Object.values(m).forEach((arr) =>
    arr.sort((a, b) =>
      (a.name || '').localeCompare(b.name || '', 'th-TH', { sensitivity: 'base' })
    )
  );

  return m;
}, [roster]);


  const totalPicked = useMemo(() => Object.values(picked).filter(Boolean).length, [picked]);
  const groupKeys = useMemo(() => Object.keys(byGroup).sort((a, b) => a.localeCompare(b, 'th')), [byGroup]);
  const empty = groupKeys.length === 0;

  /** toggle เลือก/ยกเลิก โดยไม่ให้เกิน max */
  const toggle = (id: string) => {
  setPicked(prev => {
    const next = { ...prev };
    const on = !!prev[id];
    if (on) {
      delete next[id];
    } else {
      const count = Object.values(prev).filter(Boolean).length;
      if (count >= max) return prev; // กันเกิน
      next[id] = true;
    }
    return next;
  });
};


  /** ส่งโหวต (ไม่ใช้ token) — ใช้ form POST เพื่อตัด preflight */
  const onSubmit = async () => {
    if (submitting) return;

    const picks = Object.keys(picked).filter((k) => picked[k]);

    // บังคับให้เลือกพอดีตาม settings (รองรับกรณี min==max)
    const needText = min === max ? `${min}` : `${min}–${max}`;
    if (picks.length < min || picks.length > max) {
      setMsg({ type: 'error', text: `ต้องเลือกให้พอดี ${needText} คน (ตอนนี้ ${picks.length})` });
      return;
    }

    try {
      setSubmitting(true);
      const res = await submitVote(picks); // ← ไม่ส่ง token แล้ว
      if (res?.ok) {
        // กันเคาะรัว & ประสบการณ์เรียบลื่น
        setMsg({ type: 'success', text: 'บันทึกแล้ว ขอบคุณ!' });
        setPicked({});
        setTimeout(() => nav('/done', { replace: true }), 600);
      } else {
        setMsg({ type: 'error', text: String(res?.error || 'บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง') });
      }
    } catch {
      setMsg({ type: 'error', text: 'เครือข่ายมีปัญหา ลองใหม่อีกครั้ง' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  const submitDisabled = submitting || totalPicked < min || totalPicked > max;

  return (
    <div className="mh-wrap">
      <h1 className="mh-title">POPULAR VOTE</h1>
      <h2 className="mh-subtitle">โหวตยอดนิยม</h2>
      <h3 className="mh-instruction">
        (กรุณาเลือก {min === max ? `${min}` : `${min}–${max}`} คน ที่คุณชื่นชอบ)
      </h3>

      {empty ? (
        <Card><p className="badge">ยังไม่มีรายชื่อสำหรับโหวต</p></Card>
      ) : (
        groupKeys.map((g) => (
          <div className="group-card" key={g}>
            {g.trim() ? <div className="group-title">กลุ่ม {g}</div> : null}

            <div className="grid">
              {byGroup[g].map((p) => {
                const checked = !!picked[p.id];
                const disabled = !checked && totalPicked >= max;
                return (
                  <label
                    key={p.id}
                    className={`vote-option ${checked ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
                    onClick={() => !disabled && toggle(p.id)}
                  >
                    <img
                      src={
                        p.photo
                          ? `/avatars/${p.photo}`
                          : `/avatars/${p.id}.png`
                      }
                      alt={p.name}
                      className="avatar"
                      onError={(e) => ((e.target as HTMLImageElement).src = '/avatars/default.png')}
                    />
                    <div className="vote-text">
                      <div className="vote-name">{p.name}</div>
                      <div className="vote-id">{p.id}</div>
                    </div>
                    <div className="vote-check">{checked ? '✓' : ''}</div>
                  </label>
                );
              })}
            </div>
          </div>
        ))
      )}

      <div className="action-bar">
+ <button className="pixel-btn vote-btn" onClick={onSubmit} disabled={submitDisabled}>
          {submitting ? 'กำลังบันทึก…' : 'โหวต'}
        </button>

        <span className="badge">เลือกแล้ว {totalPicked}/{max}</span>
        <span className="badge">
          {totalPicked < min
            ? `ต้องเลือกเพิ่มอีก ${min - totalPicked}`
            : totalPicked > max
            ? `เกินมา ${totalPicked - max}`
            : 'ครบพอดี ✅'}
        </span>

        {msg && <span className={`toast ${msg.type}`}>{msg.text}</span>}
      </div>
    </div>
  );
}
