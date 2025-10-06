import { jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
export function Countdown({ seconds, onHitZero }) {
    const [left, setLeft] = useState(seconds);
    const ref = useRef(null);
    useEffect(() => {
        setLeft(seconds);
        if (ref.current)
            clearInterval(ref.current);
        ref.current = window.setInterval(() => {
            setLeft(prev => {
                if (prev <= 1) {
                    onHitZero();
                    return seconds; // reset เพื่อวนรอบใหม่
                }
                return prev - 1;
            });
            return undefined;
        }, 1000);
        return () => { if (ref.current)
            clearInterval(ref.current); };
    }, [seconds, onHitZero]);
    return _jsxs("span", { className: "badge", children: ["\u0E19\u0E31\u0E1A\u0E16\u0E2D\u0E22\u0E2B\u0E25\u0E31\u0E07: ", left, "s"] });
}
