"use client";
import Icon from "@components/Icon";
import { useEffect, useId, useRef, useState } from "react";

export default function SelectField({
    name,
    value,
    defaultValue = "",
    onChange,
    onBlur,
    options,
    className = "site-field h-10 w-full rounded-md border px-3 text-sm focus:outline-none",
    ariaInvalid,
    ariaDescribedBy,
}) {
    const listboxId = useId();
    const rootRef = useRef(null);
    const [internalValue, setInternalValue] = useState(defaultValue);
    const [isOpen, setIsOpen] = useState(false);
    const selectedValue = value ?? internalValue;
    const selectedOption = options.find((option) => option.value === selectedValue) ?? options[0];

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        function handlePointerDown(event) {
            if (rootRef.current && !rootRef.current.contains(event.target)) {
                setIsOpen(false);
                onBlur?.();
            }
        }

        function handleKeyDown(event) {
            if (event.key === "Escape") {
                setIsOpen(false);
                onBlur?.();
            }
        }

        document.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, onBlur]);

    function selectValue(nextValue) {
        if (value === undefined) {
            setInternalValue(nextValue);
        }

        onChange?.(nextValue);
        setIsOpen(false);
        onBlur?.();
    }

    return (
        <div ref={rootRef} className="relative">
          {name ? <input type="hidden" name={name} value={selectedValue} readOnly/> : null}
          <button type="button" onClick={() => setIsOpen((current) => !current)} onBlur={() => {
        if (!isOpen) {
            onBlur?.();
        }
    }} className={`${className} flex items-center justify-between gap-2 text-left`} aria-haspopup="listbox" aria-expanded={isOpen} aria-controls={listboxId} data-invalid={ariaInvalid ? "true" : undefined} aria-describedby={ariaDescribedBy}>
            <span className="truncate">{selectedOption?.label ?? "Select"}</span>
            <span className="site-muted shrink-0">
              <Icon name="chevronDown"/>
            </span>
          </button>

          {isOpen ? (<div id={listboxId} role="listbox" className="site-border site-card absolute left-0 right-0 z-40 mt-1 max-h-60 overflow-auto rounded-md border py-1 text-sm font-medium shadow-lg">
              {options.map((option) => {
            const isSelected = option.value === selectedValue;
            return (<button key={option.value} type="button" role="option" aria-selected={isSelected} onMouseDown={(event) => event.preventDefault()} onClick={() => selectValue(option.value)} className={`block w-full px-3 py-2 text-left font-medium transition ${isSelected
                    ? "bg-[var(--site-subtle-bg)] text-[var(--site-subtle-fg)]"
                    : "text-[var(--site-fg)] hover:bg-[var(--site-panel)]"}`}>
                    {option.label}
                  </button>);
        })}
            </div>) : null}
        </div>
    );
}
