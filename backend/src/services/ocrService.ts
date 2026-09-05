import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ParsedInvoiceData {
  partnerName?: string;
  partnerId?: number | null;
  invoiceNumber?: string;
  invoiceDate?: string;
  dueDate?: string;
  reference?: string;
  lines: {
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
  }[];
  subtotal?: number;
  taxAmount?: number;
  totalAmount?: number;
  confidenceScore: number;
  rawText: string;
}

export class OCRService {
  /**
   * Parse invoice text or simulated document data into structured draft invoice/bill fields
   */
  static async parseDocument(rawText: string): Promise<ParsedInvoiceData> {
    const text = rawText || '';
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

    let partnerName: string | undefined;
    let invoiceNumber: string | undefined;
    let invoiceDate: string | undefined;
    let dueDate: string | undefined;
    let reference: string | undefined;
    const extractedLines: { description: string; quantity: number; unitPrice: number; taxRate: number }[] = [];
    let detectedTotal: number | undefined;
    let detectedTax: number | undefined;

    // 1. Extract Invoice / Bill Number
    const invNumMatch = text.match(/(?:invoice|bill|tax invoice|ref)[\s#:]+([A-Z0-9\/-]{3,20})/i);
    if (invNumMatch) {
      invoiceNumber = invNumMatch[1].trim();
    } else {
      invoiceNumber = `DOC-${Date.now().toString().slice(-6)}`;
    }

    // 2. Extract Dates (YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY)
    const dateMatches = text.match(/\b(?:\d{4}[-\/]\d{1,2}[-\/]\d{1,2}|\d{1,2}[-\/]\d{1,2}[-\/]\d{4})\b/g);
    if (dateMatches && dateMatches.length > 0) {
      invoiceDate = this.normalizeDate(dateMatches[0]);
      if (dateMatches.length > 1) {
        dueDate = this.normalizeDate(dateMatches[1]);
      } else {
        // Default 30 days due
        dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      }
    } else {
      invoiceDate = new Date().toISOString().split('T')[0];
      dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    }

    // 3. Extract Totals
    const totalMatch = text.match(/(?:total|grand total|net amount|amount due)[\s:₹rs.]+([0-9,]+\.?[0-9]*)/i);
    if (totalMatch) {
      detectedTotal = parseFloat(totalMatch[1].replace(/,/g, ''));
    }

    const taxMatch = text.match(/(?:tax|gst|vat)[\s:₹rs.]+([0-9,]+\.?[0-9]*)/i);
    if (taxMatch) {
      detectedTax = parseFloat(taxMatch[1].replace(/,/g, ''));
    }

    // 4. Partner Detection: Check if any contact in database matches text
    const contacts = await prisma.contact.findMany({ where: { status: 'ACTIVE' } });
    let matchedContact = null;
    for (const contact of contacts) {
      if (text.toLowerCase().includes(contact.name.toLowerCase())) {
        matchedContact = contact;
        partnerName = contact.name;
        break;
      }
    }

    if (!partnerName && lines.length > 0) {
      // First prominent line often contains vendor name
      partnerName = lines[0].replace(/invoice|bill|receipt|tax/gi, '').trim();
      if (!partnerName) partnerName = 'Vendor / Supplier';
    }

    // 5. Line items parsing
    // Look for lines containing quantity and price numbers (e.g., "Office Desk 2 15000 30000" or "Chair x 5 @ 2000")
    for (const line of lines) {
      // Skip summary lines
      if (/total|subtotal|tax|gst|vat|balance|amount due|date|invoice/i.test(line)) continue;

      const numMatches = line.match(/\b\d+(?:\.\d+)?\b/g);
      if (numMatches && numMatches.length >= 2) {
        const qty = parseFloat(numMatches[0]);
        const price = parseFloat(numMatches[1]);
        const desc = line.replace(/[0-9.,₹@x]/g, '').trim() || 'Furniture Item';

        if (qty > 0 && price > 0 && desc.length >= 2) {
          extractedLines.push({
            description: desc,
            quantity: qty,
            unitPrice: price,
            taxRate: 18, // standard GST
          });
        }
      }
    }

    // If no line items extracted, create a single line from total
    if (extractedLines.length === 0) {
      extractedLines.push({
        description: 'Furniture & Fixtures Supply',
        quantity: 1,
        unitPrice: detectedTotal ? detectedTotal / 1.18 : 10000,
        taxRate: 18,
      });
    }

    // Calculate subtotal and tax
    let subtotal = 0;
    let taxAmount = 0;
    for (const line of extractedLines) {
      const lineSub = line.quantity * line.unitPrice;
      const lineTax = (lineSub * line.taxRate) / 100;
      subtotal += lineSub;
      taxAmount += lineTax;
    }

    const totalAmount = detectedTotal || subtotal + taxAmount;

    return {
      partnerName,
      partnerId: matchedContact ? matchedContact.id : null,
      invoiceNumber,
      invoiceDate,
      dueDate,
      reference,
      lines: extractedLines,
      subtotal: Number(subtotal.toFixed(2)),
      taxAmount: Number(taxAmount.toFixed(2)),
      totalAmount: Number(totalAmount.toFixed(2)),
      confidenceScore: matchedContact ? 95 : 82,
      rawText,
    };
  }

  private static normalizeDate(dateStr: string): string {
    try {
      const parts = dateStr.split(/[-\/]/);
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
      } else if (parts[2].length === 4) {
        // DD-MM-YYYY
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
      return new Date(dateStr).toISOString().split('T')[0];
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  }
}
