// 🔗 Google Apps Script Web App URL
// เช่น "https://script.google.com/macros/s/AKfycbxgvZpi4-.../exec"
// ต้องใส่ใน .env ไว้แบบนี้:
// VITE_BASE_URL="https://script.google.com/macros/s/AKfycbxgvZpi4-.../exec"
const BASE = import.meta.env.VITE_BASE_URL;
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
/** ส่งโหวต (แบบไม่มี token และไม่ตั้ง Content-Type เพื่อเลี่ยง CORS preflight) */
export async function submitVote(picks) {
    const [pick1, pick2] = picks;
    const form = new URLSearchParams();
    form.set('p', 'api_submit');
    form.set('pick1', pick1 || '');
    form.set('pick2', pick2 || '');
    const r = await fetch(BASE, { method: 'POST', body: form });
    if (!r.ok)
        throw new Error('failed submit');
    return r.json();
}
/** ✅ ตรวจสอบรหัส QR pass (ใช้กับหน้า /qr และล็อกหน้า /results ได้ด้วย) */
export async function checkQrPass(pass) {
    const form = new URLSearchParams();
    form.set('p', 'api_qr_check');
    form.set('pass', pass);
    const r = await fetch(BASE, { method: 'POST', body: form }); // form POST → ไม่โดน preflight
    if (!r.ok)
        throw new Error('failed qr pass check');
    return r.json();
}
