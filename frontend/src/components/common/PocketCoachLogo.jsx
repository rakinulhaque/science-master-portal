import React from 'react';
import clsx from 'clsx';
import PocketCoachLogoImg from '../../assets/images/pocket-coach-logo.png';

/**
 * PocketCoachLogo (PNG)
 * - Keeps original aspect ratio (h-* w-auto)
 * - No inline baseline gap (display: block)
 */
const PocketCoachLogo = ({
    size = 'medium',
    className = '',
    alt = 'Pocket Coach Logo',
}) => {
    // Use height only; keep width auto to preserve aspect ratio
    const sizeClasses = {
        small: 'h-6 w-auto',
        medium: 'h-8 w-auto',
        large: 'h-10 w-auto',
        xl: 'h-12 w-auto',
    };

    return (
        <div className={clsx('inline-flex items-center', className)}>
            <img
                src={PocketCoachLogoImg}
                alt={alt}
                className={clsx('block object-contain select-none', sizeClasses[size])}
                draggable={false}
            />
        </div>
    );
};

export default PocketCoachLogo;
