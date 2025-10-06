import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isVoted } from '@/utils/lock';
export default function RequireNotVoted({ children }) {
    const nav = useNavigate();
    useEffect(() => {
        if (isVoted())
            nav('/done?already=1', { replace: true });
    }, [nav]);
    if (isVoted())
        return null; // กัน content กระพริบ
    return _jsx(_Fragment, { children: children });
}
