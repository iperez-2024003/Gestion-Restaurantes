import LogoBuenProvecho from '../../../assets/img/LogoBuenProvecho.jpeg';

const sizeMap = {
  sm: 'h-12 w-auto',
  md: 'h-20 w-auto',
  lg: 'h-28 w-auto',
  xl: 'h-40 w-auto'
};

export const BrandLogo = ({ size = 'md', className = '', imageClassName = '' }) => {
  const sizeClass = sizeMap[size] || sizeMap.md;
  
  return (
    <img
      src={LogoBuenProvecho}
      alt="Buen Provecho"
      className={`${sizeClass} object-contain mix-blend-multiply ${imageClassName} ${className}`}
    />
  );
};