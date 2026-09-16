export default function SatuZikirLogo({ className = 'h-8 w-8' }: { className?: string }) {
  const wrapperClass = className.replace('object-contain', '').replace('w-auto', 'w-8').trim();

  return (
    <div className={`${wrapperClass} relative overflow-hidden rounded-[24%] shrink-0 shadow-sm flex items-center justify-center bg-[#059669]`}>
      <img
        src="/logo-app.jpg"
        alt="SatuZikir Logo"
        className="absolute w-[135%] h-[135%] max-w-none object-cover"
      />
    </div>
  );
}
