import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isVoted } from '@/utils/lock';

export default function HomeRedirect() {
  const nav = useNavigate();
  useEffect(() => {
    nav(isVoted() ? '/done' : '/vote', { replace: true });
  }, [nav]);
  return null;
}
