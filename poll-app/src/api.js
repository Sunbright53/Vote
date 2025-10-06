const BASE = import.meta.env.VITE_BASE_URL; // เช่น https://script.google.com/macros/s/AKfyc.../exec
/** โหลดรายชื่อจาก Google Sheet */
export async function getRoster() {
    const r = await fetch(`${BASE}?p=api_roster`, { cache: 'no-store' });
    if (!r.ok)
        throw new Error('failed roster');
    return r.json();
}
/** โหลดผลโหวต */
export async function getResults() {
    const r = await fetch(`${BASE}?p=api_results`, { cache: 'no-store' });
    if (!r.ok)
        throw new Error('failed results');
    return r.json();
}
/** ส่งโหวต (แบบไม่มี token และไม่ตั้ง Content-Type เพื่อหลีกเลี่ยง CORS preflight) */
export async function submitVote(picks) {
    const [pick1, pick2] = picks;
    const form = new URLSearchParams();
    form.set('p', 'api_submit');
    form.set('pick1', pick1 || '');
    form.set('pick2', pick2 || '');
    const r = await fetch(BASE, { method: 'POST', body: form }); // ไม่มี headers เพื่อตัด preflight
    if (!r.ok)
        throw new Error('failed submit');
    return r.json();
}
// src/api.ts
export async function checkQrPass(pass) {
    const form = new URLSearchParams();
    form.set('p', 'api_qr_check');
    form.set('pass', pass);
    const r = await fetch(BASE, { method: 'POST', body: form }); // form POST → ไม่โดน preflight
    if (!r.ok)
        throw new Error('failed qr pass check');
    return r.json(); // => { ok: boolean }
}
