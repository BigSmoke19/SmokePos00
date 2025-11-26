import { Router } from 'express';
const router = Router();
import { addEmptySaleInvoice, addSaleInvoice, addSingleItemToInvoice, deleteSaleInvoiceById, getSaleInvoiceById, getSaleInvoices, getSaleInvoicesByDate, removeSingleItemFromInvoice, updateItemQuantityInInvoice } from '../controllers/saleInvoicesController.js';




// get all Invoices
router.get('/',getSaleInvoices);

// create a new SaleInvoice
router.post('/',addSaleInvoice);

// create a new empty SaleInvoice
router.post('/empty',addEmptySaleInvoice);

// add a single Item
router.post('/addItem/:invoiceId',addSingleItemToInvoice);

// remove a single Item
router.delete('/:invoiceId/removeItem/:itemId', removeSingleItemFromInvoice);

// update item quantity
router.put('/:invoiceId/updateItem/:itemId', updateItemQuantityInInvoice);


// get Invoices by date
router.get('/date', getSaleInvoicesByDate);

// get Invoices by id
router.get('/:id', getSaleInvoiceById);

// delete Invoices by id
router.delete('/:id', deleteSaleInvoiceById);




export default router;