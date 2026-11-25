import { Children, cloneElement, isValidElement, type ComponentPropsWithoutRef, type ReactElement, type ReactNode } from "react";

function addHeaderScopes(node: ReactNode): ReactNode {
  if (Array.isArray(node)) return Children.map(node, addHeaderScopes);
  if (!isValidElement(node)) return node;
  const element = node as ReactElement<{ children?: ReactNode; scope?: "col" | "row" }>;
  const props = element.props;
  const children = props.children ? Children.map(props.children, addHeaderScopes) : props.children;
  if (element.type === "th") {
    return cloneElement(element, { scope: props.scope ?? "col", children });
  }
  return cloneElement(element, { children });
}

function countColumns(node: ReactNode): number {
  if (Array.isArray(node)) return node.reduce((max, child) => Math.max(max, countColumns(child)), 0);
  if (!isValidElement(node)) return 0;
  const props = node.props as { children?: ReactNode };
  if (node.type === "tr") {
    return Children.toArray(props.children).filter(
      (child) => isValidElement(child) && (child.type === "th" || child.type === "td"),
    ).length;
  }
  return countColumns(props.children);
}

function minimumWidth(columns: number): number {
  if (columns >= 7) return 880;
  if (columns >= 5) return 720;
  if (columns >= 3) return 560;
  return 360;
}

/**
 * Shared renderer for lesson and lab tables. The table keeps its natural column
 * widths, while the labelled region provides keyboard scrolling on narrow
 * screens. Header scopes and a minimum width are added consistently so dense
 * matrices remain readable instead of collapsing into vertical slivers.
 */
export function MdxTable({
  children,
  className = "",
  style,
  label = "Scrollable data table",
  caption,
  ...props
}: ComponentPropsWithoutRef<"table"> & { label?: string; caption?: string }) {
  const columns = countColumns(children);

  return (
    <div className="my-6 max-w-full overflow-hidden rounded-xl border border-line bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-line bg-mist-50 px-3 py-2">
        <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">Data table</span>
        <span className="text-[9px] font-semibold text-muted sm:hidden">Scroll horizontally →</span>
      </div>
      <div
        className="max-w-full overflow-x-auto overscroll-x-contain focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500"
        role="region"
        aria-label={label}
        tabIndex={0}
      >
        <table
          {...props}
          style={{ ...style, minWidth: `max(100%, ${minimumWidth(columns)}px)` }}
          data-columns={columns}
          className={`cyber-table m-0 w-max min-w-full table-auto border-collapse text-left text-sm ${className}`.trim()}
        >
          {caption ? <caption className="sr-only">{caption}</caption> : null}
          {addHeaderScopes(children)}
        </table>
      </div>
    </div>
  );
}
