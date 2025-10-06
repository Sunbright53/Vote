import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/App.tsx
import { NavLink, Route, Routes } from 'react-router-dom';
import Vote from './pages/Vote';
import Results from './pages/Results';
import Done from './pages/Done'; // ← เพิ่ม
import RequireNotVoted from './pages/RequireNotVoted';
import HomeRedirect from './pages/HomeRedirect';
export default function App() {
    const linkClass = ({ isActive }) => `pixel-btn ${isActive ? 'active' : ''}`;
    return (_jsxs("div", { children: [_jsxs("nav", { className: "mh-topnav", children: [_jsx(NavLink, { to: "/vote", end: true, className: linkClass, children: "Vote" }), _jsx(NavLink, { to: "/results", end: true, className: linkClass, children: "Results" })] }), _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(HomeRedirect, {}) }), _jsx(Route, { path: "/vote", element: _jsx(RequireNotVoted, { children: _jsx(Vote, {}) }) }), _jsx(Route, { path: "/", element: _jsx(Vote, {}) }), _jsx(Route, { path: "/vote", element: _jsx(Vote, {}) }), _jsx(Route, { path: "/results", element: _jsx(Results, {}) }), _jsx(Route, { path: "/done", element: _jsx(Done, {}) }), " "] })] }));
}
