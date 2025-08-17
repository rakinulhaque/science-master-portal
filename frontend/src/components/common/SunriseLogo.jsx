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
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-10 h-10',
    xl: 'width: 88px; height: 88px;',
  };
  
  return (
<div className={clsx('inline-flex items-center', className)} style={sizeClasses[size]}>
      <img
        src={SunriseLogoImg}
        alt="Sunrise Logo"
        className={clsx('object-contain', sizeClasses[size])}
      />
      {showText && <span className={textClassName}>{text}</span>}
    </div>
  );
};

export default SunriseLogo;
