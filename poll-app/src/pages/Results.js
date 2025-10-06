import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { getResults, checkQrPass } from '../api';
/* ========== 1) Guard: ใส่รหัสก่อนเห็นผลโหวต (ต่อรอบงาน + มีอายุ) ========== */
const resultAuthKey = (batch) => `mh_results_auth_${batch}`;
function readAuth(batch) {
    try {
        const raw = localStorage.getItem(resultAuthKey(batch));
        if (!raw)
            return false;
        const obj = JSON.parse(raw);
        return obj?.ok === 1 && obj.exp > Date.now();
    }
    catch {
        return false;
    }
}
function writeAuth(batch, hours = 12) {
    const exp = Date.now() + hours * 60 * 60 * 1000;
    localStorage.setItem(resultAuthKey(batch), JSON.stringify({ ok: 1, exp }));
}
function ResultsGuard({ children }) {
    const [batch, setBatch] = useState('default');
    const [authed, setAuthed] = useState(false);
    const [pass, setPass] = useState('');
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);
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
            }
            catch {
                // ถ้าโหลด settings ไม่ได้ ให้ใช้ default ไปก่อน
                setAuthed(readAuth('default'));
            }
        })();
    }, []);
    const submit = async (e) => {
        e.preventDefault();
        setErr(null);
        if (!pass.trim()) {
            setErr('กรุณากรอกรหัส');
            return;
        }
        setLoading(true);
        try {
            const res = await checkQrPass(pass.trim()); // ตรวจกับ GAS/ชีต
            if (res.ok) {
                writeAuth(batch, 12); // ✅ ผูกกับ batch และหมดอายุใน 12 ชม.
                setAuthed(true);
            }
            else {
                setErr('รหัสไม่ถูกต้อง');
            }
        }
        catch {
            setErr('เครือข่ายมีปัญหา ลองใหม่อีกครั้ง');
        }
        finally {
            setLoading(false);
        }
    };
    if (authed)
        return _jsx(_Fragment, { children: children });
    return (_jsxs("div", { className: "mh-wrap", children: [_jsx("h1", { className: "mh-title", children: "\u0E43\u0E2A\u0E48\u0E23\u0E2B\u0E31\u0E2A\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E14\u0E39\u0E1C\u0E25\u0E42\u0E2B\u0E27\u0E15" }), _jsxs("form", { onSubmit: submit, style: { display: 'grid', gap: 12, maxWidth: 360 }, children: [_jsx("input", { type: "password", placeholder: "\u0E23\u0E2B\u0E31\u0E2A\u0E1C\u0E48\u0E32\u0E19 (QR pass)", value: pass, onChange: (e) => setPass(e.target.value), className: "input" }), _jsx("button", { className: "pixel-btn", disabled: loading, children: loading ? 'กำลังตรวจสอบ…' : 'เข้าสู่หน้าแสดงผล' }), err && _jsx("span", { className: "toast error", children: err })] }), _jsx("button", { className: "btn outline mt-3", onClick: () => { localStorage.removeItem(resultAuthKey(batch)); setAuthed(false); }, children: "\u0E25\u0E49\u0E32\u0E07\u0E2A\u0E34\u0E17\u0E18\u0E34\u0E4C\u0E23\u0E2D\u0E1A\u0E19\u0E35\u0E49" })] }));
}
