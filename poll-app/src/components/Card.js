import { jsx as _jsx } from "react/jsx-runtime";
export function Card({ children }) {
    return (_jsx("div", { style: {
            border: '1px solid #e5e7eb',
            borderRadius: 12,
            padding: 16,
            marginBottom: 12
        }, children: children }));
}
