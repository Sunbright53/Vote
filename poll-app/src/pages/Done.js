import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useLocation } from 'react-router-dom';
export default function Done() {
    const { search } = useLocation();
    const already = new URLSearchParams(search).has('already');
    return (_jsxs("div", { className: "flex flex-col items-center justify-center min-h-screen text-center text-white bg-cover bg-center", style: { backgroundImage: "url('/Background.png')" }, children: [_jsx("h1", { className: "text-5xl font-extrabold mb-3", children: "THANK YOU" }), _jsx("p", { className: "text-xl mb-2", children: "\u0E02\u0E2D\u0E1A\u0E04\u0E38\u0E13\u0E17\u0E35\u0E48\u0E23\u0E48\u0E27\u0E21\u0E42\u0E2B\u0E27\u0E15" }), _jsx("p", { className: "text-sm text-gray-300 mb-10", children: "\u0E23\u0E30\u0E1A\u0E1A\u0E1A\u0E31\u0E19\u0E17\u0E36\u0E01\u0E04\u0E30\u0E41\u0E19\u0E19\u0E02\u0E2D\u0E07\u0E04\u0E38\u0E13\u0E40\u0E23\u0E35\u0E22\u0E1A\u0E23\u0E49\u0E2D\u0E22\u0E41\u0E25\u0E49\u0E27" })] }));
}
