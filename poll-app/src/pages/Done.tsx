import { Link } from 'react-router-dom';

export default function Done() {
  return (
    <div className="mh-wrap" role="status" aria-live="polite">
      <h1 className="mh-title">THANK YOU</h1>
      <h2 className="mh-subtitle">ขอบคุณที่ร่วมโหวต</h2>
      <p className="badge">ระบบบันทึกคะแนนของคุณเรียบร้อยแล้ว</p>

      {/* <div className="mh-actions" style={{ marginTop: 16, display: 'flex', gap: 12 }}>
        <Link className="btn primary" to="/results">ดูผลล่าสุด</Link>
        <Link className="btn ghost" to="/vote">กลับไปหน้าโหวต</Link>
      </div> */}
    </div>
  );
}
