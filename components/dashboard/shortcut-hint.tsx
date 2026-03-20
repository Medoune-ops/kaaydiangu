"use client";

interface ShortcutHintProps {
  keys: string;
  className?: string;
}

export function ShortcutHint({ keys, className = "" }: ShortcutHintProps) {
  return (
    <kbd
      className={`hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-medium text-neutral-400 bg-neutral-700 border border-neutral-600 rounded select-none ${className}`}
      aria-hidden="true"
    >
      {keys}
    </kbd>
  );
}
