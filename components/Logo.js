export default function Logo({ className = '' }) {
  return (
    <span className={`flex items-center gap-0 ${className}`}>
      <img src={"/logobiohazard.jpeg"} alt="Logo de BioHazard" className="w-8 h-8 rounded-none" />
      
    </span>
  );
}
