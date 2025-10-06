import { Link, useLocation } from 'react-router-dom';
import '../styles.css';

export default function Done() {
  const { search } = useLocation();
  const already = new URLSearchParams(search).has('already');

  return (
    <div className="done-container">
      <div className="done-overlay"></div>
      <div className="done-content">
        <h1 className="text-5xl font-extrabold mb-3">THANK YOU</h1>
        <p className="text-xl mb-2">ขอบคุณที่ร่วมโหวต</p>
        <p className="text-sm text-gray-300 mb-10">
          ระบบบันทึกคะแนนของคุณเรียบร้อยแล้ว
        </p>
        
      </div>
    </div>
  );
}
