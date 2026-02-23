import jsPDF from 'jspdf';

export const generateStudentPDF = async (student, payments = [], dueInfo = {}) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;

  // Colors
  const primaryColor = '#3b82f6'; // blue-500
  const textColor = '#374151'; // gray-700
  const lightGray = '#f3f4f6'; // gray-100

  // Company/Institute Header
  doc.setFillColor(59, 130, 246); // blue-500
  doc.rect(0, 0, pageWidth, 30, 'F');

  // Logo placeholder (sun emoji simulation)
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('☀', margin, 20);

  // Company name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('POCKET COACH', margin + 15, 20);

  // Document title
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.text('Student Payment Report', pageWidth - margin - 50, 20);

  // Student Information Section
  let yPosition = 50;

  doc.setTextColor(textColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Student Information', margin, yPosition);

  yPosition += 15;

  // Student info in two columns
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);

  const leftColumnX = margin;
  const rightColumnX = pageWidth / 2 + 10;

  // Left column
  doc.setFont('helvetica', 'bold');
  doc.text('Name:', leftColumnX, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(student.name || 'N/A', leftColumnX + 25, yPosition);

  // Right column
  doc.setFont('helvetica', 'bold');
  doc.text('Phone:', rightColumnX, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(student.phoneNumber || 'N/A', rightColumnX + 25, yPosition);

  yPosition += 12;

  // Second row
  doc.setFont('helvetica', 'bold');
  doc.text('Institution:', leftColumnX, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(student.institution || 'N/A', leftColumnX + 35, yPosition);

  doc.setFont('helvetica', 'bold');
  doc.text('Email:', rightColumnX, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(student.email || 'N/A', rightColumnX + 25, yPosition);

  yPosition += 12;

  // Third row
  doc.setFont('helvetica', 'bold');
  doc.text('Student ID:', leftColumnX, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(`#${student.id}`, leftColumnX + 35, yPosition);

  doc.setFont('helvetica', 'bold');
  doc.text('Enrollment Date:', rightColumnX, yPosition);
  doc.setFont('helvetica', 'normal');
  const enrollmentDate = student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A';
  doc.text(enrollmentDate, rightColumnX + 45, yPosition);

  yPosition += 25;

  // Batches Section
  if (student.Batches && student.Batches.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Enrolled Batches', margin, yPosition);

    yPosition += 15;

    // Create manual table for batches
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Batch Name', margin, yPosition);
    doc.text('Code', margin + 60, yPosition);
    doc.text('Category', margin + 100, yPosition);
    doc.text('Cost', margin + 140, yPosition);

    yPosition += 8;

    doc.setFont('helvetica', 'normal');
    student.Batches.forEach((batch, index) => {
      doc.text(batch.name || 'N/A', margin, yPosition);
      doc.text(batch.code || 'N/A', margin + 60, yPosition);
      doc.text(batch.Category?.name || 'N/A', margin + 100, yPosition);
      doc.text(`${batch.cost ? batch.cost.toLocaleString() : '0'} BDT`, margin + 140, yPosition);
      yPosition += 8;
    });

    yPosition += 10;
  }

  // Payment History Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Payment History', margin, yPosition);

  yPosition += 10;

  if (payments && payments.length > 0) {
    yPosition += 15;

    // Create manual table for payments
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Installment', margin, yPosition);
    doc.text('Date', margin + 40, yPosition);
    doc.text('Amount', margin + 100, yPosition);
    doc.text('Note', margin + 150, yPosition);

    yPosition += 8;

    doc.setFont('helvetica', 'normal');
    payments.forEach((payment, index) => {
      doc.text(`#${payment.installmentNumber}`, margin, yPosition);
      doc.text(new Date(payment.date).toLocaleDateString(), margin + 40, yPosition);
      doc.text(`${payment.amount ? payment.amount.toLocaleString() : '0'} BDT`, margin + 100, yPosition);
      doc.text(payment.note || 'No note', margin + 150, yPosition);
      yPosition += 8;
    });

    yPosition += 15;
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(128, 128, 128);
    doc.text('No payment history available.', margin, yPosition);
    yPosition += 20;
  }

  // Financial Summary Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(textColor);
  doc.text('Financial Summary', margin, yPosition);

  yPosition += 15;

  // Summary box with border
  const summaryBoxY = yPosition;
  const summaryBoxHeight = 50;

  doc.setFillColor(243, 244, 246); // gray-100
  doc.rect(margin, summaryBoxY, pageWidth - 2 * margin, summaryBoxHeight, 'F');
  doc.setDrawColor(209, 213, 219); // gray-300
  doc.rect(margin, summaryBoxY, pageWidth - 2 * margin, summaryBoxHeight, 'S');

  yPosition += 12;

  // Financial details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);

  doc.text('Total Cost:', margin + 10, yPosition);
  doc.text(`${dueInfo.totalCost ? dueInfo.totalCost.toLocaleString() : '0'} BDT`, pageWidth - margin - 60, yPosition);

  yPosition += 10;

  doc.text('Discount:', margin + 10, yPosition);
  doc.text(`${dueInfo.discount ? dueInfo.discount.toLocaleString() : '0'} BDT`, pageWidth - margin - 60, yPosition);

  yPosition += 10;

  doc.text('Total Paid:', margin + 10, yPosition);
  doc.text(`${dueInfo.totalPaid ? dueInfo.totalPaid.toLocaleString() : '0'} BDT`, pageWidth - margin - 60, yPosition);

  yPosition += 12;

  // Remaining due with emphasis
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  const remainingDue = dueInfo.finalDue || 0;

  if (remainingDue > 0) {
    doc.setTextColor(220, 38, 38); // red-600
    doc.text('Remaining Due:', margin + 10, yPosition);
    doc.text(`${remainingDue.toLocaleString()} BDT`, pageWidth - margin - 60, yPosition);
  } else {
    doc.setTextColor(34, 197, 94); // green-500
    doc.text('Status: PAID IN FULL', margin + 10, yPosition);
  }

  // Footer
  const footerY = doc.internal.pageSize.height - 30;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(128, 128, 128);
  // doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, footerY);
  // doc.text('SUNRISE Education Institute', pageWidth - margin - 60, footerY);

  // Generate filename and download
  const fileName = `student_${student.name?.replace(/\s+/g, '_')}_${student.id}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
};
