
import db from "../db.js";
import { Router } from 'express';
const router = Router();

router.delete('/', async (req, res) => {
    console.log("started");
  try {
    const [rows] = await db.query(`
      SELECT CONSTRAINT_NAME
      FROM information_schema.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'saleInvoiceItems'
        AND COLUMN_NAME = 'item_id'
        AND REFERENCED_TABLE_NAME IS NOT NULL;
    `);

    if (rows.length === 0) {
      return res.json({ removed: false, message: "No FK found on item_id" });
    }

    const fk = rows[0].CONSTRAINT_NAME;

    await db.query(`ALTER TABLE saleInvoiceItems DROP FOREIGN KEY ${fk}`);
    await db.query(`ALTER TABLE saleInvoiceItems DROP INDEX item_id`);

    res.json({ removed: true, fkName: fk });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;
