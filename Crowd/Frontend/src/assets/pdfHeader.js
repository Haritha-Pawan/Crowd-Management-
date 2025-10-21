// /src/utils/pdfHeader.js
// Reusable business header for all PDFs in your app.

export const BUSINESS_INFO = {
  name: "CrowdFlow (SLIIT)",
  tagline: "Smart Event & Crowd Management",
  address: "Sri Lanka Institute of Information Technology",
  phone: "+94 7X XXX XXXX",
  email: "info@crowdflow.lk",
  website: "www.crowdflow.lk",
  // Optional: dataURL logo (PNG/JPG). Keep width ~18–24
  // logo: "data:image/png;base64,......"
};

/**
 * Draws the business header. Call inside jsPDF's didDrawPage so it repeats.
 * @param {jsPDF} doc
 * @param {object} info  overrides BUSINESS_INFO
 * @returns {number} nextY suggested y position to continue content
 */
export function addBusinessHeader(doc, info = BUSINESS_INFO) {
  const i = { ...BUSINESS_INFO, ...info };
  const marginX = 14;
  const topY = 12;

  // Optional logo (if provided)
  if (i.logo) {
    try {
      doc.addImage(i.logo, "PNG", marginX, topY - 2, 18, 18);
    } catch (e) {
      // ignore image errors to keep PDF flowing
    }
  }

  const leftX = i.logo ? marginX + 22 : marginX;
  doc.setFont("helvetica", "bold").setFontSize(13);
  doc.text(i.name, leftX, topY + 2);

  doc.setFont("helvetica", "normal").setFontSize(10);
  if (i.tagline) doc.text(i.tagline, leftX, topY + 7);
  const line2 = [i.address, i.phone].filter(Boolean).join("  •  ");
  if (line2) doc.text(line2, leftX, topY + 12);
  const line3 = [i.email, i.website].filter(Boolean).join("  •  ");
  if (line3) doc.text(line3, leftX, topY + 17);

  // a thin divider
  doc.setDrawColor(200).setLineWidth(0.2);
  doc.line(marginX, topY + 21, 200, topY + 21);

  return topY + 27; // return the next Y to start body
}
