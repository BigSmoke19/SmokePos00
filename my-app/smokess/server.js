import express from 'express';
import path from 'path';
import {fileURLToPath} from 'url';
import Items from './routes/items.js';
import SaleInvoices from './routes/saleInvoices.js';
import logger from './middleware/logger.js';
import errorHandler from './middleware/error.js';
import notfound from './middleware/notfound.js';
import { initDB } from './initDatabase.js';
const port = process.env.SERVER_PORT || 8000;
import cors from 'cors';
import Categories from './routes/categories.js';
import Users from './routes/users.js';
import FkRoutes from './routes/fkRoutes.js';



// get the directory name 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// cors
app.use(cors());


// initate database
await initDB();

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({extended : false}));


//logger middleware
app.use(logger);


// setup static folder
app.use(express.static(path.join(__dirname,'public')));



//Routes
app.use('/api/Items',Items);

app.use('/api/SaleInvoices',SaleInvoices);

app.use('/api/Categories',Categories);

app.use('/api/Users',Users);
// Register routes
app.use('/api/Fk', FkRoutes);

app.use(notfound);


//error handler 
app.use(errorHandler);







app.listen(port, ()=> console.log(`Server Running on ${port}`))