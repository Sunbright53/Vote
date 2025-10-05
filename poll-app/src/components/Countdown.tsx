import { useEffect, useRef, useState } from 'react';

export function Countdown({
  seconds,
  onHitZero
}: { seconds: number; onHitZero: () => void }) {
  const [left, setLeft] = useState(seconds);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    setLeft(seconds);
    if (ref.current) clearInterval(ref.current);
    ref.current = window.setInterval(() => {
      setLeft(prev => {
        if (prev <= 1) {
          onHitZero();
          return seconds; // reset เพื่อวนรอบใหม่
        }
        return prev - 1;
      });
      return undefined as never;
    }, 1000);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [seconds, onHitZero]);

  return <span className="badge">นับถอยหลัง: {left}s</span>;
}
