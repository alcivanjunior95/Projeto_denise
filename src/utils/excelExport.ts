import ExcelJS from 'exceljs';

export const exportToExcel = async (columns: string[], data: Record<string, any>[], fileName: string = 'data-export.xlsx') => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Dados');

  // Define columns for the worksheet
  const excelColumns = columns.map(col => ({
    name: col,
    filterButton: true
  }));

  // Prepare rows
  const rows = data.map(item => columns.map(col => item[col] || ''));

  // Add table
  worksheet.addTable({
    name: 'TabelaDados',
    ref: 'A1',
    headerRow: true,
    totalsRow: false,
    style: {
      theme: 'TableStyleMedium2',
      showRowStripes: true,
    },
    columns: excelColumns,
    rows: rows,
  });

  // Auto-fit columns (basic implementation)
  columns.forEach((_, i) => {
    let maxLength = columns[i].length;
    data.forEach(row => {
      const val = row[columns[i]]?.toString() || '';
      if (val.length > maxLength) maxLength = val.length;
    });
    worksheet.getColumn(i + 1).width = maxLength < 12 ? 12 : maxLength + 2;
  });

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};

export const downloadExcel = (buffer: any, fileName: string) => {
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  window.URL.revokeObjectURL(url);
};
