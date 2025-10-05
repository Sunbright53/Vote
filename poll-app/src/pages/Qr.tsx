// src/pages/Qr.tsx
import { useEffect, useMemo, useState } from 'react';
import { Card } from '../components/Card';
import { checkQrPass } from '../api';

const QR_API = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=';
const PASS_KEY = 'mh-qr-ok'; // ถ้าอยากให้ใส่รหัสทุกครั้ง ให้เลิกใช้ localStorage ตัวนี้

// === สร้างรหัส QR ไม่ซ้ำ ===
const makeCodes = (batch: string, count: number, start: number) => {
  const prefix = (batch || 'MH25').toUpperCase().replace(/\s+/g, '');
  const time = Math.floor(Date.now() / 1000).toString(36).toUpperCase(); // สแตมป์สั้น ๆ
  return Array.from({ length: Math.max(1, count) }, (_, i) => {
    const seq = String(start + i).padStart(3, '0');                       // 001, 002, ...
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();    // 4 ตัวอักษรสุ่ม
    return `${prefix}-${time}-${seq}-${rand}`;
  });
};

export default function Qr() {
  // --- gate ด้วยรหัสจากชีท ---
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState('');
  const [checking, setChecking] = useState(false);
  const [err, setErr] = useState('');

  // --- พารามิเตอร์สร้าง QR ---
  const [count, setCount] = useState(24);
  const [path, setPath] = useState('/vote');
  const [batch, setBatch] = useState('MH25');  // ชื่อรอบ/แบตช์
  const [start, setStart] = useState(1);       // เริ่มเลขลำดับจากกี่

  // เคยผ่านรหัสไว้ในเครื่องนี้ให้เข้าได้เลย
  useEffect(() => {
    if (localStorage.getItem(PASS_KEY) === '1') setAuthed(true);
  }, []);

  const onCheck = async () => {
    if (!pass.trim()) { setErr('กรุณากรอกรหัส'); return; }
    try {
      setChecking(true);
      setErr('');
      const res = await checkQrPass(pass.trim());
      if (res?.ok) {
        localStorage.setItem(PASS_KEY, '1'); // ลบถ้าอยากบังคับใส่รหัสทุกครั้ง
        setAuthed(true);
      } else {
        setErr('รหัสไม่ถูกต้อง');
      }
    } catch {
      setErr('เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ');
    } finally {
      setChecking(false);
    }
  };

  // ลิงก์ฐานปลายทาง (เช่น https://yourdomain.com/vote)
  const targetBase = useMemo(() => {
    const u = new URL(window.location.origin);
    u.pathname = path.startsWith('/') ? path : `/${path}`;
    u.search = ''; u.hash = '';
    return u;
  }, [path]);

  // สร้างโค้ดไม่ซ้ำทุกครั้งที่ batch/count/start เปลี่ยน
  const codes = useMemo(() => makeCodes(batch, count, start), [batch, count, start]);

  // --- หน้าล็อกด้วยรหัส ---
  if (!authed) {
    return (
      <div className="mh-wrap" style={{display:'grid',placeItems:'center',minHeight:'60vh'}}>
        <Card>
          <div style={{padding:24, width:320}}>
            <h2 style={{marginTop:0, textAlign:'center'}}>QR Access</h2>
            <label style={{display:'block', marginBottom:8}}>กรอกรหัสจากชีท</label>
            <input
              type="password"
              value={pass}
              onChange={(e)=>setPass(e.target.value)}
              placeholder="••••••••"
              style={{width:'100%', padding:'10px 12px', borderRadius:10, border:'1px solid #2c3448', background:'#0f1422', color:'#fff', marginBottom:10}}
            />
            {err && <div className="badge" style={{background:'#3b0b0b', color:'#f2b8b8', marginBottom:10}}>{err}</div>}
            <button className="pixel-btn" onClick={onCheck} disabled={checking} style={{width:'100%'}}>
              {checking ? 'กำลังตรวจสอบ…' : 'ยืนยันรหัส'}
            </button>
          </div>
        </Card>
      </div>
    );
  }

  // --- หน้าสร้าง QR ---
  return (
    <div style={{ padding: 24 }}>
      <h2>สร้างชุด QR สำหรับหน้าโหวต/ผลโหวต</h2>

      <Card>
        <div style={{ display:'flex', gap:12, alignItems:'center', flexWrap:'wrap' }}>
          <label>ปลายทาง:
            <input value={path} onChange={e=>setPath(e.target.value||'/vote')}
                   style={{ width: 200, marginLeft: 6 }} placeholder="/vote" />
          </label>
          <label>จำนวนต่อชุด:
            <input type="number" min={1} value={count}
                   onChange={e=>setCount(Math.max(1, Number(e.target.value)||1))}
                   style={{ width: 100, marginLeft: 6 }}/>
          </label>
          <label>Batch:
            <input value={batch} onChange={e=>setBatch(e.target.value)}
                   style={{ width: 120, marginLeft: 6 }} placeholder="MH25"/>
          </label>
          <label>เริ่มลำดับ:
            <input type="number" min={1} value={start}
                   onChange={e=>setStart(Math.max(1, Number(e.target.value)||1))}
                   style={{ width: 100, marginLeft: 6 }}/>
          </label>
          <span className="badge">ลิงก์ตัวอย่าง: {
            (() => { const u = new URL(targetBase); u.searchParams.set('qr', codes[0]); return u.toString(); })()
          }</span>
        </div>
      </Card>

      <div
        style={{
          display:'grid',
          gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',
          gap:12,
          marginTop:16,
        }}
      >
        {codes.map((code) => {
          const u = new URL(targetBase);
          u.searchParams.set('qr', code); // ← ทำให้แต่ละใบไม่เหมือนกัน
          return (
            <Card key={code}>
              <div style={{ textAlign:'center', padding:8 }}>
                <img
                  src={`${QR_API}${encodeURIComponent(u.toString())}`}
                  style={{ width:150, height:150, objectFit:'contain' }}
                  alt={`QR ${code}`}
                />
                <div style={{ marginTop:6, fontSize:12, wordBreak:'break-all' }}>
                  {code}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
