"use client";

import { classNames } from "@lib/ui";
import { useEffect } from "react";

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
        className={classNames(
          "site-border site-card w-full rounded-lg border",
          panelClassName,
        )}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
