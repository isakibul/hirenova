"use client";
import { useState } from "react";
const maxSalary = 300000;
const step = 5000;
function clamp(value, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.min(Math.max(parsed, 0), maxSalary);
}
function formatCompactCurrency(value) {
  if (value >= 1000) {
    return `$${Math.round(value / 1000)}K`;
  }
  return `$${value}`;
}
export default function SalaryRangeFilter({ minSalary, maxSalaryValue }) {
  const hasInitialFilter = Boolean(minSalary || maxSalaryValue);
  const [min, setMin] = useState(() => clamp(minSalary, 0));
  const [max, setMax] = useState(() => clamp(maxSalaryValue, maxSalary));
  const [isActive, setIsActive] = useState(hasInitialFilter);
  const span = maxSalary || 1;
  const minPercent = (min / span) * 100;
  const maxPercent = (max / span) * 100;
  function updateMin(value) {
    setIsActive(true);
    setMin(Math.min(clamp(value, 0), max));
  }
  function updateMax(value) {
    setIsActive(true);
    setMax(Math.max(clamp(value, maxSalary), min));
  }
  return (
    <div className="mt-2">
      <input
        type="hidden"
        name="min_salary"
        value={min}
        readOnly
        disabled={!isActive}
      />
      <input
        type="hidden"
        name="max_salary"
        value={max}
        readOnly
        disabled={!isActive}
      />

      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-1.5 text-xs font-medium">
        <span>{formatCompactCurrency(min)}</span>
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
            aria-label="Minimum salary"
            value={min}
            onChange={(event) => updateMin(event.target.value)}
            type="range"
            min={0}
            max={maxSalary}
            step={step}
            className="range-filter-input"
          />
          <input
            aria-label="Maximum salary"
            value={max}
            onChange={(event) => updateMax(event.target.value)}
            type="range"
            min={0}
            max={maxSalary}
            step={step}
            className="range-filter-input"
          />
        </div>
        <span className="text-right">{formatCompactCurrency(max)}</span>
      </div>

      <div className="mt-1 grid grid-cols-2 gap-2">
        <input
          aria-label="Minimum salary value"
          value={min}
          onChange={(event) => updateMin(event.target.value)}
          type="number"
          min={0}
          max={maxSalary}
          step={step}
          className="site-field h-8 rounded-md border px-2 py-1 text-xs focus:outline-none"
        />
        <input
          aria-label="Maximum salary value"
          value={max}
          onChange={(event) => updateMax(event.target.value)}
          type="number"
          min={0}
          max={maxSalary}
          step={step}
          className="site-field h-8 rounded-md border px-2 py-1 text-xs focus:outline-none"
        />
      </div>
    </div>
  );
}
