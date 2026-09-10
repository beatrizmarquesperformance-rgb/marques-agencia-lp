"use client";

/**
 * Submits its parent <form> (a server action) only after a confirm() prompt.
 * Use for reversible-but-consequential actions: activate/deactivate, regenerate.
 */
export function ConfirmButton({
  children,
  message,
  className = "",
}: {
  children: React.ReactNode;
  message: string;
  className?: string;
}) {
  return (
    <button
      type="submit"
      onClick={(e) => {
        // eslint-disable-next-line no-alert
        if (!confirm(message)) e.preventDefault();
      }}
      className={
        className ||
        "rounded border border-neutral-700 px-3 py-1.5 text-xs text-neutral-200 hover:bg-neutral-800"
      }
    >
      {children}
    </button>
  );
}
