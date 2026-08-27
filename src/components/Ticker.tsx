import { IconSquare } from "./Icons";

export default function Ticker({ items }: { items: string[] }) {
  const row = (hidden: boolean) => (
    <div aria-hidden={hidden} className="flex shrink-0 items-center">
      {items.map((item, i) => (
        <span key={i} className="flex items-center">
          <span className="px-5 font-display text-[11px] font-bold uppercase tracking-[0.28em] text-paper">
            {item}
          </span>
          <IconSquare size={7} className="text-signal shrink-0" />
        </span>
      ))}
    </div>
  );

  return (
    <div className="relative z-20 overflow-hidden border-y-2 border-ink bg-ink py-2.5">
      <div className="animate-marquee flex w-max">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
