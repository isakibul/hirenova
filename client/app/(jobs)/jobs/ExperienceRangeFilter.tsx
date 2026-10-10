"use client";
import { useState } from "react";
const maxYears = 30;
function clamp(value, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.min(Math.max(parsed, 0), maxYears);
}
export default function ExperienceRangeFilter({
  minExperience,
  maxExperience,
}) {
  const hasInitialFilter = Boolean(minExperience || maxExperience);
  const [min, setMin] = useState(() => clamp(minExperience, 0));
  const [max, setMax] = useState(() => clamp(maxExperience, maxYears));
  const [isActive, setIsActive] = useState(hasInitialFilter);
  const span = maxYears || 1;
  const minPercent = (min / span) * 100;
  const maxPercent = (max / span) * 100;
  function updateMin(value) {
    setIsActive(true);
    setMin(Math.min(clamp(value, 0), max));
  }
  function updateMax(value) {
    setIsActive(true);
    setMax(Math.max(clamp(value, maxYears), min));
  }
  return (
    <div className="mt-2">
      <input
        type="hidden"
        name="min_experience"
        value={min}
        readOnly
        disabled={!isActive}
      />
      <input
        type="hidden"
        name="max_experience"
        value={max}
        readOnly
        disabled={!isActive}
      />

      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-1.5 text-xs font-medium">
        <span>{min}</span>
        <div className="relative h-4 flex-1">
          <div className="range-filter-track" />
          <div
            className="range-filter-selected"
            style={{
              left: `${minPercent}%`,
              right: `${100 - maxPercent}%`,
            }}
          />
          <input
            aria-label="Minimum experience"
            value={min}
            onChange={(event) => updateMin(event.target.value)}
            type="range"
            min={0}
            max={maxYears}
            className="range-filter-input"
          />
          <input
            aria-label="Maximum experience"
            value={max}
            onChange={(event) => updateMax(event.target.value)}
            type="range"
            min={0}
            max={maxYears}
            className="range-filter-input"
          />
        </div>
        <span className="whitespace-nowrap text-right">{max} year</span>
      </div>

      <div className="mt-1 grid grid-cols-2 gap-2">
        <input
          aria-label="Minimum experience value"
          value={min}
          onChange={(event) => updateMin(event.target.value)}
          type="number"
          min={0}
          max={maxYears}
          className="site-field h-8 rounded-md border px-2 py-1 text-xs focus:outline-none"
        />
        <input
          aria-label="Maximum experience value"
          value={max}
          onChange={(event) => updateMax(event.target.value)}
          type="number"
          min={0}
          max={maxYears}
          className="site-field h-8 rounded-md border px-2 py-1 text-xs focus:outline-none"
        />
      </div>
    </div>
  );
}
