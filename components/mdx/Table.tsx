import type { ComponentPropsWithoutRef } from "react";

/**
 * Markdown tables use this renderer so wide lesson tables scroll inside the
 * article instead of widening the page. Hand-authored JSX tables use equivalent
 * accessible wrappers. The region is focusable for keyboard scrolling.
 */
export function MdxTable({
  children,
  className = "",
  ...props
}: ComponentPropsWithoutRef<"table">) {
  return (
    <div
      className="my-6 max-w-full overflow-x-auto overscroll-x-contain rounded-xl border border-line bg-white"
      role="region"
      aria-label="Scrollable data table"
      tabIndex={0}
    >
      <table
        {...props}
        className={`m-0 w-full min-w-full table-auto border-collapse text-left text-sm ${className}`.trim()}
      >
        {children}
      </table>
    </div>
  );
}
