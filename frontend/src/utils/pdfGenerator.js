import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

// Colors from tailwind config
const COLOR_GOLD = '#e3c73d';
const COLOR_CHARCOAL = '#2D2D2D';
const COLOR_WHITE = '#FFFFFF';

// Helper to load image
const loadImg = (src) => new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = reject;
});

// Helper to generate a single card page (Front + Back)
const addVendorCardToDoc = async (doc, vendor, frontBg, backBg, isFirstPage, domainUrl) => {
    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();

    // If not first page, add new page for Front
    if (!isFirstPage) doc.addPage();

    // --- FRONT PAGE ---
    doc.addImage(frontBg, 'PNG', 0, 0, width, height);

    // QR Code
    const vendorCode = vendor.referralCode || vendor.username || 'N/A';
    const visitUrl = `${domainUrl}/shop?ref=${vendorCode}`;
    const qrCodeDataUrl = await QRCode.toDataURL(visitUrl, {
        errorCorrectionLevel: 'H',
        margin: 0,
        color: { dark: COLOR_CHARCOAL, light: '#F9F7F2' }
    });

    const qrSize = 55; // mm
    const qrX = (width - qrSize) / 2;
    const qrY = 62; // mm
    doc.addImage(qrCodeDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

    // Vendor Code Text
    doc.setTextColor(COLOR_WHITE);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    // Approx position below "Vendor Code" label
    doc.text(vendorCode, width / 2, 142, { align: 'center' });

    // --- BACK PAGE ---
    doc.addPage();
    doc.addImage(backBg, 'PNG', 0, 0, width, height);

    // Credentials
    doc.setTextColor(COLOR_WHITE);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');

    // Username
    const usernameY = 75; // mm
    doc.text(vendor.username || '-----', width / 2, usernameY, { align: 'center' });

    // Password - Placeholder or Temp
    const passwordY = 105; // mm
    const passwordText = vendor.tempPassword || '******';
    doc.text(passwordText, width / 2, passwordY, { align: 'center' });
};

/**
 * Generates a PDF for a single vendor
 * @param {Object} vendor - Vendor object containing name, username, password, etc.
 * @param {string} domainUrl - The base domain URL (e.g., https://majisa.co.in)
 */
export const generateVendorCardPDF = async (vendor, domainUrl = window.location.origin) => {
    try {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a5'
        });

        const [frontBg, backBg] = await Promise.all([
            loadImg('/assets/cards/front.png'),
            loadImg('/assets/cards/back.png')
        ]);

        await addVendorCardToDoc(doc, vendor, frontBg, backBg, true, domainUrl);
        doc.save(`Majisa_Card_${vendor.name.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
        console.error("Single PDF Generation Failed:", error);
        alert("Failed to generate PDF. Check assets.");
    }
};

/**
 * Generates a single PDF containing cards for ALL vendors
 * @param {Array<Object>} vendors - Array of vendor objects
 * @param {string} domainUrl - The base domain URL (e.g., https://majisa.co.in)
 */
export const generateAllVendorsPDF = async (vendors, domainUrl = window.location.origin) => {
    if (!vendors || vendors.length === 0) return;

    try {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a5'
        });

        const [frontBg, backBg] = await Promise.all([
            loadImg('/assets/cards/front.png'),
            loadImg('/assets/cards/back.png')
        ]);

        for (let i = 0; i < vendors.length; i++) {
            await addVendorCardToDoc(doc, vendors[i], frontBg, backBg, i === 0, domainUrl);
        }

        doc.save('Majisa_All_Vendor_Cards.pdf');
    } catch (error) {
        console.error("Batch PDF Generation Failed:", error);
        alert("Failed to generate Batch PDF.");
    }
};
