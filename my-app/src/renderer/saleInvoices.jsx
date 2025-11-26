import { useDispatch, useSelector } from 'react-redux';
import './styles/saleInvoices.css';
import { useEffect,useState} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router';
import { getSaleInvoices } from '../../state/saleInvoices/saleInvoicesSlice';


const SaleInvoices = () => {


    const {saleInvoices, status, error} = useSelector(state => state.saleInvoices);

    const [selectedInv,setSelectedInv] = useState(null);
    
    const dispatch = useDispatch();


    const navigate = useNavigate();
    

    useEffect(()=>{
        dispatch(getSaleInvoices());
        
    },[dispatch]);

    const getDate = (date) => {
        const dateObj = new Date(date);
        const day = dateObj.getDate().toString().padStart(2, '0');
        const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
        const year = dateObj.getFullYear();
        const hours = dateObj.getHours().toString().padStart(2, '0');
        const minutes = dateObj.getMinutes().toString().padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    }

    const deleteSaleInvoice = async (id) =>{
             const options = {
                title: "Confirm Action",
                message: "Are you sure you want to Delete this Item??",
            };
    
            const result = await window.electronAPI.showConfirmDialog(options);
    
                if (result === 0) {
                    try {
                        const response = await axios.delete(`http://localhost:8000/api/SaleInvoices/${parseInt(id)}`);
                        window.electronAPI.reload();
                        return response.data;
                    } catch (error) {
                        throw error.response?.data || { message: error.message };
                    }
    
                    }
            else{}
    
        }

        const getTotalItemsCount = (invoiceItems) => {
            let count = 0;
            if(invoiceItems && invoiceItems.length !== 0){
                invoiceItems.forEach((item) => {
                count += item.quantity;
            });
            }
            return count;
    };

    return ( 
        <div className="pos">
            <div className="pos-nav-bar">
              <div className="pos-nav-bar-option" onClick={()=>{navigate("/home")}}>Home</div>
              <div className="pos-nav-bar-option" onClick={()=>{navigate("/pos")}}>POS</div>
           </div>
            {saleInvoices && saleInvoices.map((inv)=>(
                <div key={inv.id} className="item-list-container">
                    <div className="items-list-item">
                        <span className="item-detail">{getDate(inv.date)}</span>
                        <span className="item-detail" id='price'>{inv.total}$</span>
                        <span className="item-detail">{getTotalItemsCount(JSON.parse(inv.items))} {(getTotalItemsCount(JSON.parse(inv.items)) === 1)?"item":"items"}</span>
                        {selectedInv !== inv.id &&<button className='item-detail' id='edit-btn' onClick={()=>{setSelectedInv(inv.id)}}>Details</button>}
                        {selectedInv === inv.id &&<button className='item-detail' id='edit-btn' onClick={()=>{setSelectedInv(null)}}>Hide</button>}
                        <button className='item-detail' id='edit-btn' onClick={()=>{deleteSaleInvoice(inv.id)}}>Delete</button>
                    </div>
                    {selectedInv === inv.id && <div  className="pos-invoice-items">
                        {inv.items && JSON.parse(inv.items).map((item) => (
                        <div className="invoice-item" key={item.item_id}>
                            <span className="invoice-item-detail" id='item-name'>{item.name}</span>
                            <span className="invoice-item-detail" id="price">{item.price}$</span>
                            <span className="invoice-item-detail" id="count">{item.quantity}</span>
                            <span className="invoice-item-detail" id="price">{item.price * item.quantity}$</span>
                        </div>
                    ))}
                    </div>}
                </div>
            ))}
           
        </div>
     );
}
 
export default SaleInvoices;