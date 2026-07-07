function escapeCsvCell(value) {
  const str = value === undefined || value === null ? '' : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replaceAll('"', '""')}"`;
  }
  return str;
}

/**
 * Downloads a CSV file built from headers + rows.
 * @param {string} filename
 * @param {string[]} headers
 * @param {Array<Array<string>>} rows
 */
export function downloadCsv(filename, headers, rows) {
  const lines = [headers, ...rows].map(row => row.map(escapeCsvCell).join(','));
  const csvContent = lines.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
