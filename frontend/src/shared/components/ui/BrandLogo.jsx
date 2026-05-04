import LogoBuenProvecho from '../../../assets/img/LogoBuenProvecho.jpeg';

const sizeMap = {
  sm: 'h-14 w-full max-w-[11rem] sm:max-w-[13rem] md:max-w-[14rem]',
  md: 'h-24 w-full max-w-[20rem] sm:max-w-[24rem] md:max-w-[28rem]',
  lg: 'h-32 w-full max-w-[26rem] md:max-w-[32rem] lg:max-w-[38rem]',
  xl: 'h-48 w-full max-w-[34rem] lg:max-w-[44rem]'
};

export const BrandLogo = ({ size = 'md', className = '', imageClassName = '' }) => {
  const sizeClasses = sizeMap[size] || sizeMap.md;
  return (
    <div
      role="img"
      aria-label="Logo BuenProvecho"
      className={`mx-auto flex items-center justify-center ${sizeClasses} overflow-hidden rounded-[2rem] border border-[#e0cfaf] bg-[#fffaf6] p-2 md:p-3 shadow-[0_26px_80px_rgba(110,80,40,0.12)] ${className}`}
    >
      <img
        src={LogoBuenProvecho}
        alt="Buen Provecho"
        className={`h-full w-full object-contain ${imageClassName}`}
      />
    </div>
  );
};