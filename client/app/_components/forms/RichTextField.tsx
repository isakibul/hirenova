"use client";

import { useRef } from "react";

const actions = [
  {
    label: "Bold",
    prefix: "**",
    suffix: "**",
    placeholder: "bold text",
  },
  {
    label: "Heading",
    prefix: "## ",
    suffix: "",
    placeholder: "Section heading",
    lineStart: true,
  },
  {
    label: "UL",
    prefix: "- ",
    suffix: "",
    placeholder: "First item\n- Second item\n- Third item",
    lineStart: true,
    multiline: true,
  },
  {
    label: "LI",
    prefix: "- ",
    suffix: "",
    placeholder: "List item",
    lineStart: true,
  },
  {
    label: "Number",
    prefix: "1. ",
    suffix: "",
    placeholder: "List item",
    lineStart: true,
  },
];

function applyWrap(value, selectionStart, selectionEnd, action) {
  const selectedText =
    value.slice(selectionStart, selectionEnd) || action.placeholder;
  const needsLineBreak =
    action.lineStart && selectionStart > 0 && value[selectionStart - 1] !== "\n";
  const prefix = `${needsLineBreak ? "\n" : ""}${action.prefix}`;

  if (action.multiline) {
    const listText = selectedText
      .split(/\r?\n/)
      .map((line, index) => {
        const trimmedLine = line.trim();

        if (!trimmedLine) {
          return "";
        }

        if (trimmedLine.startsWith(action.prefix.trim())) {
          return trimmedLine;
        }

        return `${action.prefix}${trimmedLine}`;
      })
      .join("\n");
    const replacement = `${needsLineBreak ? "\n" : ""}${listText}`;

    return {
      nextValue:
        value.slice(0, selectionStart) + replacement + value.slice(selectionEnd),
      nextStart: selectionStart + (needsLineBreak ? 1 : 0),
      nextEnd: selectionStart + replacement.length,
    };
  }

  const replacement = `${prefix}${selectedText}${action.suffix}`;

  return {
    nextValue:
      value.slice(0, selectionStart) + replacement + value.slice(selectionEnd),
    nextStart: selectionStart + prefix.length,
    nextEnd: selectionStart + prefix.length + selectedText.length,
  };
}

export default function RichTextField({
  describedBy,
  invalid = false,
  maxLength,
  onBlur,
  onChange,
  placeholder,
  value,
}) {
  const textareaRef = useRef(null);

  function applyAction(action) {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    const { selectionStart, selectionEnd } = textarea;
    const { nextValue, nextStart, nextEnd } = applyWrap(
      value,
      selectionStart,
      selectionEnd,
      action,
    );

    onChange(nextValue);

    window.requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(nextStart, nextEnd);
    });
  }

  return (
    <div className="mt-1 overflow-hidden rounded-md border border-[var(--site-border)]">
      <div className="site-panel flex flex-wrap gap-1 border-b border-[var(--site-border)] p-2">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={() => applyAction(action)}
            className="site-border site-field rounded border px-2.5 py-1 text-xs font-semibold transition hover:border-[var(--site-accent)]"
          >
            {action.label}
          </button>
        ))}
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        className="site-field min-h-48 w-full resize-y border-0 px-3 py-2 text-sm leading-6 focus:outline-none"
        maxLength={maxLength}
        placeholder={placeholder}
      />
      <div className="site-panel border-t border-[var(--site-border)] px-3 py-2 text-xs leading-5 text-[var(--site-muted)]">
        Use headings, UL/LI, numbered lists, and bold text to organize the job
        description.
      </div>
    </div>
  );
}
