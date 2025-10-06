import { Link } from 'react-router-dom';

export default function Done() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
  <h1 className="text-5xl font-bold mb-2">THANK YOU</h1>
  <p className="text-lg mb-6">ขอบคุณที่ร่วมโหวต</p>
  <p className="text-sm mb-8 text-gray-300">
    ระบบบันทึกคะแนนของคุณเรียบร้อยแล้ว
  </p>

      {/* <div className="mh-actions" style={{ marginTop: 16, display: 'flex', gap: 12 }}>
        <Link className="btn primary" to="/results">ดูผลล่าสุด</Link>
        <Link className="btn ghost" to="/vote">กลับไปหน้าโหวต</Link>
      </div> */}
    </div>
  );
}
