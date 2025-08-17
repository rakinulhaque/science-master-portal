import React from 'react';
import clsx from 'clsx';
import SunriseLogoImg from '../../assets/images/sunrise-logo.png';

/**
 * SunriseLogo (PNG)
 * - Keeps original aspect ratio (h-* w-auto)
 * - No inline baseline gap (display: block)
 */
const SunriseLogo = ({
  size = 'medium',
  className = '',
  alt = 'Sunrise Logo',
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
        src={SunriseLogoImg}
        alt={alt}
        className={clsx('block object-contain select-none', sizeClasses[size])}
        draggable={false}
      />
    </div>
  );
};

export default SunriseLogo;
