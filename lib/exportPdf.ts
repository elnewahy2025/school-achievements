import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Achievement {
  id: number; title: string; description: string; department: string;
  teacher_name: string; event_date: string | null; categories: string;
  created_at: string; files: any[];
}

export function exportAchievementsPdf(achievements: Achievement[], schoolName: string, title: string = 'Achievements Report') {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(123, 47, 242);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(schoolName, pageWidth / 2, 18, { align: 'center' });
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(title, pageWidth / 2, 28, { align: 'center' });
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 35, { align: 'center' });

  // Stats bar
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(10);
  doc.text(`Total: ${achievements.length} achievements`, 14, 50);

  // Table
  const tableData = achievements.map((a) => [
    a.title,
    a.department,
    a.teacher_name,
    a.event_date ? new Date(a.event_date).toLocaleDateString() : '-',
    (a.categories || '-'),
    `${a.files.length} files`,
  ]);

  autoTable(doc, {
    startY: 55,
    head: [['Title', 'Department', 'Teacher', 'Date', 'Categories', 'Files']],
    body: tableData,
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [123, 47, 242], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
  }

  doc.save(`${schoolName.replace(/\s+/g, '_')}_${title.replace(/\s+/g, '_')}.pdf`);
}

export function exportSingleAchievementPdf(achievement: Achievement, schoolName: string) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(123, 47, 242);
  doc.rect(0, 0, pageWidth, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(schoolName, pageWidth / 2, 15, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Achievement Certificate', pageWidth / 2, 25, { align: 'center' });

  // Achievement details
  let y = 50;
  doc.setTextColor(0, 0, 0);

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  const titleLines = doc.splitTextToSize(achievement.title, pageWidth - 28);
  doc.text(titleLines, 14, y);
  y += titleLines.length * 8 + 5;

  // Department + Date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Department: ${achievement.department}`, 14, y);
  if (achievement.event_date) doc.text(`Date: ${new Date(achievement.event_date).toLocaleDateString()}`, pageWidth / 2, y);
  y += 8;
  doc.text(`Teacher: ${achievement.teacher_name}`, 14, y);
  if (achievement.categories) doc.text(`Categories: ${achievement.categories}`, pageWidth / 2, y);
  y += 12;

  // Divider
  doc.setDrawColor(200, 200, 200);
  doc.line(14, y, pageWidth - 14, y);
  y += 10;

  // Description
  if (achievement.description) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Description', 14, y);
    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    const descLines = doc.splitTextToSize(achievement.description, pageWidth - 28);
    doc.text(descLines, 14, y);
    y += descLines.length * 5 + 10;
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(`Generated: ${new Date().toLocaleDateString()} | School Achievements`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });

  doc.save(`${achievement.title.replace(/\s+/g, '_')}.pdf`);
}
