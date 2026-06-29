// components/ui/MobileMenuButton.tsx
'use client';

import { Menu } from 'lucide-react';
import { useState } from 'react';

export default function MobileMenuButton() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.classList.toggle('open');
        }
    };

    return (
        <button
            onClick={toggleMenu}
            style={{
                display: 'none',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '8px',
                color: '#6B7280'
            }}
            className="mobile-menu-btn"
        >
            <Menu size={24} />
        </button>
    );
}