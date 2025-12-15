import React, { useEffect } from 'react';

const CustomCursor = ({ variant = 'vector' }) => {

    useEffect(() => {
        // CLEANUP: Reset cursor and remove style tag on unmount
        document.documentElement.style.cursor = 'auto';
        const elements = document.querySelectorAll('a, button, input, select, textarea');
        elements.forEach(el => el.style.cursor = 'auto');

        const styleId = 'custom-cursor-style';
        const existingStyle = document.getElementById(styleId);
        if (existingStyle) existingStyle.remove();

        if (variant === 'none') return;

        if (variant === 'vector') {
            // THEME: Black Fill with Gold Stroke (#D4AF37)

            // 1. DEFAULT (Arrow)
            const defaultCursor = `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M5.5 2V21L10.5 15.5H19.5L5.5 2Z' fill='black' stroke='%23D4AF37' stroke-width='1.5' stroke-linejoin='round'/%3E%3C/svg%3E") 2 2, auto`;

            // 2. POINTER (Hand - Gold Fill)
            const pointerCursor = `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M8 2V21L13 15.5H22L8 2Z' fill='%23D4AF37' stroke='black' stroke-width='1.5' stroke-linejoin='round'/%3E%3C/svg%3E") 2 2, pointer`;

            // 3. TEXT (I-Beam - Gold)
            const textCursor = `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12 4V20M8 4H16M8 20H16' stroke='%23D4AF37' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E") 12 12, text`;

            // 4. NOT ALLOWED (Circle Slash - Red/Gold)
            const notAllowedCursor = `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='12' cy='12' r='8' stroke='%23EF4444' stroke-width='2'/%3E%3Cpath d='M6 18L18 6' stroke='%23EF4444' stroke-width='2'/%3E%3C/svg%3E") 12 12, not-allowed`;

            // 5. MOVE (Multi-directional)
            const moveCursor = `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12 3L15 6M12 3L9 6M12 3V21M12 21L15 18M12 21L9 18M3 12L6 9M3 12L6 15M3 12H21M21 12L18 9M21 12L18 15' stroke='%23D4AF37' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") 12 12, move`;

            const style = document.createElement('style');
            style.id = styleId;
            style.innerHTML = `
                html, body {
                    cursor: ${defaultCursor} !important;
                }
                a, button, .clickable, [role="button"], select, label {
                    cursor: ${pointerCursor} !important;
                }
                input[type="text"], input[type="email"], input[type="password"], textarea, [contenteditable="true"] {
                    cursor: ${textCursor} !important;
                }
                button:disabled, input:disabled, .cursor-not-allowed {
                    cursor: ${notAllowedCursor} !important;
                }
                .cursor-move {
                    cursor: ${moveCursor} !important;
                }
            `;
            document.head.appendChild(style);

            return () => {
                if (style) style.remove();
            };
        }
    }, [variant]);

    return null;
};

export default CustomCursor;
