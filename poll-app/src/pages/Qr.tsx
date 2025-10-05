// src/pages/Qr.tsx
import { useMemo, useState } from 'react';
import { Card } from '../components/Card';

const QR_API = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=';

export default function Qr() {
  const [count, setCount] = useState(24); // จำนวน QR ที่อยากพิมพ์ (แผ่นหนึ่งหลายอัน)
  const [path, setPath] = useState('/vote'); // ปลายทาง (ค่าเริ่มต้นคือหน้าโหวต)

  // ลิงก์ปลายทางเต็ม ๆ (เช่น https://yourdomain.com/vote)
  const targetUrl = useMemo(() => {
    // ถ้าโปรเจกต์ใช้ query router ให้ปรับเป็น ?p=vote แทน
    // const u = new URL(window.location.origin);
    // u.searchParams.set('p', 'vote');
    // return u.toString();

    const u = new URL(window.location.origin);
    u.pathname = path.startsWith('/') ? path : `/${path}`;
    u.search = '';
    u.hash = '';
    return u.toString();
  }, [path]);

  // แค่สร้างอาร์เรย์ตามจำนวนเพื่อวนแสดง QR เดียวกันหลายใบ
  const copies = useMemo(() => Array.from({ length: Math.max(1, count) }, (_, i) => i), [count]);

  return (
    <div style={{ padding: 24 }}>
      <h2>สร้างชุด QR สำหรับหน้าโหวต/ผลโหวต</h2>

      <Card>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <label>
            ปลายทาง:{" "}
            <input
              value={path}
              onChange={(e) => setPath(e.target.value || '/vote')}
              style={{ width: 200, marginLeft: 6 }}
              placeholder="/vote"
            />
          </label>

          <label>
            จำนวนต่อชุด:{" "}
            <input
              type="number"
              min={1}
              value={count}
              onChange={(e) => setCount(Math.max(1, Number(e.target.value) || 1))}
              style={{ width: 100, marginLeft: 6 }}
            />
          </label>

          <span className="badge">ลิงก์: {targetUrl}</span>
        </div>
      </Card>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))',
          gap: 12,
          marginTop: 16,
        }}
      >
        {copies.map((i) => (
          <Card key={i}>
            <div style={{ textAlign: 'center', padding: 8 }}>
              <img
                src={`${QR_API}${encodeURIComponent(targetUrl)}`}
                style={{ width: 150, height: 150, objectFit: 'contain' }}
                alt="QR code"
              />
              <div style={{ marginTop: 6, fontSize: 12, wordBreak: 'break-all' }}>
                {targetUrl}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
