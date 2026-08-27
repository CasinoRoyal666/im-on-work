export default function Backdrop() {
  return (
    <div aria-hidden className="fixed inset-0 z-0 pointer-events-none">
      {/* миллиметровка */}
      <div className="absolute inset-0 grid-paper" />

      {/* гигантский водяной знак */}
      <div className="absolute -right-[6%] top-[16%] hidden md:block rotate-[-8deg] select-none">
        <span className="font-display font-black text-[24vw] leading-none text-outline tracking-tight">
          ТЕСТ
        </span>
      </div>

      {/* красное кольцо */}
      <div className="absolute -left-28 bottom-[8%] size-[340px] rounded-full border-[26px] border-signal opacity-[0.13] float-y" />

      {/* зона точек */}
      <div className="absolute right-[4%] top-[8%] size-64 dots opacity-60 rotate-6 hidden sm:block" />
      <div className="absolute left-[3%] top-[42%] size-40 dots opacity-40 -rotate-3 hidden lg:block" />

      {/* сигнальная полоса */}
      <div className="absolute bottom-0 left-0 right-0 h-3 stripes opacity-[0.16]" />

      {/* шум */}
      <div className="absolute inset-0 noise" />

      {/* приводочные кресты по углам */}
      <Cross className="absolute left-3 top-3 text-ink/35" />
      <Cross className="absolute right-3 top-3 text-ink/35" />
      <Cross className="absolute bottom-3 left-3 text-ink/35" />
      <Cross className="absolute bottom-3 right-3 text-ink/35" />
    </div>
  );
}

function Cross({ className = "" }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" className={className}>
      <path d="M9 1v16M1 9h16" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
