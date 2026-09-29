import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

interface ExportOptions {
  fileName: string;
  scale?: number;
  backgroundColor?: string;
}

export interface PDFExportOptions {
  fileName: string;
  pdfType: 'pvc_card' | 'a4_certificate';
  scale?: number;
  backgroundColor?: string;
}

/**
 * Capture DOM element as high-res PNG Data URL using html-to-image.
 * Renders in a standardized desktop-dimension sandbox so mobile viewports never cut off or wrap cards/certificates.
 * Uses an onscreen calibrated sandbox layer with a sleek loading curtain to guarantee 100% full-bleed capture.
 */
async function captureElementDataUrl(
  element: HTMLElement,
  scale: number = 2.5,
  backgroundColor: string = '#ffffff'
): Promise<string> {
  const isCertificate =
    element.id.includes('certificate') ||
    element.scrollWidth > 600;

  // Exact standardized master dimensions (A4 Landscape: 840 x 594, CR80 ID Card: 470 x 296)
  const targetWidth = isCertificate ? 840 : 470;
  const targetHeight = isCertificate ? 594 : (element.scrollHeight > 250 ? element.scrollHeight : 296);

  // 1. Create a sleek user loading curtain to prevent any visual jumps while rendering offscreen
  const overlay = document.createElement('div');
  overlay.id = '__export_rendering_curtain__';
  overlay.style.position = 'fixed';
  overlay.style.inset = '0';
  overlay.style.zIndex = '99999';
  overlay.style.backgroundColor = 'rgba(15, 23, 42, 0.88)';
  overlay.style.backdropFilter = 'blur(4px)';
  overlay.style.display = 'flex';
  overlay.style.flexDirection = 'column';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.color = '#ffffff';
  overlay.style.fontFamily = 'system-ui, -apple-system, sans-serif';
  overlay.innerHTML = `
    <div style="background: #12294A; border: 2px solid #E86A17; border-radius: 16px; padding: 24px 28px; text-align: center; max-width: 340px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.6);">
      <div style="width: 44px; height: 44px; border: 4px solid #E86A17; border-top-color: transparent; border-radius: 50%; margin: 0 auto 14px; animation: __spin_anim 0.9s linear infinite;"></div>
      <div style="font-weight: 800; font-size: 15px; margin-bottom: 4px; color: #ffffff;">Generating High-Definition File</div>
      <div style="font-size: 12px; color: #cbd5e1; line-height: 1.4;">Rendering 100% full dimensions without mobile screen cutoff...</div>
    </div>
    <style>@keyframes __spin_anim { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
  `;
  document.body.appendChild(overlay);

  // 2. Create the calibrated full-desktop dimensions sandbox container
  const sandbox = document.createElement('div');
  sandbox.id = '__export_sandbox_container__';
  sandbox.style.position = 'fixed';
  sandbox.style.top = '0';
  sandbox.style.left = '0';
  sandbox.style.width = `${targetWidth}px`;
  sandbox.style.minWidth = `${targetWidth}px`;
  sandbox.style.maxWidth = `${targetWidth}px`;
  sandbox.style.height = `${targetHeight}px`;
  sandbox.style.minHeight = `${targetHeight}px`;
  sandbox.style.maxHeight = `${targetHeight}px`;
  sandbox.style.overflow = 'visible';
  sandbox.style.zIndex = '99990';
  sandbox.style.backgroundColor = backgroundColor;
  sandbox.style.pointerEvents = 'none';

  // 3. Clone element into the desktop sandbox
  const clone = element.cloneNode(true) as HTMLElement;
  clone.id = `${element.id}-export-clone`;
  clone.style.width = `${targetWidth}px`;
  clone.style.minWidth = `${targetWidth}px`;
  clone.style.maxWidth = `${targetWidth}px`;
  clone.style.height = `${targetHeight}px`;
  clone.style.minHeight = `${targetHeight}px`;
  clone.style.maxHeight = `${targetHeight}px`;
  clone.style.transform = 'none';
  clone.style.margin = '0';
  clone.style.boxShadow = 'none';
  clone.style.position = 'relative';

  // Ensure all cloned img elements preserve identical src and crossOrigin
  const originalImages = element.querySelectorAll('img');
  const cloneImages = clone.querySelectorAll('img');
  originalImages.forEach((origImg, idx) => {
    if (cloneImages[idx]) {
      cloneImages[idx].src = origImg.src;
      cloneImages[idx].crossOrigin = origImg.crossOrigin;
    }
  });

  sandbox.appendChild(clone);
  document.body.appendChild(sandbox);

  // Ensure all images are completely loaded and decoded
  await Promise.all(
    Array.from(clone.querySelectorAll('img')).map((img) => {
      if (img.complete) return Promise.resolve(true);
      return new Promise((resolve) => {
        img.onload = () => resolve(true);
        img.onerror = () => resolve(true);
        setTimeout(() => resolve(true), 600);
      });
    })
  );

  // Short delay for browser reflow, CSS styling, and paint
  await new Promise((r) => setTimeout(r, 120));

  try {
    const dataUrl = await toPng(clone, {
      pixelRatio: scale,
      backgroundColor,
      cacheBust: false, // Critical: never cache-bust data: URLs or base64 QR codes
      skipFonts: false,
      width: targetWidth,
      height: targetHeight,
      canvasWidth: Math.round(targetWidth * scale),
      canvasHeight: Math.round(targetHeight * scale),
      filter: (node) => {
        if (node instanceof HTMLElement && node.classList.contains('print:hidden')) {
          return false;
        }
        return true;
      },
    });
    return dataUrl;
  } catch (err) {
    console.warn('Sandbox export failed, attempting unconstrained element capture:', err);
    // Secondary fallback: reset scroll and temporarily unconstrain
    const parent = element.parentElement;
    const prevScroll = parent ? parent.scrollLeft : 0;
    if (parent) parent.scrollLeft = 0;

    try {
      return await toPng(element, {
        pixelRatio: scale,
        backgroundColor,
        cacheBust: false,
        skipFonts: false,
        width: targetWidth,
        height: targetHeight,
        canvasWidth: Math.round(targetWidth * scale),
        canvasHeight: Math.round(targetHeight * scale),
        style: {
          transform: 'none',
          width: `${targetWidth}px`,
          maxWidth: 'none',
          minWidth: `${targetWidth}px`,
        },
      });
    } finally {
      if (parent) parent.scrollLeft = prevScroll;
    }
  } finally {
    if (overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }
    if (sandbox.parentNode) {
      sandbox.parentNode.removeChild(sandbox);
    }
  }
}

/**
 * High-fidelity image exporter compatible with Tailwind CSS v4.
 */
export async function downloadElementAsPNG(
  element: HTMLElement,
  options: ExportOptions
): Promise<{ success: boolean; dataUrl?: string; error?: string }> {
  const { fileName, scale = 2.5, backgroundColor = '#ffffff' } = options;
  try {
    const dataUrl = await captureElementDataUrl(element, scale, backgroundColor);
    triggerBrowserBlobDownload(dataUrl, fileName, 'image/png');
    return { success: true, dataUrl };
  } catch (err: unknown) {
    console.error('All PNG export attempts failed:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'PNG export failed',
    };
  }
}

/**
 * Generates and downloads a real, printable PDF file:
 * - For 'pvc_card': Standard CR80 PVC dimensions (85.6mm x 54mm) + A4 print sheet with cut guidelines
 * - For 'a4_certificate': Standard A4 Landscape (297mm x 210mm)
 */
export async function downloadElementAsPDF(
  element: HTMLElement,
  options: PDFExportOptions
): Promise<{ success: boolean; pdfBlobUrl?: string; error?: string }> {
  const { fileName, pdfType, scale = 3, backgroundColor = '#ffffff' } = options;
  try {
    const imgDataUrl = await captureElementDataUrl(element, scale, backgroundColor);
    let doc: jsPDF;

    if (pdfType === 'pvc_card') {
      // Page 1: Exact Standard CR80 PVC Card Dimensions (85.6mm x 54.0mm)
      // Calibrated for thermal PVC card printers
      doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [85.6, 54.0],
      });
      doc.addImage(imgDataUrl, 'PNG', 0, 0, 85.6, 54.0);

      // Page 2: Standard A4 Print Sheet with Card Centered and Cutting Guides
      doc.addPage('a4', 'portrait');
      doc.setFontSize(13);
      doc.setTextColor(18, 41, 74);
      doc.text('SidTech Technologies - Official PVC Card Print Sheet', 105, 20, { align: 'center' });
      
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text('Print Settings: 100% Scale (Actual Size / Do Not Fit to Page) | Standard CR80: 85.6 mm x 54.0 mm', 105, 26, { align: 'center' });

      // Centered Card on A4 (A4 is 210mm wide x 297mm high)
      const cardX = (210 - 85.6) / 2; // ~62.2 mm
      const cardY = 45; // mm

      // Card boundary & crop marks
      doc.setDrawColor(232, 106, 23); // SidTech Orange
      doc.setLineWidth(0.5);
      doc.rect(cardX - 0.5, cardY - 0.5, 86.6, 55.0);
      doc.addImage(imgDataUrl, 'PNG', cardX, cardY, 85.6, 54.0);

      // Crop mark labels
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('✂ Cut along the orange border for standard PVC card slot', 105, cardY + 59, { align: 'center' });
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('Page 1 of this PDF contains the direct CR80 dimension for specialized card printer machines.', 105, cardY + 68, { align: 'center' });
    } else {
      // Standard A4 Landscape Certificate (297mm x 210mm)
      doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });
      // Margin around certificate for border padding
      doc.addImage(imgDataUrl, 'PNG', 8, 8, 281, 194);
    }

    const pdfBlob = doc.output('blob');
    const pdfBlobUrl = URL.createObjectURL(pdfBlob);

    // Trigger instant browser download
    const link = document.createElement('a');
    link.href = pdfBlobUrl;
    link.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
    }, 2000);

    return { success: true, pdfBlobUrl };
  } catch (err: unknown) {
    console.error('PDF export failed:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'PDF generation failed',
    };
  }
}

function triggerBrowserBlobDownload(dataUrl: string, fileName: string, mimeType: string = 'image/png') {
  try {
    const arr = dataUrl.split(',');
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    const blob = new Blob([u8arr], { type: mimeType });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    }, 2000);
  } catch {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fileName;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
    }, 500);
  }
}
