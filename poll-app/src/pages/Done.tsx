// src/pages/Done.tsx
import { Link, useLocation } from 'react-router-dom';

export default function Done() {
  const { search } = useLocation();
  const already = new URLSearchParams(search).has('already');

  return (
    <section
      className="relative min-h-screen text-white bg-cover bg-center"
      style={{ backgroundImage: "url('/Background.png')" }}
    >
      {/* overlay ให้ตัวอักษรชัด */}
      <div className="absolute inset-0 bg-black/50" />

      {/* ชั้นจัดกึ่งกลางทั้งแนวตั้ง-แนวนอน */}
      <div className="absolute inset-0 grid place-items-center px-6">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold mb-3">THANK YOU</h1>
          <p className="text-xl mb-2">ขอบคุณที่ร่วมโหวต</p>
          <p className="text-sm text-gray-300 mb-10">
            ระบบบันทึกคะแนนของคุณเรียบร้อยแล้ว
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link
              to="/results"
              className="px-6 py-2 rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 shadow-lg transition"
            >
              ดูผลล่าสุด
            </Link>

            {!already && (
              <Link
                to="/vote"
                className="px-6 py-2 rounded-lg font-semibold bg-gray-700 hover:bg-gray-800 shadow-lg transition"
              >
                กลับไปหน้าโหวต
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
