import { jsPDF } from 'jspdf';
import { OrderFormData } from '../types';

/**
 * Sanitizes and generates the exact filename requested: CustomerName_ProductName_Label.pdf
 */
export function getPdfFilename(customerName?: string, productName?: string): string {
  const cleanCustomer = (customerName || 'Customer')
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, '');

  const cleanProduct = (productName || 'Product')
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, '');

  const safeCustomer = cleanCustomer || 'Customer';
  const safeProduct = cleanProduct || 'Product';

  return `${safeCustomer}_${safeProduct}_Label.pdf`;
}

/**
 * Formats date into DD/MM/YYYY
 */
function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
  } catch {}
  return dateStr;
}

/**
 * Safely loads an image source into an HTMLImageElement with a timeout
 * to prevent hanging and ensure broad image format compatibility (PNG, JPG, WebP, SVG).
 */
function loadLogoElement(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (!src) {
      resolve(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const timer = setTimeout(() => {
      resolve(null);
    }, 1200);

    img.onload = () => {
      clearTimeout(timer);
      resolve(img);
    };
    img.onerror = () => {
      clearTimeout(timer);
      resolve(null);
    };
    img.src = src;
  });
}

export interface GeneratedPdfResult {
  filename: string;
  blobUrl: string;
  pdfDoc: jsPDF;
}

/**
 * Generates a clean, valid 4 x 6 inch portrait PDF directly with jsPDF
 * and triggers an automatic browser download using multiple cross-browser fallback methods.
 */
export async function generateAndDownloadPdf(
  orderData: OrderFormData
): Promise<GeneratedPdfResult> {
  if (!orderData) {
    throw new Error('Order data is missing');
  }

  // 4 x 6 inch portrait (72 pt per inch => 4 * 72 = 288 pt width, 6 * 72 = 432 pt height)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: [288, 432],
  });

  const pageW = 288;
  const pageH = 432;
  const margin = 12;

  const boxX = margin;
  const boxY = margin;
  const boxW = pageW - margin * 2; // 264 pt
  const boxH = pageH - margin * 2; // 408 pt

  // 1. OUTER BORDER (2pt solid black)
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(2);
  doc.rect(boxX, boxY, boxW, boxH);

  // 2. HEADER: BUSINESS NAME & LOGO
  const headerHeight = 52;
  const headerBottomY = boxY + headerHeight;

  // Header bottom border
  doc.setLineWidth(1.5);
  doc.line(boxX, headerBottomY, boxX + boxW, headerBottomY);

  // Business Name
  const bizName = (orderData.businessName || 'YOUR BUSINESS NAME').toUpperCase();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(0, 0, 0);

  // Limit business name width so it doesn't overlap logo
  const bizLines = doc.splitTextToSize(bizName, boxW - 85);
  doc.text(bizLines, boxX + 8, boxY + 20);

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(70, 70, 70);
  doc.text('PACKAGING & DELIVERY STICKER', boxX + 8, boxY + 38);
  doc.setTextColor(0, 0, 0);

  // Business Logo on the right
  if (orderData.businessLogo) {
    try {
      const imgElem = await loadLogoElement(orderData.businessLogo);
      if (imgElem && imgElem.naturalWidth > 0 && imgElem.naturalHeight > 0) {
        // Draw onto a temporary canvas to get a safe, guaranteed PNG
        const canvas = document.createElement('canvas');
        canvas.width = imgElem.naturalWidth;
        canvas.height = imgElem.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(imgElem, 0, 0);
          const safePngData = canvas.toDataURL('image/png');
          doc.addImage(
            safePngData,
            'PNG',
            boxX + boxW - 74,
            boxY + 7,
            66,
            38,
            undefined,
            'FAST'
          );
        } else {
          throw new Error('Canvas context not available');
        }
      } else {
        throw new Error('Image could not be loaded');
      }
    } catch {
      // Fallback clean logo box if format conversion fails
      doc.setLineWidth(1);
      doc.setDrawColor(180, 180, 180);
      doc.rect(boxX + boxW - 65, boxY + 12, 56, 28);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text('LOGO', boxX + boxW - 37, boxY + 29, { align: 'center' });
      doc.setTextColor(0, 0, 0);
      doc.setDrawColor(0, 0, 0);
    }
  } else {
    doc.setLineWidth(1);
    doc.setDrawColor(180, 180, 180);
    doc.rect(boxX + boxW - 65, boxY + 12, 56, 28);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text('LOGO', boxX + boxW - 37, boxY + 29, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    doc.setDrawColor(0, 0, 0);
  }

  // 3. SECTION: SHIP TO & IMMEDIATE ADDRESS
  const shipToStartY = headerBottomY;
  const shipToBottomY = boxY + 185;

  // Header row inside SHIP TO
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('SHIP TO:', boxX + 8, shipToStartY + 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 100, 100);
  doc.text('RECIPIENT', boxX + boxW - 8, shipToStartY + 14, { align: 'right' });
  doc.setTextColor(0, 0, 0);

  // Thin hairline separator
  doc.setLineWidth(0.5);
  doc.setDrawColor(0, 0, 0);
  doc.line(boxX + 8, shipToStartY + 18, boxX + boxW - 8, shipToStartY + 18);

  // Customer Full Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12.5);
  const nameLines = doc.splitTextToSize(orderData.fullName || '—', boxW - 16);
  doc.text(nameLines, boxX + 8, shipToStartY + 33);

  // Mobile
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text(`Mobile: ${orderData.mobileNumber || '—'}`, boxX + 8, shipToStartY + 47);

  // Dotted address line
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.5);
  doc.line(boxX + 8, shipToStartY + 54, boxX + boxW - 8, shipToStartY + 54);
  doc.setDrawColor(0, 0, 0);

  // Address lines (House, Society, Area, City/State/Pin)
  let addrY = shipToStartY + 66;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);

  const addressLines: string[] = [];
  if (orderData.houseFlatNo) addressLines.push(orderData.houseFlatNo);
  if (orderData.societyStreet) addressLines.push(orderData.societyStreet);
  if (orderData.areaLocality) addressLines.push(orderData.areaLocality);

  addressLines.forEach((line) => {
    const splitLines = doc.splitTextToSize(line, boxW - 16);
    doc.text(splitLines, boxX + 8, addrY);
    addrY += splitLines.length * 11;
  });

  // City, State - Pincode
  const cityStatePin = [
    [orderData.city, orderData.state].filter(Boolean).join(', '),
    orderData.pincode,
  ]
    .filter(Boolean)
    .join(' - ');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text(cityStatePin || '—', boxX + 8, Math.max(addrY + 3, shipToStartY + 118));

  // SHIP TO section bottom divider line
  doc.setLineWidth(1.5);
  doc.line(boxX, shipToBottomY, boxX + boxW, shipToBottomY);

  // 4. SECTION: ORDER ITEMS & DETAILS TABLE
  const tableStartY = shipToBottomY;

  // Title bar
  doc.setFillColor(242, 242, 242);
  doc.rect(boxX, tableStartY, boxW, 14, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('ORDER ITEMS & DETAILS', boxX + 8, tableStartY + 10);

  doc.setLineWidth(1);
  doc.line(boxX, tableStartY + 14, boxX + boxW, tableStartY + 14);

  // Table Column Headers
  const colHeaderY = tableStartY + 14;
  const colHeaderH = 14;
  doc.setFillColor(255, 255, 255);
  doc.rect(boxX, colHeaderY, boxW, colHeaderH, 'F');
  doc.line(boxX, colHeaderY + colHeaderH, boxX + boxW, colHeaderY + colHeaderH);

  // Column X positions
  const colQtyX = boxX + 130;
  const colPriceX = boxX + 175;
  const colTotalX = boxX + 215;

  // Vertical column dividers
  doc.line(colQtyX, colHeaderY, colQtyX, colHeaderY + colHeaderH);
  doc.line(colPriceX, colHeaderY, colPriceX, colHeaderY + colHeaderH);
  doc.line(colTotalX, colHeaderY, colTotalX, colHeaderY + colHeaderH);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('PRODUCT NAME', boxX + 6, colHeaderY + 10);
  doc.text('QTY', colQtyX + 22.5, colHeaderY + 10, { align: 'center' });
  doc.text('PRICE', colTotalX - 4, colHeaderY + 10, { align: 'right' });
  doc.text('TOTAL', boxX + boxW - 6, colHeaderY + 10, { align: 'right' });

  // Data Row
  const rowY = colHeaderY + colHeaderH;
  const rowH = 46;

  doc.line(boxX, rowY + rowH, boxX + boxW, rowY + rowH);
  doc.line(colQtyX, rowY, colQtyX, rowY + rowH);
  doc.line(colPriceX, rowY, colPriceX, rowY + rowH);
  doc.line(colTotalX, rowY, colTotalX, rowY + rowH);

  // Product Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  const prodLines = doc.splitTextToSize(orderData.productName || '—', colQtyX - boxX - 10);
  doc.text(prodLines, boxX + 6, rowY + 13);

  // Quantity
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text(String(orderData.quantity || '1'), colQtyX + 22.5, rowY + 16, { align: 'center' });

  // Unit Price & Total Calculation
  const unitPriceNum = Number(orderData.unitPrice) || 0;
  const qtyNum = Number(orderData.quantity) || 1;
  const totalPriceNum = unitPriceNum * qtyNum;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(
    unitPriceNum > 0 ? `Rs. ${unitPriceNum.toLocaleString('en-IN')}` : '—',
    colTotalX - 4,
    rowY + 16,
    { align: 'right' }
  );

  doc.setFont('helvetica', 'bold');
  doc.text(
    unitPriceNum > 0 ? `Rs. ${totalPriceNum.toLocaleString('en-IN')}` : '—',
    boxX + boxW - 6,
    rowY + 16,
    { align: 'right' }
  );

  // Total Amount Row (if unit price entered)
  const totalRowY = rowY + rowH;
  const totalRowH = 16;
  let tableBottomY = totalRowY;

  if (unitPriceNum > 0) {
    doc.setFillColor(248, 248, 248);
    doc.rect(boxX, totalRowY, boxW, totalRowH, 'F');
    doc.line(boxX, totalRowY + totalRowH, boxX + boxW, totalRowY + totalRowH);
    doc.line(colTotalX, totalRowY, colTotalX, totalRowY + totalRowH);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('TOTAL AMOUNT:', colTotalX - 6, totalRowY + 11, { align: 'right' });
    doc.setFontSize(8.5);
    doc.text(`Rs. ${totalPriceNum.toLocaleString('en-IN')}`, boxX + boxW - 6, totalRowY + 11, {
      align: 'right',
    });
    tableBottomY = totalRowY + totalRowH;
  }

  // 5. SECTION: PAYMENT & COURIER DISPATCHED DATE
  const paymentStartY = tableBottomY;
  const midX = boxX + boxW / 2;

  // Vertical divider between Payment and Dispatched
  doc.setLineWidth(1.5);
  doc.line(midX, paymentStartY, midX, boxY + boxH);

  // Left: Payment
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('PAYMENT:', boxX + 8, paymentStartY + 14);

  const isCod = orderData.payment === 'COD';
  if (isCod) {
    doc.setFillColor(0, 0, 0);
    doc.rect(boxX + 8, paymentStartY + 20, boxW / 2 - 16, 22, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('COD (COLLECT CASH)', boxX + boxW / 4, paymentStartY + 34, { align: 'center' });
    doc.setTextColor(0, 0, 0);
  } else {
    doc.setLineWidth(1.5);
    doc.setDrawColor(0, 0, 0);
    doc.rect(boxX + 8, paymentStartY + 20, boxW / 2 - 16, 22);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('PAID (PREPAID)', boxX + boxW / 4, paymentStartY + 34, { align: 'center' });
  }

  // Right: Courier Dispatched
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('COURIER DISPATCHED:', midX + 8, paymentStartY + 14);

  doc.setFontSize(10);
  doc.text(formatDate(orderData.courierDispatchedDate), midX + 8, paymentStartY + 33);

  // 6. GENERATE & TRIGGER DOWNLOAD
  const filename = getPdfFilename(orderData.fullName, orderData.productName);

  // Create Blob and Blob URL
  const blob = doc.output('blob');
  const blobUrl = URL.createObjectURL(blob);

  // Attempt automatic download
  try {
    const downloadLink = document.createElement('a');
    downloadLink.href = blobUrl;
    downloadLink.download = filename;
    downloadLink.setAttribute('download', filename);
    document.body.appendChild(downloadLink);
    downloadLink.click();
    setTimeout(() => {
      document.body.removeChild(downloadLink);
    }, 100);
  } catch (downloadErr) {
    console.warn('Anchor download fallback:', downloadErr);
    try {
      doc.save(filename);
    } catch (saveErr) {
      console.warn('doc.save fallback:', saveErr);
    }
  }

  return {
    filename,
    blobUrl,
    pdfDoc: doc,
  };
}
