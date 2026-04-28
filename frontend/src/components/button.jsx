export const Button = ({ children, variant = 'primary', icon }) => {
  const styles = variant === 'primary' 
    ? 'bg-[#3b73b9] text-white' 
    : 'bg-white text-[#3b73b9] border-2 border-[#3b73b9]';
    
  return (
    <button className={`w-full py-3 rounded-md font-bold flex items-center justify-center gap-2 ${styles} uppercase transition-opacity hover:opacity-90`}>
      {icon} {children}
    </button>
  );
};