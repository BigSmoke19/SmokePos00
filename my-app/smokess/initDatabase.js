import db from './db.js';

import bcrypt from 'bcrypt';


const defaultPassword = 'password';
const hashedPassword = await bcrypt.hash(defaultPassword, 10);

export async function initDB() {

   const dbName = process.env.DB_NAME;

   await db.query(`USE \`${dbName}\``);

    // -------------------------------
    // 1) Create DATABASE if not exists
    // -------------------------------
    await db.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`Database '${dbName}' ensured.`);

    // Switch the pool to use this database
    await db.query(`USE \`${dbName}\``);

  try {
    // Check and create 'items' table
    const [itemsResult] = await db.query(`
      SELECT COUNT(*) AS count
      FROM information_schema.tables
      WHERE table_schema = ? AND table_name = ?
    `, [process.env.DB_NAME, 'items']);

    if (itemsResult[0].count === 0) {
      console.log("Table 'items' not found. Creating...");
      await db.query(`
        CREATE TABLE items (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          category VARCHAR(255) NOT NULL,
          price DECIMAL(10, 2) NOT NULL,
          barCode VARCHAR(255) NULL UNIQUE
        )
      `);
      console.log("Table 'items' created.");
    } else {
      console.log("Table 'items' already exists.");
    }

    // Check and create 'saleInvoices' table
    const [invoicesResult] = await db.query(`
      SELECT COUNT(*) AS count
      FROM information_schema.tables
      WHERE table_schema = ? AND table_name = ?
    `, [process.env.DB_NAME, 'saleInvoices']);

    if (invoicesResult[0].count === 0) {
      console.log("Table 'saleInvoices' not found. Creating...");
      await db.query(`
        CREATE TABLE saleInvoices (
          id INT AUTO_INCREMENT PRIMARY KEY,
          total DECIMAL(10, 2) NOT NULL,
          date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log("Table 'saleInvoices' created.");
    } else {
      console.log("Table 'saleInvoices' already exists.");
    }

    // Check and create 'saleInvoiceItems' table
    const [invoiceItemsResult] = await db.query(`
      SELECT COUNT(*) AS count
      FROM information_schema.tables
      WHERE table_schema = ? AND table_name = ?
    `, [process.env.DB_NAME, 'saleInvoiceItems']);

    if (invoiceItemsResult[0].count === 0) {
      console.log("Table 'saleInvoiceItems' not found. Creating...");
      await db.query(`
        CREATE TABLE saleInvoiceItems (
          id INT AUTO_INCREMENT PRIMARY KEY,
          invoice_id INT NOT NULL,
          item_id INT NOT NULL,
          name VARCHAR(255) NOT NULL,
          category VARCHAR(255) NOT NULL, -- <- Added category snapshot
          price DECIMAL(10, 2) NOT NULL,
          quantity INT NOT NULL,
          barCode VARCHAR(255) NULL UNIQUE,
          FOREIGN KEY (invoice_id) REFERENCES saleInvoices(id) ON DELETE CASCADE
        )`);

      console.log("Table 'saleInvoiceItems' created.");
    } else {
      console.log("Table 'saleInvoiceItems' already exists.");
    }

    // Check and create 'categories' table
    const [categoriesResult] = await db.query(`
      SELECT COUNT(*) AS count
      FROM information_schema.tables
      WHERE table_schema = ? AND table_name = ?
    `, [process.env.DB_NAME, 'categories']);

    if (categoriesResult[0].count === 0) {
      console.log("Table 'categories' not found. Creating...");
      await db.query(`
        CREATE TABLE categories (
          id INT AUTO_INCREMENT PRIMARY KEY,
          category VARCHAR(255) NOT NULL UNIQUE
        )
      `);
      console.log("Table 'categories' created.");
    } else {
      console.log("Table 'categories' already exists.");
    }

    
    // Check and create 'users' table
    const [usersResult] = await db.query(`
      SELECT COUNT(*) AS count
      FROM information_schema.tables
      WHERE table_schema = ? AND table_name = ?
    `, [process.env.DB_NAME, 'users']);

    if (usersResult[0].count === 0) {
      console.log("Table 'users' not found. Creating...");
      await db.query(`
        CREATE TABLE users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          userName VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL
        )
      `);
      console.log("Table 'users' created.");
    } else {
      console.log("Table 'users' already exists.");
    }

    // Check if default user exists
    const [checkUser] = await db.query(`
      SELECT COUNT(*) AS count FROM users WHERE id = 1
    `);

    if (checkUser[0].count === 0) {
      await db.query(`
        INSERT INTO users (userName, password)
        VALUES (1,'user', ?)
      `, [hashedPassword]);
      console.log("Default user added: user / password (hashed)");
    }else{
      console.log("Default user exist: user / password (hashed)");
    }


  } catch (err) {
    console.error("Error checking or creating tables:", err.message);
  }
}
