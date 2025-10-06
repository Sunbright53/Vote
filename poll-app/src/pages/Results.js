import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/pages/Results.tsx
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getResults, checkQrPass } from '../api';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Card } from '../components/Card';
import { Countdown } from '../components/Countdown';
import { paletteFor } from '../utils/colors';
ChartJS.register(ArcElement, Tooltip, Legend);
/* ========== 1) Guard: ใส่รหัสก่อนเห็นผลโหวต ========== */
const RESULTS_AUTH_KEY = 'mh_results_auth';
function ResultsGuard({ children }) {
    const [authed, setAuthed] = useState(false);
    const [pass, setPass] = useState('');
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(null);
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
    const submit = async (e) => {
        e.preventDefault();
        setErr(null);
        if (!pass.trim()) {
            setErr('กรุณากรอกรหัส');
            return;
        }
        setLoading(true);
        try {
            const res = await checkQrPass(pass.trim());
            if (res.ok) {
                localStorage.setItem(RESULTS_AUTH_KEY, '1');
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
    return (_jsxs("div", { className: "mh-wrap", children: [_jsx("h1", { className: "mh-title", children: "\u0E43\u0E2A\u0E48\u0E23\u0E2B\u0E31\u0E2A\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E14\u0E39\u0E1C\u0E25\u0E42\u0E2B\u0E27\u0E15" }), _jsxs("form", { onSubmit: submit, style: { display: 'grid', gap: 12, maxWidth: 360 }, children: [_jsx("input", { type: "password", placeholder: "\u0E23\u0E2B\u0E31\u0E2A\u0E1C\u0E48\u0E32\u0E19 (QR pass)", value: pass, onChange: (e) => setPass(e.target.value), className: "input" }), _jsx("button", { className: "pixel-btn", disabled: loading, children: loading ? 'กำลังตรวจสอบ…' : 'เข้าสู่หน้าแสดงผล' }), err && _jsx("span", { className: "toast error", children: err })] })] }));
}
/* ========== 2) เนื้อหา Results เดิม (ย้ายมาเป็น ResultsInner) ========== */
function ResultsInner() {
    // ใช้ localStorage + ดีฟอลต์ 120 วิ
    const [refreshSec, setRefreshSec] = useState(() => {
        const saved = Number(localStorage.getItem('results-refresh-sec'));
        return Number.isFinite(saved) && saved > 0 ? saved : 120;
    });
    const [counts, setCounts] = useState({});
    const [roster, setRoster] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        localStorage.setItem('results-refresh-sec', String(refreshSec));
    }, [refreshSec]);
    const rosterMap = useMemo(() => Object.fromEntries(roster.map((r) => [r.id, r.name])), [roster]);
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
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => { refresh(); }, [refresh]);
    // เรียง id ตามคะแนนมาก→น้อย
    const ids = useMemo(() => Object.keys(counts).sort((a, b) => (counts[b] ?? 0) - (counts[a] ?? 0)), [counts]);
    const names = useMemo(() => ids.map((id) => rosterMap[id] ?? id), [ids, rosterMap]);
    const values = useMemo(() => ids.map((id) => counts[id] ?? 0), [ids, counts]);
    const colors = useMemo(() => paletteFor(names), [names]);
    const chartData = useMemo(() => ({
        labels: names,
        datasets: [{
                data: values,
                backgroundColor: colors.bg,
                hoverBackgroundColor: colors.hover,
                borderColor: colors.border,
                borderWidth: 2,
                offset: 2,
            }],
    }), [names, values, colors]);
    const chartOptions = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        cutout: '58%',
        plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${ctx.raw}` } },
        },
    }), []);
    const totalVotes = useMemo(() => values.reduce((s, n) => s + n, 0), [values]);
    return (_jsxs("div", { style: { padding: 24 }, children: [_jsx("h2", { children: "\u0E1C\u0E25\u0E42\u0E2B\u0E27\u0E15 (\u0E2D\u0E31\u0E1B\u0E40\u0E14\u0E15\u0E2D\u0E31\u0E15\u0E42\u0E19\u0E21\u0E31\u0E15\u0E34)" }), _jsxs("div", { style: { display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }, children: [_jsxs("label", { children: ["\u0E23\u0E35\u0E40\u0E1F\u0E23\u0E0A\u0E17\u0E38\u0E01 (\u0E27\u0E34\u0E19\u0E32\u0E17\u0E35):", ' ', _jsx("input", { type: "number", min: 3, value: refreshSec, onChange: (e) => setRefreshSec(Math.max(3, Number(e.target.value) || 10)), style: { width: 80 } })] }), _jsx(Countdown, { seconds: refreshSec, onHitZero: refresh }), _jsx("button", { className: "btn outline", onClick: refresh, children: "\u0E23\u0E35\u0E40\u0E1F\u0E23\u0E0A\u0E15\u0E2D\u0E19\u0E19\u0E35\u0E49" }), _jsxs("span", { className: "badge", children: ["\u0E23\u0E27\u0E21\u0E42\u0E2B\u0E27\u0E15: ", totalVotes] })] }), _jsx(Card, { children: loading ? (_jsx("p", { children: "Loading chart\u2026" })) : values.length === 0 ? (_jsx("p", { children: "\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E21\u0E35\u0E04\u0E30\u0E41\u0E19\u0E19" })) : (_jsxs("div", { className: "results-wrap", style: { display: 'flex', gap: 16, alignItems: 'stretch', flexWrap: 'wrap' }, children: [_jsx("div", { className: "chart-panel", style: { position: 'relative', flex: '1 1 420px', minWidth: 320, height: 'min(70vh, 640px)', minHeight: 360 }, children: _jsx(Doughnut, { data: chartData, options: chartOptions }) }), _jsxs("aside", { className: "legend-panel", style: { flex: '0 0 320px', maxHeight: 'min(70vh, 640px)', overflowY: 'auto', padding: '8px 6px', borderLeft: '1px solid var(--border)' }, children: [_jsx("div", { className: "legend-title", style: { fontWeight: 800, margin: '2px 0 10px' }, children: "\u0E23\u0E32\u0E22\u0E0A\u0E37\u0E48\u0E2D" }), _jsx("ul", { className: "color-legend", style: { listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 6 }, children: names.map((name, i) => (_jsxs("li", { className: "legend-item", style: { display: 'grid', gridTemplateColumns: '18px 1fr auto', alignItems: 'center', gap: 8, padding: '6px 4px', borderRadius: 8, background: 'rgba(255,255,255,0.02)' }, children: [_jsx("span", { className: "swatch", style: { width: 14, height: 14, borderRadius: 4, background: colors.bg[i], border: `2px solid ${colors.border[i]}`, display: 'inline-block' } }), _jsx("span", { className: "name", title: name, style: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, children: name }), _jsx("span", { className: "val", style: { fontVariantNumeric: 'tabular-nums' }, children: values[i] })] }, `${name}-${i}`))) })] })] })) })] }));
}
/* ========== 3) Export: ครอบ Guard ========== */
export default function ResultsPage() {
    return (_jsx(ResultsGuard, { children: _jsx(ResultsInner, {}) }));
}
