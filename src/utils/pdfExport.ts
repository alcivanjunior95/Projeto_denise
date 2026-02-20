import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportToPDF = (columns: string[], data: Record<string, any>[], fileName: string) => {
  const doc = new jsPDF();

  // Add Title
  doc.setFontSize(18);
  doc.setTextColor(0, 27, 61); // Navy color
  doc.text('Sistema da Denise - Exportação de Dados', 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Gerado em: ${new Date().toLocaleString()}`, 14, 28);

  // Prepare table data
  const tableRows = data.map(row => columns.map(col => row[col] || ''));

  // Generate Table using the explicit autoTable function
  autoTable(doc, {
    head: [columns],
    body: tableRows,
    startY: 35,
    theme: 'grid',
    headStyles: {
      fillColor: [0, 27, 61], // Navy
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [50, 50, 50]
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    margin: { top: 35 },
    styles: {
      cellPadding: 3,
      overflow: 'linebreak',
      valign: 'middle'
    }
  });

  // Save PDF
  doc.save(fileName);
};
