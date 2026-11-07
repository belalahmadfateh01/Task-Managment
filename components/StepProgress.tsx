import { Check } from "lucide-react";

/**
 * Two-step indicator from the design (RTL):
 * blue numbered circle on the right = current step, grey check circle on the left.
 */
export default function StepProgress({ current = 1 }: { current?: number }) {
  return (
    <div className="flex items-center gap-2" role="progressbar" aria-valuemin={1} aria-valuemax={2} aria-valuenow={current}>
      <span className="grid size-7 flex-none place-items-center rounded-full bg-[#3F8EFC] text-xs font-bold text-white">
        {current}
      </span>
      <span className="h-1 flex-1 rounded-full bg-gray-300" />
      <span className="grid size-7 flex-none place-items-center rounded-full bg-gray-300 text-white">
        <Check size={14} strokeWidth={3} aria-hidden />
      </span>
    </div>
  );
}
