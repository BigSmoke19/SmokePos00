import db from "../db.js";

// @desc Get all SaleInvoices
// @route GET /api/saleInvoices

export const getSaleInvoices = async (req, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        si.id,
        si.total,
        si.date,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'item_id', sii.item_id,
            'name', sii.name,
            'category', sii.category,
            'price', sii.price,
            'quantity', sii.quantity,
            'barCode', sii.barCode
          )
        ) AS items
      FROM saleInvoices si
      JOIN saleInvoiceItems sii ON si.id = sii.invoice_id
      GROUP BY si.id, si.total, si.date
      ORDER BY si.date DESC
    `);

    if (rows.length === 0) {
      const error = new Error("No SaleInvoices Yet!");
      error.status = 404;
      return next(error);
    }

    // MySQL returns 'items' as a JSON string — parse it
    const invoices = rows.map(row => ({
      ...row,
      items: row.items
    }));

    res.status(200).json(invoices);

  } catch (err) {
    const error = new Error(err.message);
    error.status = 500;
    return next(error);
  }
};


// @desc create a new SaleInvoice with items
// @route Post /api/SaleInvoices

export const addSaleInvoice = async (req, res, next) => {
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    const error = new Error("Invoice must include at least one item.");
    error.status = 400;
    return next(error);
  }

  const conn = await db.getConnection();
  await conn.beginTransaction();

  try {
    // Validate and calculate total
    let total = 0;
    const invoiceItems = [];

    for (const item of items) {
      const { id, name, category, price, inQuantity,barCode } = item;

      if (
        !id || !name || !category ||
        !price  || !inQuantity
      ) {
        throw new Error("Invalid item data. All fields are required.");
      }
      
      const subtotal = parseFloat(price) * parseInt(inQuantity);
      total += subtotal;

      invoiceItems.push({ id, name, category, price, inQuantity,barCode });
    }

    // Insert invoice
    const [invoiceResult] = await conn.query(
      `INSERT INTO saleInvoices (total) VALUES (?)`,
      [total]
    );
    const invoiceId = invoiceResult.insertId;

    // Insert invoice items
    for (const item of invoiceItems) {
      await conn.query(
        `INSERT INTO saleInvoiceItems (invoice_id, item_id, name, category, price, quantity,barCode)
         VALUES (?, ?, ?, ?, ?, ?,?)`,
        [
          invoiceId,
          item.id,
          item.name,
          item.category,
          item.price,
          item.inQuantity,
          item.barCode
        ]
      );
    }

    await conn.commit();
    conn.release();

    res.status(201).json({ invoiceId, total });

  } catch (err) {
    await conn.rollback();
    conn.release();

    const error = new Error(err.message);
    error.status = 500;
    return next(error);
  }
};

// @desc create a new Empty SaleInvoice
// @route Post /api/SaleInvoices/empty

export const addEmptySaleInvoice = async (req, res, next) => {
  const total = 0;

  try {
    const [result] = await db.query(
      `INSERT INTO saleInvoices (total) VALUES (?)`,
      [total]
    );

    res.status(201).json({ id: result.insertId, total});
  } catch (err) {
    next(err);
  }
};

// @desc Recalculate Invoice total

async function updateInvoiceTotal(invoiceId) {
  const [rows] = await db.query(
    `SELECT SUM(price * quantity) AS total FROM saleInvoiceItems WHERE invoice_id = ?`,
    [invoiceId]
  );
  const total = rows[0].total || 0;

  await db.query(
    `UPDATE saleInvoices SET total = ? WHERE id = ?`,
    [total, invoiceId]
  );
}


// @desc add an item to SaleInvoice
// @route Post /api/SaleInvoicesItems/:id

export const addSingleItemToInvoice = async (req, res, next) => {
  const { invoiceId } = req.params;
  const { itemId, name, price, quantity, category, barCode} = req.body;

  if (!itemId && !name) {
    return res.status(400).json({ msg: 'Either itemId or name is required' });
  }
  if (!price || !quantity) {
    return res.status(400).json({ msg: 'Price and quantity are required' });
  }

  try {
    await db.query(
      `INSERT INTO saleInvoiceItems (invoice_Id, item_id, name, price, quantity, category,barCode)
       VALUES (?, ?, ?, ?, ?, ?,?)`,
      [invoiceId, itemId || null, name || null, price, quantity, category || null, barCode || null]
    );

    await updateInvoiceTotal(invoiceId);

    res.status(201).json({ msg: 'Item added to invoice' });
  } catch (err) {
    next(err);
  }
};



// @desc remove an item from SaleInvoice
// @route Delete /:invoiceId/removeItem/:itemId

export const removeSingleItemFromInvoice = async (req, res, next) => {
  const { invoiceId, itemId } = req.params;

  try {
    const [result] = await db.query(
      `DELETE FROM saleInvoiceItems WHERE invoice_id = ? AND item_id = ?`,
      [invoiceId, itemId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ msg: 'Item not found in invoice' });
    }

    await updateInvoiceTotal(invoiceId);

    res.status(200).json({ msg: 'Item removed from invoice' });
  } catch (err) {
    next(err);
  }
};

// @desc update an item quantity in SaleInvoiceItems
// @route update /:invoiceId/UpdateItem/:itemId

export const updateItemQuantityInInvoice = async (req, res, next) => {
  const { invoiceId, itemId } = req.params;
  const { quantity } = req.body;

  if (typeof quantity !== 'number' || quantity < 0) {
    return res.status(400).json({ msg: 'Quantity must be a non-negative number' });
  }

  try {
    const [result] = await db.query(
      `UPDATE saleInvoiceItems SET quantity = ? WHERE invoice_id = ? AND item_id = ?`,
      [quantity, invoiceId, itemId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ msg: 'Item not found in invoice' });
    }

    // Update total after quantity update
    await updateInvoiceTotal(invoiceId);

    res.status(200).json({ msg: 'Item quantity updated and invoice total recalculated' });
  } catch (err) {
    next(err);
  }
};



// @desc get SaleInvoices by id
// @route GEt /api/SaleInvoices/:id


export const getSaleInvoiceById = async (req, res, next) => {
  const { id } = req.params; // assuming /sale-invoices/:id

  try {
    const [rows] = await db.query(`
      SELECT 
        si.id,
        si.total,
        si.date,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'item_id', sii.item_id,
            'name', sii.name,
            'category', sii.category,
            'price', sii.price,
            'quantity', sii.quantity,
            'barCode', sii.barCode
          )
        ) AS items
      FROM saleInvoices si
      JOIN saleInvoiceItems sii ON si.id = sii.invoice_id
      WHERE si.id = ?
      GROUP BY si.id, si.total, si.date
    `, [id]);

    if (rows.length === 0) {
      const error = new Error("Sale invoice not found");
      error.status = 404;
      return next(error);
    }

    // Parse JSON items
    const invoice = rows[0];
    invoice.items = invoice.items;

    res.status(200).json(invoice);

  } catch (err) {
    const error = new Error(err.message);
    error.status = 500;
    return next(error);
  }
};

// @desc get SaleInvoices by date
// @route GEt /api/SaleInvoices/:id

/*export const getSaleInvoicesByDate = async (req, res, next) => {

  const { start, end } = req.query;

  if (!start || !end) {
    return res.status(400).json({ msg: "Please provide both 'start' and 'end' query parameters in YYYY-MM-DD format." });
  }

  try {
    const [rows] = await db.query(
      `SELECT * FROM saleInvoices WHERE DATE(date) BETWEEN ? AND ? ORDER BY date ASC`,
      [start, end]
    );

    if (rows.length === 0) {
      return res.status(404).json({ msg: "No sale invoices found in this date range." });
    }

    res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
};*/

// @desc get SaleInvoices by date with items
// @route GET /api/SaleInvoices?start=YYYY-MM-DD&end=YYYY-MM-DD
export const getSaleInvoicesByDate = async (req, res, next) => {
  const { start, end } = req.query;

  if (!start || !end) {
    return res
      .status(400)
      .json({ msg: "Please provide both 'start' and 'end' query parameters in YYYY-MM-DD format." });
  }

  try {
    const [rows] = await db.query(
      `
      SELECT 
        si.id,
        si.total,
        si.date,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'item_id', sii.item_id,
            'name', sii.name,
            'category', sii.category,
            'price', sii.price,
            'quantity', sii.quantity
            'barCode', sii.barCode
          )
        ) AS items
      FROM saleInvoices si
      JOIN saleInvoiceItems sii ON si.id = sii.invoice_id
      WHERE DATE(si.date) BETWEEN ? AND ?
      GROUP BY si.id, si.total, si.date
      ORDER BY si.date ASC
      `,
      [start, end]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ msg: "No sale invoices found in this date range." });
    }

    // ✅ Parse items JSON
    const invoices = rows.map((inv) => ({
      ...inv,
      items: typeof inv.items === "string" ? JSON.parse(inv.items) : inv.items
    }));

    res.status(200).json(invoices);
  } catch (err) {
    next(err);
  }
};




// @desc delete SaleInvoices by id
// @route Delete /api/SaleInvoices/:id


export const deleteSaleInvoiceById = async (req, res, next) => {
  const { id } = req.params;

  try {
    // Delete related items first (if you have a saleInvoiceItems table with foreign key)
    await db.query('DELETE FROM saleInvoiceItems WHERE invoice_id = ?', [id]);

    // Delete the invoice itself
    const [result] = await db.query('DELETE FROM saleInvoices WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ msg: 'Sale invoice not found' });
    }

    res.status(200).json({ msg: 'Sale invoice deleted successfully' });
  } catch (err) {
    next(err);
  }
};

