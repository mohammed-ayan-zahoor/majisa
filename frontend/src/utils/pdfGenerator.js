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
    const visitUrl = `${domainUrl}/shop?ref=${encodeURIComponent(vendorCode)}`; const qrCodeDataUrl = await QRCode.toDataURL(visitUrl, {
        errorCorrectionLevel: 'H',
        margin: 0,
        color: { dark: COLOR_CHARCOAL, light: '#F9F7F2' }
    });

    // QR Code - Adjusted Position
    // The box is nearly central. 
    // Moving QR down to fit inside the gold box better.
    const qrSize = 45; // Reduced size slightly to fit comfortably
    const qrX = (width - qrSize) / 2;
    const qrY = 70; // Pushed down from 62
    doc.addImage(qrCodeDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

    // Vendor Code Text
    doc.setTextColor(COLOR_WHITE);
    doc.setFontSize(12); // Slightly smaller
    doc.setFont('helvetica', 'normal');
    // Position below "Vendor Code" label
    // The design has "Vendor Code" text at bottom. We place the actual code below it.
    doc.text(vendorCode, width / 2, 148, { align: 'center' }); // Pushed down from 142

    // --- BACK PAGE ---
    doc.addPage();
    doc.addImage(backBg, 'PNG', 0, 0, width, height);

    // Credentials
    doc.setTextColor(COLOR_WHITE);
    doc.setFontSize(11); // Smaller font for fields
    doc.setFont('text', 'normal'); // Use standard font

    // Username Field - Adjusted to fall INTO the box
    // Box 1 is approx at Y=85-95 range based on visual 
    const usernameY = 88; // Adjusted from 75
    doc.text(vendor.username || '-----', width / 2, usernameY, { align: 'center' });

    // Password Field
    const passwordY = 118; // Adjusted from 105 to fall into second box
    // MASKED PASSWORD for Security
    const passwordText = 'Set via Secure Channel';
    doc.text(passwordText, width / 2, passwordY, { align: 'center' });

    // Security Warning
    doc.setFontSize(8);
    doc.setTextColor('#a0616a'); // Rose Goldish Red for warning
    doc.text("SECURITY WARNING: Keep credentials safe. Reset password on first login.", width / 2, 150, { align: 'center' });
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
        const vendorName = vendor.name || vendor.username || 'Unknown';
        doc.save(`Majisa_Card_${vendorName.replace(/\s+/g, '_')}.pdf`);
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
