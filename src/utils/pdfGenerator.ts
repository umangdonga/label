import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { OrderFormData } from '../types';

/**
 * Generates and downloads a high-resolution PDF file containing only the shipping label element.
 */
export async function generateAndDownloadPdf(
  labelElement: HTMLElement,
  orderData: OrderFormData
): Promise<void> {
  // Capture at 3x scale for crisp 300 DPI text printing on labels
  const canvas = await html2canvas(labelElement, {
    scale: 3,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: labelElement.scrollWidth,
    windowHeight: labelElement.scrollHeight,
  });

  const imgData = canvas.toDataURL('image/png');

  // Standard 4 x 6 inch label is ~101.6 mm x 152.4 mm
  // We calculate proportional height based on actual element aspect ratio
  const labelWidthMm = 100;
  const labelHeightMm = (canvas.height * labelWidthMm) / canvas.width;

  // Add 4mm border padding around the page for peel & stick / thermal printer margins
  const pdfWidth = labelWidthMm + 8;
  const pdfHeight = labelHeightMm + 8;

  const pdf = new jsPDF({
    orientation: pdfHeight >= pdfWidth ? 'portrait' : 'landscape',
    unit: 'mm',
    format: [pdfWidth, pdfHeight],
  });

  pdf.addImage(imgData, 'PNG', 4, 4, labelWidthMm, labelHeightMm, undefined, 'FAST');

  // Clean filename: e.g. shipping-label-John-Doe-2026-10-04.pdf
  const sanitizedName = (orderData.fullName || 'customer')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const dateStr = orderData.courierDispatchedDate || new Date().toISOString().split('T')[0];
  const filename = `shipping-label-${sanitizedName}-${dateStr}.pdf`;

  pdf.save(filename);
}
