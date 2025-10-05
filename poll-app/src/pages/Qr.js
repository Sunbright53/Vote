import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/Qr.tsx
import { useEffect, useMemo, useState } from 'react';
import { Card } from '../components/Card';
import { checkQrPass } from '../api';
const QR_API = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=';
const PASS_KEY = 'mh-qr-ok'; // ถ้าอยากให้ใส่รหัสทุกครั้ง ให้เลิกใช้ localStorage ตัวนี้
// === สร้างรหัส QR ไม่ซ้ำ ===
const makeCodes = (batch, count, start) => {
    const prefix = (batch || 'MH25').toUpperCase().replace(/\s+/g, '');
    const time = Math.floor(Date.now() / 1000).toString(36).toUpperCase(); // สแตมป์สั้น ๆ
    return Array.from({ length: Math.max(1, count) }, (_, i) => {
        const seq = String(start + i).padStart(3, '0'); // 001, 002, ...
        const rand = Math.random().toString(36).slice(2, 6).toUpperCase(); // 4 ตัวอักษรสุ่ม
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
    const [batch, setBatch] = useState('MH25'); // ชื่อรอบ/แบตช์
    const [start, setStart] = useState(1); // เริ่มเลขลำดับจากกี่
    // เคยผ่านรหัสไว้ในเครื่องนี้ให้เข้าได้เลย
    useEffect(() => {
        if (localStorage.getItem(PASS_KEY) === '1')
            setAuthed(true);
    }, []);
    const onCheck = async () => {
        if (!pass.trim()) {
            setErr('กรุณากรอกรหัส');
            return;
        }
        try {
            setChecking(true);
            setErr('');
            const res = await checkQrPass(pass.trim());
            if (res?.ok) {
                localStorage.setItem(PASS_KEY, '1'); // ลบถ้าอยากบังคับใส่รหัสทุกครั้ง
                setAuthed(true);
            }
            else {
                setErr('รหัสไม่ถูกต้อง');
            }
        }
        catch {
            setErr('เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ');
        }
        finally {
            setChecking(false);
        }
    };
    // ลิงก์ฐานปลายทาง (เช่น https://yourdomain.com/vote)
    const targetBase = useMemo(() => {
        const u = new URL(window.location.origin);
        u.pathname = path.startsWith('/') ? path : `/${path}`;
        u.search = '';
        u.hash = '';
        return u;
    }, [path]);
    // สร้างโค้ดไม่ซ้ำทุกครั้งที่ batch/count/start เปลี่ยน
    const codes = useMemo(() => makeCodes(batch, count, start), [batch, count, start]);
    // --- หน้าล็อกด้วยรหัส ---
    if (!authed) {
        return (_jsx("div", { className: "mh-wrap", style: { display: 'grid', placeItems: 'center', minHeight: '60vh' }, children: _jsx(Card, { children: _jsxs("div", { style: { padding: 24, width: 320 }, children: [_jsx("h2", { style: { marginTop: 0, textAlign: 'center' }, children: "QR Access" }), _jsx("label", { style: { display: 'block', marginBottom: 8 }, children: "\u0E01\u0E23\u0E2D\u0E01\u0E23\u0E2B\u0E31\u0E2A\u0E08\u0E32\u0E01\u0E0A\u0E35\u0E17" }), _jsx("input", { type: "password", value: pass, onChange: (e) => setPass(e.target.value), placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", style: { width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #2c3448', background: '#0f1422', color: '#fff', marginBottom: 10 } }), err && _jsx("div", { className: "badge", style: { background: '#3b0b0b', color: '#f2b8b8', marginBottom: 10 }, children: err }), _jsx("button", { className: "pixel-btn", onClick: onCheck, disabled: checking, style: { width: '100%' }, children: checking ? 'กำลังตรวจสอบ…' : 'ยืนยันรหัส' })] }) }) }));
    }
    // --- หน้าสร้าง QR ---
    return (_jsxs("div", { style: { padding: 24 }, children: [_jsx("h2", { children: "\u0E2A\u0E23\u0E49\u0E32\u0E07\u0E0A\u0E38\u0E14 QR \u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E2B\u0E19\u0E49\u0E32\u0E42\u0E2B\u0E27\u0E15/\u0E1C\u0E25\u0E42\u0E2B\u0E27\u0E15" }), _jsx(Card, { children: _jsxs("div", { style: { display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }, children: [_jsxs("label", { children: ["\u0E1B\u0E25\u0E32\u0E22\u0E17\u0E32\u0E07:", _jsx("input", { value: path, onChange: e => setPath(e.target.value || '/vote'), style: { width: 200, marginLeft: 6 }, placeholder: "/vote" })] }), _jsxs("label", { children: ["\u0E08\u0E33\u0E19\u0E27\u0E19\u0E15\u0E48\u0E2D\u0E0A\u0E38\u0E14:", _jsx("input", { type: "number", min: 1, value: count, onChange: e => setCount(Math.max(1, Number(e.target.value) || 1)), style: { width: 100, marginLeft: 6 } })] }), _jsxs("label", { children: ["Batch:", _jsx("input", { value: batch, onChange: e => setBatch(e.target.value), style: { width: 120, marginLeft: 6 }, placeholder: "MH25" })] }), _jsxs("label", { children: ["\u0E40\u0E23\u0E34\u0E48\u0E21\u0E25\u0E33\u0E14\u0E31\u0E1A:", _jsx("input", { type: "number", min: 1, value: start, onChange: e => setStart(Math.max(1, Number(e.target.value) || 1)), style: { width: 100, marginLeft: 6 } })] }), _jsxs("span", { className: "badge", children: ["\u0E25\u0E34\u0E07\u0E01\u0E4C\u0E15\u0E31\u0E27\u0E2D\u0E22\u0E48\u0E32\u0E07: ", (() => { const u = new URL(targetBase); u.searchParams.set('qr', codes[0]); return u.toString(); })()] })] }) }), _jsx("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))',
                    gap: 12,
                    marginTop: 16,
                }, children: codes.map((code) => {
                    const u = new URL(targetBase);
                    u.searchParams.set('qr', code); // ← ทำให้แต่ละใบไม่เหมือนกัน
                    return (_jsx(Card, { children: _jsxs("div", { style: { textAlign: 'center', padding: 8 }, children: [_jsx("img", { src: `${QR_API}${encodeURIComponent(u.toString())}`, style: { width: 150, height: 150, objectFit: 'contain' }, alt: `QR ${code}` }), _jsx("div", { style: { marginTop: 6, fontSize: 12, wordBreak: 'break-all' }, children: code })] }) }, code));
                }) })] }));
}
