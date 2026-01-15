import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

// Colors
const COLOR_CHARCOAL = '#2D2D2D';
const COLOR_GOLD = '#e3c73d';
const COLOR_WHITE = '#FFFFFF';
const COLOR_ROSE_RED = '#a0616a';
const COLOR_CREAM = '#F9F7F2';

// Font Setup
// We need to fetch the font file from the public directory
const loadFont = async (url) => {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    return arrayBufferToBase64(buffer);
};

const arrayBufferToBase64 = (buffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
};

// Helper: Draw Background with Border
const drawCardBackground = (doc, width, height) => {
    // 1. Fill Charcoal Background
    doc.setFillColor(COLOR_CHARCOAL);
    doc.rect(0, 0, width, height, 'F');

    // 2. Draw Gold Border
    // Margin 5mm, Stroke 1mm
    doc.setDrawColor(COLOR_GOLD);
    doc.setLineWidth(1);
    const borderMargin = 6;
    doc.roundedRect(borderMargin, borderMargin, width - (borderMargin * 2), height - (borderMargin * 2), 3, 3, 'S');
};

const addVendorCard = async (doc, vendor, isFirstPage, domainUrl) => {
    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();

    if (!isFirstPage) doc.addPage();

    // --- FRONT PAGE ---
    drawCardBackground(doc, width, height);

    // "MAJISA" Heading - Using Standard Serif (Times)
    doc.setTextColor(COLOR_GOLD);
    doc.setFont("times", "bold"); // Standard Serif
    doc.setFontSize(36); // Slightly larger for impact
    doc.text("MAJISA", width / 2, 45, { align: 'center' });

    // QR Code Box
    // Center Box: White/Cream Background + Gold Border
    const boxSize = 65;
    const boxX = (width - boxSize) / 2;
    const boxY = 60;

    doc.setFillColor(COLOR_CREAM);
    doc.setDrawColor(COLOR_GOLD);
    doc.setLineWidth(1);
    doc.roundedRect(boxX, boxY, boxSize, boxSize, 2, 2, 'FD'); // Fill + Draw

    // Generate QR
    const vendorCode = vendor.referralCode || vendor.username || 'N/A';
    const visitUrl = `${domainUrl}/shop?ref=${vendorCode}`;
    const qrCodeDataUrl = await QRCode.toDataURL(visitUrl, {
        errorCorrectionLevel: 'H',
        margin: 0,
        color: { dark: COLOR_CHARCOAL, light: COLOR_CREAM }
    });

    // Place QR inside box
    const qrSize = 55;
    const qrX = boxX + (boxSize - qrSize) / 2;
    const qrY = boxY + (boxSize - qrSize) / 2;
    doc.addImage(qrCodeDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

    // "SCAN TO VISIT"
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(COLOR_ROSE_RED);
    doc.text("SCAN TO VISIT", width / 2, boxY + boxSize + 8, { align: 'center', charSpace: 1.5 });

    // "VENDOR CODE" Label
    doc.setFontSize(8);
    doc.setTextColor(COLOR_ROSE_RED);
    doc.text("VENDOR CODE", width / 2, 160, { align: 'center', charSpace: 1 });

    // Actual Vendor Code
    doc.setFont("times", "bold");
    doc.setFontSize(22);
    doc.setTextColor(COLOR_GOLD);
    doc.text(vendorCode, width / 2, 172, { align: 'center' });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor('#6a5c36'); // Dim Gold
    doc.text("Tap to view credentials", width / 2, 182, { align: 'center' });


    // --- BACK PAGE ---
    doc.addPage();
    drawCardBackground(doc, width, height);

    // Heading
    doc.setFont("times", "bold");
    doc.setFontSize(28);
    doc.setTextColor(COLOR_GOLD);
    doc.text("MAJISA", width / 2, 35, { align: 'center' });

    // Subheading
    doc.setFont("helvetica", "normal"); // Keeping clean
    doc.setFontSize(14);
    doc.setTextColor(COLOR_ROSE_RED);
    doc.text("Vendor Login", width / 2, 85, { align: 'center', charSpace: 1 });

    // Username Label
    doc.setFontSize(9);
    doc.setTextColor(COLOR_ROSE_RED);
    doc.text("USERNAME", width / 2, 105, { align: 'center', charSpace: 1 });

    // Username Value
    doc.setFont("times", "bold");
    doc.setFontSize(18);
    doc.setTextColor(COLOR_GOLD);
    doc.text(vendor.username || '-----', width / 2, 115, { align: 'center' });

    // Divider Line
    doc.setDrawColor(COLOR_GOLD);
    doc.setLineWidth(0.2);
    doc.line(width / 2 - 30, 125, width / 2 + 30, 125);

    // Password Label
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(COLOR_ROSE_RED);
    doc.text("PASSWORD", width / 2, 140, { align: 'center', charSpace: 1 });

    // Password Value (Masked)
    doc.setFont("times", "bold");
    doc.setFontSize(18);
    doc.setTextColor(COLOR_GOLD);
    const passwordText = 'Set via Secure Channel';
    // If we wanted to show a temp password, we could: vendor.tempPassword || '***'
    doc.text(passwordText, width / 2, 150, { align: 'center' });

    // Security Warning at bottom
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8); // Increased slightly for readability
    doc.setTextColor('#665c3b'); // Darker Gold/Brown
    doc.text("Keep this information secure", width / 2, height - 15, { align: 'center' });
};

export const generateVendorCardPDF = async (vendor, domainUrl = window.location.origin) => {
    try {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a5'
        });

        // Load Font
        let fontBase64 = null;
        try {
            fontBase64 = await loadFont('/fonts/Mosseta-Regular.otf');
        } catch (e) {
            console.warn("Could not load custom font, falling back to standard.", e);
        }

        await addVendorCard(doc, vendor, fontBase64, true, domainUrl);
        doc.save(`Majisa_Card_${vendor.name.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
        console.error("Single PDF Generation Failed:", error);
        alert("Failed to generate PDF.");
    }
};

export const generateAllVendorsPDF = async (vendors, domainUrl = window.location.origin) => {
    if (!vendors || vendors.length === 0) return;

    try {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a5'
        });

        let fontBase64 = null;
        try {
            fontBase64 = await loadFont('/fonts/Mosseta-Regular.otf');
        } catch (e) {
            console.warn("Font load failed", e);
        }

        for (let i = 0; i < vendors.length; i++) {
            await addVendorCard(doc, vendors[i], i === 0, domainUrl);
        }

        doc.save('Majisa_All_Vendor_Cards.pdf');
    } catch (error) {
        console.error("Batch PDF Generation Failed:", error);
        alert("Failed to generate Batch PDF.");
    }
};
