import { Link, useLocation } from 'react-router-dom';

export default function Done() {
  const { search } = useLocation();
  const already = new URLSearchParams(search).has('already');

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen text-center text-white bg-cover bg-center"
      style={{ backgroundImage: "url('/Background.png')" }}
    >
      <h1 className="text-5xl font-extrabold mb-3">THANK YOU</h1>
      <p className="text-xl mb-2">ขอบคุณที่ร่วมโหวต</p>
      <p className="text-sm text-gray-300 mb-10">
        ระบบบันทึกคะแนนของคุณเรียบร้อยแล้ว
      </p>

      {/* <div className="flex gap-4">
        <Link
          to="/results"
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold shadow-lg transition"
        >
          ดูผลล่าสุด
        </Link>
        {!already && (
          <Link
            to="/vote"
            className="px-6 py-2 bg-gray-700 hover:bg-gray-800 rounded-lg font-semibold shadow-lg transition"
          >
            กลับไปหน้าโหวต
          </Link>
        )}
      </div> */}
    </div>
  );
}
