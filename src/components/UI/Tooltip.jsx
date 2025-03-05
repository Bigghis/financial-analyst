import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

export function Tooltip({ children, content, position = 'top' }) {
    const [isVisible, setIsVisible] = useState(false);
    const [coords, setCoords] = useState({ x: 0, y: 0 });
    const triggerRef = useRef(null);
    const tooltipRef = useRef(null);

    const updatePosition = () => {
        if (!triggerRef.current || !tooltipRef.current) return;

        const triggerRect = triggerRef.current.getBoundingClientRect();
        const tooltipRect = tooltipRef.current.getBoundingClientRect();

        let x = 0;
        let y = 0;

        switch (position) {
            case 'top':
                x = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
                y = triggerRect.top - tooltipRect.height - 8;
                break;
            case 'bottom':
                x = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
                y = triggerRect.bottom + 8;
                break;
            case 'left':
                x = triggerRect.left - tooltipRect.width - 8;
                y = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2);
                break;
            case 'right':
                x = triggerRect.right + 8;
                y = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2);
                break;
            default:
                break;
        }

        // Prevent tooltip from going off-screen
        x = Math.max(8, Math.min(x, window.innerWidth - tooltipRect.width - 8));
        y = Math.max(8, Math.min(y, window.innerHeight - tooltipRect.height - 8));

        setCoords({ x, y });
    };

    useEffect(() => {
        if (isVisible) {
            updatePosition();
            window.addEventListener('scroll', updatePosition);
            window.addEventListener('resize', updatePosition);
        }

        return () => {
            window.removeEventListener('scroll', updatePosition);
            window.removeEventListener('resize', updatePosition);
        };
    }, [isVisible]);

    return (
        <>
            <div 
                ref={triggerRef}
                onMouseEnter={() => setIsVisible(true)}
                onMouseLeave={() => setIsVisible(false)}
                className="tooltip-trigger"
            >
                {children}
            </div>

            {isVisible && createPortal(
                <div 
                    ref={tooltipRef}
                    className={`tooltip ${position}`}
                    style={{
                        left: `${coords.x}px`,
                        top: `${coords.y}px`
                    }}
                >
                    <div className="tooltip-content">
                        {content}
                    </div>
                    <div className="tooltip-arrow" />
                </div>,
                document.body
            )}
        </>
    );
} 