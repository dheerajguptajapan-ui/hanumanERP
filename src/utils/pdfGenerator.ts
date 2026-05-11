import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { db } from '../db';

export async function generateDocumentPDF(docType: string, data: any, returnMode: 'download' | 'blob' = 'download') {
  console.log('Generating PDF:', docType, returnMode);
  const settings = await db.settings.toCollection().first();
  if (!settings) return null;

  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4'
  });

  const themeColor = settings.pdfColor || '#3b82f6';
  const logo = settings.logoUrl;
  const template = settings.pdfTemplate || 'standard';
  
  // Fetch partner details if not provided
  let partner = null;
  if (data.customerId) {
    partner = await db.partners.get(data.customerId);
  }

  // Render based on template
  const t = template.toString().toLowerCase();
  
  if (t === 'standard-japanese') renderJapaneseTemplate(doc, docType, data, settings, themeColor, logo, partner, true);
  else if (t === 'standard-japanese-no-seal') renderJapaneseTemplate(doc, docType, data, settings, themeColor, logo, partner, false);
  else if (t === 'standard-european') renderEuropeanTemplate(doc, docType, data, settings, themeColor, logo, partner);
  else if (t.startsWith('spreadsheet')) renderSpreadsheetTemplate(doc, docType, data, settings, themeColor, logo, partner, t);
  else if (t.startsWith('modern') || t === 'minimalist' || t === 'grand' || t === 'continental') renderModernTemplate(doc, docType, data, settings, themeColor, logo, partner, t);
  else if (t === 'elegant' || t === 'classic' || t === 'times' || t === 'royal' || t === 'boutique') renderElegantTemplate(doc, docType, data, settings, themeColor, logo, partner, t);
  else if (t === 'professional' || t === 'formal' || t === 'executive' || t === 'corporate' || t === 'legal') renderProfessionalTemplate(doc, docType, data, settings, themeColor, logo, partner, t);
  else if (t === 'service' || t === 'simple' || t === 'hourly' || t === 'project' || t === 'tech') renderServiceTemplate(doc, docType, data, settings, themeColor, logo, partner, t);
  else if (t === 'compact' || t === 'lite') renderCompactTemplate(doc, docType, data, settings, themeColor, logo, partner);
  else renderStandardTemplate(doc, docType, data, settings, themeColor, logo, partner);

  // Footer text
  if (settings.showBranding !== false) {
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Computer Generated Document', 105, pageHeight - 10, { align: 'center' });
  }
  
  if (returnMode === 'blob') {
    const blob = doc.output('blob');
    return URL.createObjectURL(blob);
  }

  doc.save(`${docType.replace(/\s+/g, '_')}_${data.id}.pdf`);
}

function renderStandardTemplate(doc: any, docType: string, data: any, settings: any, themeColor: string, logo: string | null, partner: any) {
  doc.setFillColor(themeColor);
  doc.rect(0, 0, 210, 45, 'F');
  
  let headerX = 15;
  if (logo) {
    doc.addImage(logo, 'PNG', 15, 8, 25, 25);
    headerX = 45;
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(settings?.shopName || 'HARDWARE ERP', headerX, 18);

  doc.setFontSize(18);
  doc.text(docType.toUpperCase(), 200, 20, { align: 'right' });
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const addrLines = (settings?.shopAddress || '').split('\n');
  let addrY = 28;
  addrLines.forEach((line: string) => {
    if (line.trim()) {
      doc.text(line, headerX, addrY);
      addrY += 4;
    }
  });
  doc.text(`Phone: ${settings?.shopPhone || ''} | Email: ${settings?.shopEmail || ''}`, headerX, addrY + 2);

  renderCommonBody(doc, docType, data, settings, themeColor, 50, partner);
}

function renderJapaneseTemplate(doc: any, docType: string, data: any, settings: any, themeColor: string, logo: string | null, partner: any, showSeals: boolean) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text(docType.toUpperCase(), 105, 20, { align: 'center' });
  
  if (logo) doc.addImage(logo, 'PNG', 15, 10, 25, 25);

  doc.setFontSize(10);
  doc.text('Date:', 160, 20);
  doc.text(new Date(data.date).toLocaleDateString(), 195, 20, { align: 'right' });

  // Right side info (Company)
  doc.setFontSize(11);
  doc.text(settings?.shopName || 'HARDWARE ERP', 195, 35, { align: 'right' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const addrLines = (settings?.shopAddress || '').split('\n');
  let addrY = 40;
  addrLines.forEach((line: string) => {
    doc.text(line, 195, addrY, { align: 'right' });
    addrY += 4;
  });

  // Seal boxes if requested
  if (showSeals) {
    const sealX = 140;
    const sealY = addrY + 5;
    [0, 1, 2].forEach(i => {
       doc.rect(sealX + (i * 15), sealY, 15, 15);
    });
  }

  // Left side info (Customer)
  doc.setFontSize(11);
  doc.text(`${partner?.name || data.customerName || 'Customer'} Sama`, 15, logo ? 40 : 35);
  doc.setLineWidth(0.5);
  doc.line(15, logo ? 42 : 37, 80, logo ? 42 : 37);

  renderCommonBody(doc, docType, data, settings, themeColor, 80, partner);
}

function renderEuropeanTemplate(doc: any, docType: string, data: any, settings: any, themeColor: string, logo: string | null, partner: any) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(themeColor);
  
  if (logo) {
    doc.addImage(logo, 'PNG', 15, 15, 25, 25);
    doc.text(docType.toUpperCase(), 45, 30);
  } else {
    doc.text(docType.toUpperCase(), 15, 25);
  }
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Number: ${data.id}`, 15, 45);
  doc.text(`Date: ${new Date(data.date).toLocaleDateString()}`, 15, 50);

  doc.line(15, 55, 195, 55);

  renderCommonBody(doc, docType, data, settings, themeColor, 65, partner);
}

function renderSpreadsheetTemplate(doc: any, docType: string, data: any, settings: any, themeColor: string, logo: string | null, partner: any, subStyle: string) {
  doc.setFillColor(240, 240, 240);
  doc.rect(0, 0, 210, 297, 'F');
  doc.setFillColor(255, 255, 255);
  doc.rect(10, 10, 190, 277, 'F');
  
  if (logo) doc.addImage(logo, 'PNG', 15, 15, 20, 20);

  doc.setFontSize(20);
  doc.setTextColor(themeColor);
  doc.text(docType.toUpperCase(), logo ? 40 : 15, 25);
  
  renderCommonBody(doc, docType, data, settings, themeColor, 50, partner);
}

function renderModernTemplate(doc: any, docType: string, data: any, settings: any, themeColor: string, logo: string | null, partner: any, subStyle: string) {
  doc.setFillColor(themeColor);
  doc.rect(0, 0, 70, 297, 'F');
  
  if (logo) doc.addImage(logo, 'PNG', 15, 15, 40, 40);
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text(docType.toUpperCase(), 15, 70);
  
  doc.setFontSize(10);
  doc.text(`# ${data.id}`, 15, 80);
  
  doc.setTextColor(0, 0, 0);
  renderCommonBody(doc, docType, data, settings, themeColor, 40, partner, 80);
}

function renderProfessionalTemplate(doc: any, docType: string, data: any, settings: any, themeColor: string, logo: string | null, partner: any, subStyle: string) {
  doc.setFillColor(themeColor);
  let headerX = 10;
  if (logo) {
    try {
      const format = logo.includes('image/png') ? 'PNG' : 'JPEG';
      doc.addImage(logo, format, 10, 10, 25, 25);
      headerX = 40;
    } catch (e) {
      console.warn('Could not add logo:', e);
    }
  }
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(22);
  doc.text(settings?.shopName || 'HARDWARE ERP', headerX, 22);
  doc.setFontSize(24);
  doc.setTextColor(themeColor);
  doc.text(docType.toUpperCase(), 200, 25, { align: 'right' });
  renderCommonBody(doc, docType, data, settings, themeColor, 50, partner);
}

function renderElegantTemplate(doc: any, docType: string, data: any, settings: any, themeColor: string, logo: string | null, partner: any, subStyle: string) {
  if (logo) doc.addImage(logo, 'PNG', 15, 10, 20, 20);
  
  doc.setFont('times', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(themeColor);
  doc.text(settings?.shopName || 'HARDWARE ERP', 105, 30, { align: 'center' });
  renderCommonBody(doc, docType, data, settings, themeColor, 60, partner);
}

function renderServiceTemplate(doc: any, docType: string, data: any, settings: any, themeColor: string, logo: string | null, partner: any, subStyle: string) {
  if (logo) doc.addImage(logo, 'PNG', 15, 10, 20, 20);
  doc.setFontSize(20);
  doc.text(settings?.shopName || 'SERVICE PROVIDER', logo ? 40 : 15, 20);
  doc.setFillColor(themeColor);
  doc.rect(140, 10, 60, 25, 'F');
  doc.setTextColor(255, 255, 255);
  doc.text(docType.toUpperCase(), 170, 20, { align: 'center' });
  renderCommonBody(doc, docType, data, settings, themeColor, 45, partner);
}

function renderCompactTemplate(doc: any, docType: string, data: any, settings: any, themeColor: string, logo: string | null, partner: any) {
   if (logo) doc.addImage(logo, 'PNG', 15, 5, 15, 15);
   doc.setFontSize(10);
   doc.text(docType.toUpperCase(), logo ? 35 : 15, 12);
   doc.text(settings?.shopName || 'HARDWARE ERP', 195, 12, { align: 'right' });
   renderCommonBody(doc, docType, data, settings, themeColor, 25, partner);
}

function renderCommonBody(doc: any, docType: string, data: any, settings: any, themeColor: string, startY: number, partner: any, startX: number = 15) {
  let currentY = startY;

  // Header Info
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', startX, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(partner?.name || data.customerName || 'Customer', startX, currentY + 5);
  
  if (partner) {
    const addrLines = [
      partner.billingLine1,
      partner.billingLine2,
      [partner.billingCity, partner.billingState, partner.billingPincode].filter(Boolean).join(', ')
    ].filter(Boolean);
    
    addrLines.forEach((line, i) => {
      doc.text(line, startX, currentY + 10 + (i * 4));
    });
    currentY += 10 + (addrLines.length * 4);
  } else {
    currentY += 15;
  }

  // Items Table
  const tableData = (data.items || []).map((item: any, index: number) => [
    index + 1,
    item.productName,
    item.hsnCode || '-',
    item.quantity.toString(),
    `Rs. ${item.price.toLocaleString()}`,
    item.gstRate ? `${item.gstRate}%` : '-',
    `Rs. ${item.total.toLocaleString()}`
  ]);

  (doc as any).autoTable({
    startY: currentY + 5,
    head: [['#', 'Item Description', 'HSN', 'Qty', 'Rate', 'GST', 'Amount']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: themeColor, textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 20 },
      3: { cellWidth: 15, halign: 'right' },
      4: { cellWidth: 25, halign: 'right' },
      5: { cellWidth: 15, halign: 'right' },
      6: { cellWidth: 30, halign: 'right' }
    },
    didDrawPage: (data: any) => {
        currentY = data.cursor.y;
    }
  });

  // Totals
  currentY = (doc as any).lastAutoTable.finalY + 10;
  
  const rightX = 195;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  
  const totals = [
    { label: 'Sub Total', value: data.subtotal || data.totalAmount },
    { label: 'Tax', value: data.totalGst || (data.cgst + data.sgst + data.igst) },
    { label: 'Discount', value: data.discount || 0 },
    { label: 'Total', value: data.total || data.totalAmount, isGrand: true }
  ];

  totals.forEach(item => {
    if (item.isGrand) {
      doc.setFontSize(12);
      doc.setTextColor(themeColor);
    } else {
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
    }
    
    doc.text(item.label, 130, currentY);
    doc.text(`Rs. ${(item.value || 0).toLocaleString()}`, rightX, currentY, { align: 'right' });
    currentY += 6;
  });

  const pageHeight = doc.internal.pageSize.height;
  let y = Math.max(currentY + 20, pageHeight - 60);

  if (y > pageHeight - 40) {
    doc.addPage();
    y = 30;
  }

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  if (settings.organizationName) {
    doc.text(`For ${settings.organizationName}`, 195, y, { align: 'right' });
  }
  
  if (settings?.companySealBase64) {
    try {
      doc.addImage(settings.companySealBase64, 'PNG', 165, y + 2, 25, 25);
    } catch (e) {
      console.error('Could not add company seal to PDF', e);
    }
  }
  
  doc.line(140, currentY + 30, 195, currentY + 30);
  doc.setFontSize(8);
  doc.text('Authorized Signatory', 167.5, currentY + 34, { align: 'center' });
}
