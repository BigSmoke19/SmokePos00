import db from "../db.js";


// @desc Get all Categories
// @route GET /api/categories

export const getCategories =  async (req, res,next) => {
  try {
    const [rows] = await db.query('SELECT * FROM categories');

     if(rows.length === 0){
            const error = new Error("No Categories Yet!");
            error.status = 404;
            return next(error);
        }

    res.status(200).json(rows);
  } catch (err) {
    const error = new Error(err.message);
    error.status = 500;
    return next(error);
  }
};


// @desc create a new category
// @route Post /api/categories
export const createCategory = async(req,res,next) => {

    console.log(req.body);

    const category =   req.body?req.body.category : null;
    

    if(!category) {
        const error = new Error(`Missing Credentials!`);
        error.status = 400;
        return next(error);
    }

    try{
        const [result] = await db.query(
        `INSERT INTO categories (category) VALUES (?)`,
        [category]
        );

        res.status(201).json({ insertId: result.insertId });

    }
     catch (err) {
        const error = new Error(err.message);
        error.status = 500;
        return next(error);
    }
};

// @desc update a category
// @route Put /api/Categories/:id
export const updateCategory = async (req,res,next) =>{
    const id = req.params.id;

    // Safely extract values
    const category = req.body?.category ?? null;

    // Build dynamic query
    const updates = [];
    const values = [];

    if (category !== null) {
        updates.push('category = ?');
        values.push(category);
    }

    if (updates.length === 0) {
        return res.status(400).json({ message: 'No fields to update' });
    }

    values.push(id); // for WHERE clause

    const sql = `UPDATE categories SET ${updates.join(', ')} WHERE id = ?`;

    try {
        const [result] = await db.query(sql, values);

        if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Category not found' });
        }

        res.status(200).json({ message: 'Category updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


// @desc delete a Category
// @route DELETE /api/Categories/:id
export const deleteCategory = async (req,res,next) =>{
    const id = parseInt(req.params.id);
    

    try {
        const [result] = await db.query(`DELETE FROM categories WHERE id = ?`, [id]);

        if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Item not found' });
        }

        res.status(200).json({ message: 'Catgegory deleted successfully' });

    } catch (err) {
        const error = new Error(err.message);
        error.status = 500;
        return next(error);
    }

}