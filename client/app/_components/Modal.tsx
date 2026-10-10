"use client";

import { classNames } from "@lib/ui";
import { useEffect, useRef } from "react";

let openModalCount = 0;
let previousBodyOverflow = "";

export default function Modal({
  ariaDescribedBy,
  ariaLabelledBy,
  children,
  className,
  isModal = true,
  onClose,
  overlayClassName,
  panelClassName,
  position = "center",
}) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (openModalCount === 0) {
      previousBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }

    openModalCount += 1;

    return () => {
      openModalCount = Math.max(openModalCount - 1, 0);

      if (openModalCount === 0) {
        document.body.style.overflow = previousBodyOverflow;
        previousBodyOverflow = "";
      }
    };
  }, []);

  useEffect(() => {
    const panel = panelRef.current;
    const previousActiveElement = document.activeElement;
    const focusableSelector = [
      "a[href]",
      "button:not([disabled])",
      "textarea:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      "[tabindex]:not([tabindex='-1'])",
    ].join(",");

    function getFocusableElements() {
      return Array.from(panel?.querySelectorAll(focusableSelector) ?? []).filter(
        (element) =>
          !element.hasAttribute("disabled") &&
          element.getAttribute("aria-hidden") !== "true",
      );
    }

    function handleKeyDown(event) {
      if (event.key === "Escape" && onClose) {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = getFocusableElements();

      if (!focusableElements.length) {
        event.preventDefault();
        panel?.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    const firstFocusableElement = getFocusableElements()[0];
    window.setTimeout(() => {
      (firstFocusableElement ?? panel)?.focus();
    }, 0);

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);

      if (previousActiveElement instanceof HTMLElement) {
        previousActiveElement.focus();
      }
    };
  }, [onClose]);

  const alignment =
    position === "top"
      ? "items-start justify-center py-16"
      : "items-center justify-center py-6";

  function handleMouseDown() {
    onClose?.();
  }

  return (
    <div
      className={classNames(
        "fixed inset-0 z-50 flex px-4",
        alignment,
        overlayClassName ?? "bg-black/55",
        className,
      )}
      role="dialog"
      aria-modal={isModal ? "true" : "false"}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
      onMouseDown={handleMouseDown}
    >
      <div
        ref={panelRef}
        className={classNames(
          "site-border site-card w-full rounded-lg border",
          panelClassName,
        )}
        tabIndex={-1}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
