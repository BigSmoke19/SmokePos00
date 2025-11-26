// src/utils/printReceipt.js

/**
 * Print a receipt using the selected printer and company info from config
 * @param {Array} rawItems - array of items { name, price, inQuantity }
 * @param {number} rawTotal - optional total
 */
export async function printReceipt(rawItems, rawTotal) {
  const date = new Date().toLocaleString();

  const num = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const fmt = (v) => num(v).toFixed(2);

  const esc = (s = "") =>
    String(s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );

  // Load config (company info + printer)
  let config = {};
  try {
    config = await window.electronAPI.getConfig();
  } catch (err) {
    console.warn("Could not load config, using defaults", err);
  }

  const companyName = esc(config?.companyName || "My Store");
  const companyLocation = esc(config?.location || "");
  const companyPhone = esc(config?.phone || "");
  const companyDescription = esc(config?.description || "");
  const printerName = config?.selectedPrinter || null;

  // Normalize items
  const items = (Array.isArray(rawItems) ? rawItems : []).map((it) => ({
    name: esc(it?.name),
    price: num(it?.price),
    inQuantity: num(it?.inQuantity),
  }));

  const computedTotal = items.reduce((sum, i) => sum + i.price * i.inQuantity, 0);
  const total = Number.isFinite(Number(rawTotal)) ? num(rawTotal) : computedTotal;

  const rows = items
    .map(
      (item) => `
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span style="width:140px;word-break:break-word;">${item.name}</span>
        <span style="width:80px;text-align:center;">$${fmt(item.price)}</span>
        <span style="width:60px;text-align:center;">${item.inQuantity}</span>
        <span style="width:90px;text-align:right;">$${fmt(item.price * item.inQuantity)}</span>
      </div>`
    )
    .join("");

  const receiptHTML = `
    <div style="font-family: monospace; width: 210px; padding: 4px; font-size: 15px; box-sizing: border-box;">
      <div style="text-align:center;">
        <h2 style="margin:0; font-size:20px;">${companyName}</h2>
        <div style="margin-bottom:2px;">${companyLocation}</div>
        <div style="margin-bottom:2px;">${companyPhone}</div>
        <div style="margin-bottom:2px;">${companyDescription}</div>
        <small>${date}</small>
        <hr style="margin:4px 0;" />
      </div>

      <div style="display:flex;justify-content:space-between;font-weight:bold;margin-bottom:2px;">
        <span style="width:90px;">Item</span>
        <span style="width:62px;text-align:center;">Price</span>
        <span style="width:52px;text-align:center;">Qty</span>
        <span style="width:70px;text-align:right;">Total</span>
      </div>

      ${items
        .map(
          (item) => `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1px;">
          <span style="width:90px;word-break:break-word;">${item.name}</span>
          <span style="width:62px;text-align:center;">$${fmt(item.price)}</span>
          <span style="width:52px;text-align:center;">${item.inQuantity}</span>
          <span style="width:70px;text-align:right;">$${fmt(item.price * item.inQuantity)}</span>
        </div>`
        )
        .join("")}

      <hr style="margin:4px 0;" />
      <div style="display:flex;justify-content:space-between;font-weight:bold;">
        <span>Total</span>
        <span>$${fmt(total)}</span>
      </div>
      <hr style="margin:4px 0;" />
      <div style="text-align:center;margin-top:4px;">
        <p style="margin:0;">Thanks for visiting!</p>
      </div>
    </div>
  `;

  // Print using Electron preload API
  try {
    await window.electronAPI.printHtml(receiptHTML, printerName);
  } catch (err) {
    console.error("Printing failed:", err);
  }
}
