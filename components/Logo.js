export default function Logo({ className = '' }) {
  return (
    <span className={`flex items-center gap-0 ${className}`}>
      <img
        src="/logobiohazard.jpeg"
        alt="Logo de BioHazard"
        className="w-10 h-10 select-none"
        draggable={false}
      />
    </span>
  );
}
