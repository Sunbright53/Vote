import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { getRoster, submitVote } from '../api';
import { Card } from '../components/Card';
import { useNavigate } from 'react-router-dom';
import { votedKey } from '../utils/lock';
export default function Vote() {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [roster, setRoster] = useState([]);
    const [min, setMin] = useState(2);
    const [max, setMax] = useState(2);
    const [picked, setPicked] = useState({});
    const [msg, setMsg] = useState(null);
    const [batch, setBatch] = useState('default'); // รอบงานปัจจุบัน
    const nav = useNavigate();
    /** โหลด roster + settings */
    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const { settings, roster } = await getRoster();
                setRoster(Array.isArray(roster) ? roster : []);
                if (typeof settings?.min_picks === 'number')
                    setMin(settings.min_picks);
                if (typeof settings?.max_picks === 'number')
                    setMax(settings.max_picks);
                const b = String(settings?.current_batch || 'default').trim() || 'default';
                setBatch(b);
                // 🔒 ถ้าเครื่องนี้โหวตไปแล้วสำหรับ batch นี้ → เด้งไป /done
                if (localStorage.getItem(votedKey(b))) {
                  nav('/done?already=1', { replace: true });
                  return;
                }
            }
            catch {
                setMsg({ type: 'error', text: 'โหลดรายชื่อไม่สำเร็จ' });
            }
            finally {
                setLoading(false);
            }
        })();
    }, [nav]);
    /** auto-hide toast */
    useEffect(() => {
        if (!msg)
            return;
        const t = setTimeout(() => setMsg(null), 2500);
        return () => clearTimeout(t);
    }, [msg]);
    /** จัดกลุ่มและเรียงชื่อ (ไทย) */
    const byGroup = useMemo(() => {
        const m = {};
        roster.forEach((r) => {
            const g = r.group?.trim() || 'อื่น ๆ';
            (m[g] || (m[g] = [])).push(r);
        });
        Object.values(m).forEach((arr) => arr.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'th-TH', { sensitivity: 'base' })));
        return m;
    }, [roster]);
    const totalPicked = useMemo(() => Object.values(picked).filter(Boolean).length, [picked]);
    const groupKeys = useMemo(() => Object.keys(byGroup).sort((a, b) => a.localeCompare(b, 'th-TH', { sensitivity: 'base' })), [byGroup]);
    const empty = groupKeys.length === 0;
    /** toggle เลือก/ยกเลิก โดยไม่ให้เกิน max */
    const toggle = (id) => {
        setPicked((prev) => {
            const next = { ...prev };
            const on = !!prev[id];
            if (on) {
                delete next[id];
            }
            else {
                const count = Object.values(prev).filter(Boolean).length;
                if (count >= max)
                    return prev; // กันเกิน
                next[id] = true;
            }
            return next;
        });
    };
    /** ส่งโหวต */
    const onSubmit = async () => {
        if (submitting)
            return;
        const picks = Object.keys(picked).filter((k) => picked[k]);
        const needText = min === max ? `${min}` : `${min}–${max}`;
        if (picks.length < min || picks.length > max) {
            setMsg({ type: 'error', text: `ต้องเลือกให้พอดี ${needText} คน (ตอนนี้ ${picks.length})` });
            return;
        }
        try {
            setSubmitting(true);
            const res = await submitVote(picks);
            if (res?.ok) {
                // 🔒 ตั้งล็อกเครื่องสำหรับรอบนี้ แล้วเด้งออกทันที (กันย้อนกลับ)
                localStorage.setItem(votedKey(batch), new Date().toISOString());
                nav('/done', { replace: true });
                return;
            }
            setMsg({ type: 'error', text: String(res?.error || 'บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง') });
        }
        catch {
            setMsg({ type: 'error', text: 'เครือข่ายมีปัญหา ลองใหม่อีกครั้ง' });
        }
        finally {
            setSubmitting(false);
        }
    };
    if (loading)
        return _jsx("p", { children: "Loading..." });
    const submitDisabled = submitting || totalPicked < min || totalPicked > max;
    return (_jsxs("div", { className: "mh-wrap", children: [_jsx("h1", { className: "mh-title", children: "POPULAR VOTE" }), _jsx("h2", { className: "mh-subtitle", children: "\u0E42\u0E2B\u0E27\u0E15\u0E22\u0E2D\u0E14\u0E19\u0E34\u0E22\u0E21" }), _jsxs("h3", { className: "mh-instruction", children: ["(\u0E01\u0E23\u0E38\u0E13\u0E32\u0E40\u0E25\u0E37\u0E2D\u0E01 ", min === max ? `${min}` : `${min}–${max}`, " \u0E04\u0E19 \u0E17\u0E35\u0E48\u0E04\u0E38\u0E13\u0E0A\u0E37\u0E48\u0E19\u0E0A\u0E2D\u0E1A)"] }), empty ? (_jsx(Card, { children: _jsx("p", { className: "badge", children: "\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E21\u0E35\u0E23\u0E32\u0E22\u0E0A\u0E37\u0E48\u0E2D\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E42\u0E2B\u0E27\u0E15" }) })) : (groupKeys.map((g) => (_jsxs("div", { className: "group-card", children: [g.trim() ? _jsxs("div", { className: "group-title", children: ["\u0E01\u0E25\u0E38\u0E48\u0E21 ", g] }) : null, _jsx("div", { className: "grid", children: byGroup[g].map((p) => {
                            const checked = !!picked[p.id];
                            const disabled = !checked && totalPicked >= max;
                            return (_jsxs("label", { className: `vote-option ${checked ? 'active' : ''} ${disabled ? 'disabled' : ''}`, onClick: () => !disabled && toggle(p.id), children: [_jsx("img", { src: p.photo ? `/avatars/${p.photo}` : `/avatars/${p.id}.png`, alt: p.name, className: "avatar", onError: (e) => (e.target.src = '/avatars/default.png') }), _jsxs("div", { className: "vote-text", children: [_jsx("div", { className: "vote-name", children: p.name }), _jsx("div", { className: "vote-id", children: p.id })] }), _jsx("div", { className: "vote-check", children: checked ? '✓' : '' })] }, p.id));
                        }) })] }, g)))), _jsxs("div", { className: "action-bar", children: [_jsx("button", { className: "pixel-btn vote-btn", onClick: onSubmit, disabled: submitDisabled, children: submitting ? 'กำลังบันทึก…' : 'โหวต' }), _jsxs("span", { className: "badge", children: ["\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E41\u0E25\u0E49\u0E27 ", totalPicked, "/", max] }), _jsx("span", { className: "badge", children: totalPicked < min
                            ? `ต้องเลือกเพิ่มอีก ${min - totalPicked}`
                            : totalPicked > max
                                ? `เกินมา ${totalPicked - max}`
                                : 'ครบพอดี ✅' }), msg && _jsx("span", { className: `toast ${msg.type}`, children: msg.text })] })] }));
}
