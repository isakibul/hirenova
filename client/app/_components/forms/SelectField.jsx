"use client";
import Icon from "@components/Icon";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

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
    disabled = false,
}) {
    const listboxId = useId();
    const rootRef = useRef(null);
    const listboxRef = useRef(null);
    const [internalValue, setInternalValue] = useState(defaultValue);
    const [isOpen, setIsOpen] = useState(false);
    const [listboxStyle, setListboxStyle] = useState(null);
    const selectedValue = value ?? internalValue;
    const selectedOption = options.find((option) => option.value === selectedValue) ?? options[0];

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        function updateListboxPosition() {
            const rect = rootRef.current?.getBoundingClientRect();
            if (!rect) {
                return;
            }
            setListboxStyle({
                left: rect.left,
                top: rect.bottom + 4,
                width: rect.width,
            });
        }

        updateListboxPosition();

        function handlePointerDown(event) {
            const target = event.target;
            if (rootRef.current?.contains(target) || listboxRef.current?.contains(target)) {
                return;
            }
            if (rootRef.current) {
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
        window.addEventListener("resize", updateListboxPosition);
        window.addEventListener("scroll", updateListboxPosition, true);

        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("resize", updateListboxPosition);
            window.removeEventListener("scroll", updateListboxPosition, true);
        };
    }, [isOpen, onBlur]);

    function selectValue(nextValue) {
        if (disabled) {
            return;
        }

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
          <button type="button" disabled={disabled} onClick={() => setIsOpen((current) => !current)} onBlur={() => {
        if (!isOpen) {
            onBlur?.();
        }
    }} className={`${className} flex items-center justify-between gap-2 text-left disabled:cursor-not-allowed disabled:opacity-60`} aria-haspopup="listbox" aria-expanded={isOpen} aria-controls={listboxId} data-invalid={ariaInvalid ? "true" : undefined} aria-describedby={ariaDescribedBy}>
            <span className="truncate">{selectedOption?.label ?? "Select"}</span>
            <span className="site-muted shrink-0">
              <Icon name="chevronDown"/>
            </span>
          </button>

          {isOpen && listboxStyle ? createPortal(<div ref={listboxRef} id={listboxId} role="listbox" style={listboxStyle} className="site-border site-card fixed z-[80] max-h-60 overflow-auto rounded-md border py-1 text-sm font-medium shadow-lg">
              {options.map((option) => {
            const isSelected = option.value === selectedValue;
            return (<button key={option.value} type="button" role="option" aria-selected={isSelected} onMouseDown={(event) => event.preventDefault()} onClick={() => selectValue(option.value)} className={`block w-full px-3 py-2 text-left font-medium transition ${isSelected
                    ? "bg-[var(--site-subtle-bg)] text-[var(--site-subtle-fg)]"
                    : "text-[var(--site-fg)] hover:bg-[var(--site-panel)]"}`}>
                    {option.label}
                  </button>);
        })}
            </div>, document.body) : null}
        </div>
    );
}
