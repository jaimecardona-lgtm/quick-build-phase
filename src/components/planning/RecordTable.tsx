import { Plus, Trash2 } from "lucide-react";
import { uid } from "@/lib/planning/types";

export interface ColDef {
  key: string;
  label: string;
  type?: "text" | "number" | "date" | "select" | "textarea";
  options?: readonly string[];
  placeholder?: string;
}

interface RecordTableProps<T extends { id: string }> {
  cols: ColDef[];
  rows: T[];
  onChange: (rows: T[]) => void;
  addLabel: string;
  emptyRow: () => Omit<T, "id">;
  footer?: React.ReactNode;
}

/** Tabla dinámica genérica: agregar, editar en línea y eliminar registros. */
export function RecordTable<T extends { id: string }>({
  cols,
  rows,
  onChange,
  addLabel,
  emptyRow,
  footer,
}: RecordTableProps<T>) {
  const setCell = (id: string, key: string, value: string) =>
    onChange(rows.map((r) => (r.id === id ? ({ ...r, [key]: value } as T) : r)));

  return (
    <div className="pl-table-wrap">
      <table className="pl-table">
        <thead>
          <tr>
            {cols.map((c) => (
              <th key={c.key}>{c.label}</th>
            ))}
            <th className="pl-col-actions" aria-label="Acciones" />
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={cols.length + 1} className="pl-empty">
                Sin registros todavía.
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id}>
                {cols.map((c) => {
                  const value = String((row as Record<string, unknown>)[c.key] ?? "");
                  return (
                    <td key={c.key}>
                      {c.type === "select" ? (
                        <select
                          className="pl-input"
                          value={value}
                          onChange={(e) => setCell(row.id, c.key, e.target.value)}
                          aria-label={c.label}
                        >
                          <option value="">Seleccionar…</option>
                          {c.options?.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          className="pl-input"
                          type={c.type === "number" ? "number" : c.type === "date" ? "date" : "text"}
                          value={value}
                          placeholder={c.placeholder}
                          onChange={(e) => setCell(row.id, c.key, e.target.value)}
                          aria-label={c.label}
                        />
                      )}
                    </td>
                  );
                })}
                <td className="pl-col-actions">
                  <button
                    type="button"
                    className="pl-icon-btn"
                    aria-label="Eliminar registro"
                    onClick={() => onChange(rows.filter((r) => r.id !== row.id))}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
        {footer ? <tfoot>{footer}</tfoot> : null}
      </table>
      <button
        type="button"
        className="pl-add-btn"
        onClick={() => onChange([...rows, { ...emptyRow(), id: uid() } as T])}
      >
        <Plus className="h-4 w-4" aria-hidden="true" /> {addLabel}
      </button>
    </div>
  );
}
