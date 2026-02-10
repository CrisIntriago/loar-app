import { useState, useEffect } from 'react';

export function useSidebarState() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('sidebar-collapsed');
        if (stored) {
            setIsCollapsed(JSON.parse(stored));
        }
    }, []);

    const toggleCollapse = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem('sidebar-collapsed', JSON.stringify(newState));
    };

    return {
        isCollapsed,
        toggleCollapse,
        isMobileOpen,
        setIsMobileOpen
    };
}
