import React from 'react';
import clsx from 'clsx';
import SunriseLogoImg from '../../assets/images/sunrise-logo.png';

const SunriseLogo = ({
  size = 'medium',
  className = '',
  showText = false,
  text = 'Sunrise',
  textClassName = 'ml-2 text-xl font-semibold text-gray-900',
}) => {
  const sizeClasses = {
    small: '4rem',
    medium: '6rem',
    large: '8rem',
    xl: '10rem',
  };
  
  return (
<div className={clsx('inline-flex items-center', className)} style={{ width: sizeClasses[size], height: sizeClasses[size] }}>
      <img
        src={SunriseLogoImg}
        alt="Sunrise Logo"
        className={clsx('object-contain')}
      />
      {showText && <span className={textClassName}>{text}</span>}
    </div>
  );
};

export default SunriseLogo;
