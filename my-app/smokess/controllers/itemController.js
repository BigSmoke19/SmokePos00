import db from "../db.js";



// @desc Get all Items
// @route GET /api/Items
export const getItems =  async (req, res,next) => {
  try {
    const [rows] = await db.query('SELECT * FROM items');

     if(rows.length === 0){
            const error = new Error("No Items Yet!");
            error.status = 404;
            return next(error);
        }

    res.status(200).json(rows);
  } catch (err) {
    const error = new Error(err.message);
    error.status = 500;
    return next(error);
  }
}




// @desc Get a single Items
// @route GET /api/Items/:id
export const getItem = async (req,res,next) => {
    const id = parseInt(req.params.id);
    
    try {
        const [rows] = await db.query(`SELECT * FROM items WHERE id = ?`, [id]);
        const item = rows[0]; // assuming id is unique

        if(!item) {
        const error = new Error(`A Item with id of ${id} was not found!`);
        error.status = 404;
        return next(error);
    }

        res.status(200).json(item);
    } catch (err) {
        const error = new Error(err.message);
        error.status = 500;
        return next(error);
    }

}

// @desc get items of a certain category 
// @route GET /api/Items/category

export const getItemsByCategory =  async (req, res,next) => {

    const category = req.params.category;

    try {
        const [rows] = await db.query('SELECT * FROM items WHERE category = ?',[category]);


        if(rows.length === 0){
            const error = new Error("No Items of this category");
            error.status = 404;
            return next(error);
        }

        res.status(200).json(rows);
    } catch (err) {
        const error = new Error(err.message);
        error.status = 500;
        return next(error);
    }
}

// @desc create a new Item
// @route Post /api/Items
export const createItem = async(req,res,next) => {

    console.log(req.body);

    
    const name =   req.body?req.body.name : null;
    const price =  req.body?parseFloat(req.body.price) : null;
    const category =   req.body?req.body.category : null;
    const bc =   req.body?req.body.barCode : null;
    const barCode = (bc?.trim === "")?null: bc
    

    if(!name || !price || !category) {
        const error = new Error(`Missing Credentials!`);
        error.status = 400;
        return next(error);
    }

    try{
        const [result] = await db.query(
        `INSERT INTO items (name, price, category, barCode) VALUES (?, ?, ?, ?)`,
        [name, price, category, barCode]
        );

        res.status(201).json({ insertId: result.insertId });

    }
     catch (err) {
        const error = new Error(err.message);
        error.status = 500;
        return next(error);
    }
}

// @desc update a Item
// @route Put /api/Items/:id
export const updateItem = async (req,res,next) =>{
    const id = req.params.id;

    // Safely extract values
    const name = req.body?.name ?? null;
    const price = req.body?.price !== undefined ? parseFloat(req.body.price) : null;
    const category = req.body?.category ?? null;
    const bc = req.body?.barCode ?? null;
    const barCode = (bc?.trim === "")?null: bc

    // Build dynamic query
    const updates = [];
    const values = [];

    if (name !== null) {
        updates.push('name = ?');
        values.push(name);
    }

    if (price !== null && !isNaN(price)) {
        updates.push('price = ?');
        values.push(price);
    }

    if (category !== null) {
        updates.push('category = ?');
        values.push(category);
    }

    if (barCode !== null) {
        updates.push('barCode = ?');
        values.push(barCode);
    }

    if (updates.length === 0) {
        return res.status(400).json({ message: 'No fields to update' });
    }

    values.push(id); // for WHERE clause

    const sql = `UPDATE items SET ${updates.join(', ')} WHERE id = ?`;

    try {
        const [result] = await db.query(sql, values);

        if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Item not found' });
        }

        res.status(200).json({ message: 'Item updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


// @desc delete a Item
// @route DELETE /api/Items/:id
export const deleteItem = async (req,res,next) =>{
    const id = parseInt(req.params.id);
    

    try {
        const [result] = await db.query(`DELETE FROM items WHERE id = ?`, [id]);

        if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Item not found' });
        }

        res.status(200).json({ message: 'Item deleted successfully' });

    } catch (err) {
        const error = new Error(err.message);
        error.status = 500;
        return next(error);
    }

}