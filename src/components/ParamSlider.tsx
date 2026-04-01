'use client';

interface ParamSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
}

export default function ParamSlider({ label, value, min, max, step = 1, unit = '', onChange }: ParamSliderProps) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <label className="text-gray-600 whitespace-nowrap min-w-[100px]">{label}</label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-32 accent-blue-600"
      />
      <span className="text-gray-900 font-mono min-w-[60px] text-right">
        {value}{unit}
      </span>
    </div>
  );
}
