export default function Logo({ className = '' }) {
  return (
    <span className={`flex items-center gap-0 ${className}`}>
      <img
        src="/logobiohazard.jpeg"
        alt="Logo de BioHazard"
        className="w-30 h-20 select-none"
        draggable={false}
      />
    </span>
  );
}
