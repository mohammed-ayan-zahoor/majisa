import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

// Colors
const COLOR_CHARCOAL = '#2D2D2D';
const COLOR_GOLD = '#e3c73d';
const COLOR_WHITE = '#FFFFFF';
const COLOR_ROSE_RED = '#a0616a';
const COLOR_CREAM = '#F9F7F2';

// Helper: Load Image and Recolor to Gold (Remove White BG)
const loadImage = async (url) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = url;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imgData.data;

            // RGBA values for Gold #e3c73d => (227, 199, 61)
            const rGold = 227;
            const gGold = 199;
            const bGold = 61;

            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                // const a = data[i + 3];

                // Simple threshold to detect "White" background
                // If pixel is bright enough, make it transparent
                if (r > 200 && g > 200 && b > 200) {
                    data[i + 3] = 0; // Alpha = 0 (Transparent)
                } else {
                    // It's part of the logo (Darker pixels) -> Color it Gold
                    data[i] = rGold;
                    data[i + 1] = gGold;
                    data[i + 2] = bGold;
                }
            }

            ctx.putImageData(imgData, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = reject;
    });
};

// Helper: Draw Background with Border
const drawCardBackground = (doc, width, height) => {
    // 1. Fill Charcoal Background
    doc.setFillColor(COLOR_CHARCOAL);
    doc.rect(0, 0, width, height, 'F');

    // 2. Draw Gold Border
    // Margin 6mm, Stroke 1mm
    doc.setDrawColor(COLOR_GOLD);
    doc.setLineWidth(1);
    const borderMargin = 6;
    doc.roundedRect(borderMargin, borderMargin, width - (borderMargin * 2), height - (borderMargin * 2), 3, 3, 'S');
};

const addVendorCard = async (doc, vendor, isFirstPage, domainUrl, logoDataUrl) => {
    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();

    if (!isFirstPage) doc.addPage();

    // --- FRONT PAGE ---
    drawCardBackground(doc, width, height);

    // LOGO - Top Center
    if (logoDataUrl) {
        const logoSize = 30; // 30mm nicely centered
        const logoX = (width - logoSize) / 2;
        doc.addImage(logoDataUrl, 'PNG', logoX, 20, logoSize, logoSize);
    }

    // "MAJISA" Heading
    doc.setTextColor(COLOR_GOLD);
    doc.setFont("times", "bold");
    doc.setFontSize(28);
    // Position below Logo (20 + 30 = 50, plus padding)
    doc.text("MAJISA", width / 2, 58, { align: 'center' });

    // QR Code Box
    const boxSize = 60; // Slightly reduced to fit better
    const boxX = (width - boxSize) / 2;
    const boxY = 70; // Pushed down

    doc.setFillColor(COLOR_CREAM);
    doc.setDrawColor(COLOR_GOLD);
    doc.setLineWidth(1);
    doc.roundedRect(boxX, boxY, boxSize, boxSize, 2, 2, 'FD');

    // Generate QR
    const vendorCode = vendor.referralCode || vendor.username || 'N/A';
    const visitUrl = `${domainUrl}/shop?ref=${vendorCode}`;
    const qrCodeDataUrl = await QRCode.toDataURL(visitUrl, {
        errorCorrectionLevel: 'H',
        margin: 0,
        color: { dark: COLOR_CHARCOAL, light: COLOR_CREAM }
    });

    // Place QR inside box
    const qrSize = 50;
    const qrX = boxX + (boxSize - qrSize) / 2;
    const qrY = boxY + (boxSize - qrSize) / 2;
    doc.addImage(qrCodeDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

    // "SCAN TO VISIT"
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(COLOR_ROSE_RED);
    doc.text("SCAN TO VISIT", width / 2, boxY + boxSize + 6, { align: 'center' });

    // "VENDOR CODE" Label
    doc.setFontSize(8);
    doc.setTextColor(COLOR_ROSE_RED);
    doc.text("VENDOR CODE", width / 2, 162, { align: 'center' });

    // Actual Vendor Code
    doc.setFont("times", "bold");
    doc.setFontSize(20);
    doc.setTextColor(COLOR_GOLD);
    doc.text(vendorCode, width / 2, 172, { align: 'center' });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor('#6a5c36'); // Dim Gold
    doc.text("Tap to view credentials", width / 2, 185, { align: 'center' });


    // --- BACK PAGE ---
    doc.addPage();
    drawCardBackground(doc, width, height);

    // LOGO - Top Center
    if (logoDataUrl) {
        const logoSize = 30;
        const logoX = (width - logoSize) / 2;
        doc.addImage(logoDataUrl, 'PNG', logoX, 20, logoSize, logoSize);
    }

    // Heading
    doc.setFont("times", "bold");
    doc.setFontSize(28);
    doc.setTextColor(COLOR_GOLD);
    doc.text("MAJISA", width / 2, 58, { align: 'center' });

    // Subheading
    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.setTextColor(COLOR_ROSE_RED);
    doc.text("Vendor Login", width / 2, 85, { align: 'center' });

    // Username Label
    doc.setFontSize(9);
    doc.setTextColor(COLOR_ROSE_RED);
    doc.text("USERNAME", width / 2, 105, { align: 'center' });

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
    doc.text("PASSWORD", width / 2, 140, { align: 'center' });

    // Password Field - Blank Line for Manual Entry
    doc.setDrawColor(COLOR_GOLD);
    doc.setLineWidth(0.2);
    doc.line(width / 2 - 30, 160, width / 2 + 30, 160);

    // Security Warning at bottom
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor('#665c3b');
    doc.text("Keep this information secure", width / 2, height - 15, { align: 'center' });
};

export const generateVendorCardPDF = async (vendor, domainUrl = window.location.origin) => {
    try {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a5'
        });

        // Load Logo
        let logoDataUrl = null;
        try {
            logoDataUrl = await loadImage('/logo.png');
        } catch (e) {
            console.warn("Logo load failed", e);
        }

        await addVendorCard(doc, vendor, true, domainUrl, logoDataUrl);
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

        // Load Logo (Once for the batch)
        let logoDataUrl = null;
        try {
            logoDataUrl = await loadImage('/logo.png');
        } catch (e) {
            console.warn("Logo load failed", e);
        }

        for (let i = 0; i < vendors.length; i++) {
            await addVendorCard(doc, vendors[i], i === 0, domainUrl, logoDataUrl);
        }

        doc.save('Majisa_All_Vendor_Cards.pdf');
    } catch (error) {
        console.error("Batch PDF Generation Failed:", error);
        alert("Failed to generate Batch PDF.");
    }
};
