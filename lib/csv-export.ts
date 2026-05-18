export function exportToCsv<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  columnLabels?: Partial<Record<keyof T, string>>
) {
  if (!data.length) return;

  const keys = Object.keys(data[0]) as (keyof T)[];
  const labels = keys.map((k) => columnLabels?.[k] ?? String(k));
  const rows = data.map((row) =>
    keys.map((k) => {
      const val = row[k];
      const str = val == null ? "" : String(val);
      return str.includes(",") || str.includes('"') || str.includes("\n")
        ? `"${str.replace(/"/g, '""')}"`
        : str;
    })
  );

  const csv = [labels.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
