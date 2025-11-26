import { useNavigate } from 'react-router';
import './styles/pos.css';
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import Loading from './loading';
import { getItems } from '../../state/items/itemsSlice';
import axios from 'axios';
import { getCategories } from '../../state/categories/categoriesSlice';
import { printReceipt } from './printReceipt';

const POS = () => {

    const dispatch = useDispatch();
    const {items, status, error} = useSelector(state => state.items);
    const {categories , status : catStatus, error : catError} = useSelector(state => state.categories);

    const [selectedItems,setSelectedItems] = useState(null);
    const [invoiceItems,setInvoiceItems] = useState(null);
    const [total,setTotal] = useState(0);
    const [itemsCount,setItemsCount] = useState(0);
    const [totalItemsCount,setTotalItemsCount] = useState(0);

    const [currentBc,setCurrentBc] = useState("");
    const barCodeRef = useRef(null);

    const navigate = useNavigate();

    useEffect(()=>{
        barCodeRef.current.focus();
    })

    useEffect(()=>{
        dispatch(getItems());
        dispatch(getCategories())
    },[dispatch])



    const updateTotal = () => {
        let newTotal = 0;
        if(invoiceItems){
            invoiceItems.forEach((item) =>{
                newTotal += parseFloat(item.price) * parseInt(item.inQuantity);
            });
        }
        setTotal(newTotal);
    };

    const updateItemsCount = () =>{
        let items = [...invoiceItems];
        setItemsCount(items.length);
    };

    const updateTotalItemsCount = () => {
        let count = 0;
        invoiceItems.forEach((item) => {
            count += item.inQuantity;
        });
        setTotalItemsCount(count);
    };

    useEffect(()=>{
        updateTotal();
        if(invoiceItems){
            updateItemsCount();
            updateTotalItemsCount();
        }

    },[invoiceItems]);


    const selectCat = (cat) => {
        let newItems = [];
        items.forEach((item)=>{
            if(item.category === cat){
                newItems.push(item)
            }
        });

        setSelectedItems(newItems);
    };

    const changeQuantity = (operation,id) =>{
        if(operation === 1){
            setInvoiceItems(prev => prev.map((item) => 
                (item.id === id)?
                    {...item,inQuantity : item.inQuantity + 1} : item
            ))
        }
        else{
            setInvoiceItems(prev => prev.map((item) => 
                (item.id === id)?
                    {...item,inQuantity :(item.inQuantity === 1)?item.inQuantity : item.inQuantity - 1} : item
            ))
        }
    }

    const updateInvoiceItems = (item) =>{
        let newInvoiceitems = (invoiceItems)?[...invoiceItems] : [];
        if(invoiceItems && invoiceItems.find(i => i.id === item.id)){
            changeQuantity(1,item.id);
        }else{
            newInvoiceitems.push({...item,inQuantity : 1});
            setInvoiceItems(newInvoiceitems);
        }
    }

    const reselect = () =>{
        setSelectedItems(null);
    }

    const removeItem = (id) =>{
        setInvoiceItems(prev => prev.filter((item) => item.id !== id));
    }

    const addSaleInvoice = async () => {
        console.log(invoiceItems);
        if(invoiceItems){
            const options = {
            title: "Confirm Action",
            message: "Are you sure you want to confirm this sale?",
        };

        const result = await window.electronAPI.showConfirmDialog(options);

            if (result === 0) {
                try {
                    const response = await axios.post(
                    'http://localhost:8000/api/SaleInvoices', 
                    { items : invoiceItems },
                    {
                        headers: {
                        'Content-Type': 'application/json',
                        },
                    }
                    );

                    return response.data; // { invoiceId, total }
                } catch (error) {
                    throw error.response?.data || { message: error.message };
                }
            }
        }
        else{
            const options = {
            title: "Error",
            message: "Empty Invoice!!!",
        };

        const result = await window.electronAPI.showConfirmDialog(options);
        console.log(result);
        }
    };

    const printInvoice = async () =>{
         if(invoiceItems){
            printReceipt(invoiceItems, total);
        }
        else{
            const options = {
            title: "Error",
            message: "Empty Invoice!!!",
        };

        const result = await window.electronAPI.showConfirmDialog(options);
        console.log(result);
        }
}

    const handleBarCode = async (bc) =>{
        if(!bc || bc?.trim === ""){
            const options = {
            title: "Error",
            message: "No Item with this BarCode",
        };

        const result = await window.electronAPI.showConfirmDialog(options);
        console.log(result);

        }else{
            const enteredItem = items.find(item => item.barCode === bc);
            if(enteredItem){
                updateInvoiceItems(enteredItem);
            }else{
                const options = {
            title: "Error",
            message: "No Item with this BarCode",
        };

        const result = await window.electronAPI.showConfirmDialog(options);
        console.log(result);

            }
        }
        setCurrentBc("");
    }

    return ( 
        <div className="pos">
            <div className="pos-nav-bar">
              <div className="pos-nav-bar-option" onClick={()=>{navigate("/home")}}>Home</div>
              <div className="pos-nav-bar-option" onClick={()=>{navigate("/items")}}>Items</div>
              <div className="pos-nav-bar-option" onClick={()=>{navigate("/saleInvoices")}}>Invoices</div>
              <div className="pos-nav-bar-option" onClick={()=>{navigate("/")}}>Log Out</div>
           </div>
           <div className='pos-options'>
                <span className="pos-option" onClick={()=>{addSaleInvoice()}}>
                    Confirm
                </span>
                <span className="pos-option" onClick={() => printInvoice()}>
                    Print
                </span>
           </div>
           <div className="pos-body">
            <div className="barScanner">
                    <input ref={barCodeRef} value={currentBc} onChange={(e)=>setCurrentBc(e.target.value)} onKeyDown={(e)=>{if(e.key === "Enter"){handleBarCode(e.target.value)}}} type="text" className='barCode-input' />
            </div>
            <div className="pos-invoice">
                <div className="pos-invoice-items">
                    {invoiceItems && invoiceItems.map((item) => (
                        <div className="invoice-item" key={item.id}>
                        <span className="invoice-item-detail" id='item-name'>{item.name}</span>
                        <span className="invoice-item-detail" id="price">{item.price}$</span>
                        <span className="invoice-item-detail"  ><img id="icon" src="add.png" alt="+" onClick={() =>changeQuantity(1,item.id)}/></span>
                        <span className="invoice-item-detail" id="count">{item.inQuantity}</span>
                        <span className="invoice-item-detail" ><img id="icon" src="minus.png" alt="-" onClick={() =>changeQuantity(0,item.id)} /></span>
                        <span className="invoice-item-detail" id="price">{item.price * item.inQuantity}$</span>
                        <span className="invoice-item-detail" ><img id="icon" src="bin.png" alt="del" onClick={()=>{removeItem(item.id)}}/></span>
                        
                        </div>
                    ))}
                </div>
                <div className="pos-invoice-total" id="price">
                {total}$
                <div className="items-count">
                    <span className='pos-count'>Items Count: <span id='count'>{itemsCount}</span></span>
                    <span className='pos-count'>Total Count: <span id='count'>{totalItemsCount}</span></span></div>
                </div>
            </div>
            {status === "succeeded" && 
            <div className="pos-items">
                <div className="category" onClick={()=>{reselect()}}>...</div>
                {!selectedItems && items && categories && categories.map((cat)=>(
                    <div className="category" key={cat.id} onClick={()=>{selectCat(cat.category)}}>{cat.category}</div>
                ))}
                {selectedItems && selectedItems.map((item)=>(
                    <div className="category" key={item.id} onDoubleClick={()=>{updateInvoiceItems(item)}}>{item.name}</div>
                ))}
            </div>}
            {status === "loading" && <Loading></Loading>}
            {status === "failed" && <div>{error.message}</div>}
           </div>
        </div>
     );
}
 
export default POS;