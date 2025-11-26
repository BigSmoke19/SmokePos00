import { useNavigate } from 'react-router';
import { use, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { getSaleInvoices } from '../../state/saleInvoices/saleInvoicesSlice';
import './styles/statistics.css';
import { getCurrentDayMonthYear } from './rFunctions';

const Statistics = () => {

    const {saleInvoices, status, error} = useSelector(state => state.saleInvoices);
    
    const dispatch = useDispatch();


    const navigate = useNavigate();

    const {day: currentDay,month: currentMonth,year: currnetYear} = getCurrentDayMonthYear();

    const [startDay,setStartDay] = useState(currentDay);
    const [startMonth,setStartMonth] = useState(currentMonth);
    const [startYear,setStartYear] = useState(currnetYear);

    const [endDay,setEndDay] = useState(currentDay);
    const [endMonth,setEndMonth] = useState(currentMonth);
    const [endYear,setEndYear] = useState(currnetYear);

    const [customers,setCustomers] = useState(null);
    const [totalIncome,setTotalIncome] = useState(null);
    const [totalOrders,setTotalOrders] = useState(null);
    const [highestSale,sethighestSale] = useState(null);
    const [mostOrderedItem,setMostOrderedItem] = useState(null);

    const inputRefs = useRef([]);
    

    useEffect(()=>{
        dispatch(getSaleInvoices());
        
    },[dispatch]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            const currentIndex = inputRefs.current.indexOf(document.activeElement);
            if (event.key === 'Enter' && currentIndex < inputRefs.current.length - 1) {
              inputRefs.current[currentIndex + 1].focus();
              event.preventDefault();
            }
            else if (event.key === 'ArrowRight'  && currentIndex < inputRefs.current.length - 1) {
                inputRefs.current[currentIndex + 1].focus();
                event.preventDefault();
            } else if (event.key === 'ArrowLeft'&& currentIndex > 0) {
                inputRefs.current[currentIndex - 1].focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const getDateString = (date) => {
        const dateObj = new Date(date);
        const day = dateObj.getDate().toString().padStart(2, '0');
        const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
        const year = dateObj.getFullYear();
        const hours = dateObj.getHours().toString().padStart(2, '0');
        const minutes = dateObj.getMinutes().toString().padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    }

    const getDate = (date) => {
        const dateObj = new Date(date);
        const day = dateObj.getDate().toString().padStart(2, '0');
        const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
        const year = dateObj.getFullYear();
        const hours = dateObj.getHours().toString().padStart(2, '0');
        const minutes = dateObj.getMinutes().toString().padStart(2, '0');

        return {day,month,year,hours,minutes};
    };

    const resetInputs = () => {
        setCustomers(null);
        setTotalIncome(null);
        setTotalOrders(null);
        sethighestSale(null);
        setMostOrderedItem(null);
    };

    const getSaleInvoicesByDate = async (start, end) => {
        try {
            const response = await axios.get("http://localhost:8000/api/SaleInvoices/date", {
            params: { start, end }, // query params
            });
            return response.data;
        } catch (error) {
                resetInputs();
                const options = {
                title: "Alert",
                message: (error.message === "Request failed with status code 404")?"No Invoices in this date Range":error.message,
            };

            await window.electronAPI.showConfirmDialog(options);
            throw error.response?.data || { msg: error.message };
            
          
        }
    };

    //nbr of customers , total incomes, total orders, highst sale, most ordered item
    const summarizeInvoices = (saleInvoices) => {
        console.log(saleInvoices);
        if (!Array.isArray(saleInvoices) || saleInvoices.length === 0) {
            return {
            customers: 0,
            totalIncome: 0,
            totalOrders: 0,
            highestSale: null,
            mostOrderedItem: null
            };
        }

        let customers = saleInvoices.length;
        let totalIncome = 0;
        let totalOrders = 0;
        let highestSale = 0;
        let mostOrderedItem = null;
        let itemCountMap = {}; // { itemName: totalQuantity }

        for (const invoice of saleInvoices) {
            totalIncome += parseFloat(invoice.total);

            if (parseFloat(invoice.total) > parseFloat(highestSale)) {
            highestSale = parseFloat(invoice.total);
            }

            if (Array.isArray(invoice.items)) {
            for (const item of invoice.items) {
                console.log(item)
                totalOrders += parseInt(item.quantity); // ✅ count every unit sold
                if (!itemCountMap[item.name]) {
                itemCountMap[item.name] = 0;
                }
                itemCountMap[item.name] += parseInt(item.quantity);
            }
            }
        }

        // Find most ordered item
        let maxQty = 0;
        for (const [itemName, qty] of Object.entries(itemCountMap)) {
            if (qty > maxQty) {
            mostOrderedItem = { name: itemName, quantity: qty };
            maxQty = qty;
            }
        }

        return {
            customers,
            totalIncome,
            totalOrders,
            highestSale,
            mostOrderedItem
        };
    }


    const getDailyStats = async (startDay,startMonth,startYear,endDay,endMonth,endYear) =>{
        const saleInvoices = await getSaleInvoicesByDate(`${startYear}-${startMonth}-${startDay}`,`${endYear}-${endMonth}-${endDay}`);
        const {
            customers,
            totalIncome,
            totalOrders,
            highestSale,
            mostOrderedItem
        } = summarizeInvoices(saleInvoices);
        setCustomers(customers);
        setMostOrderedItem(mostOrderedItem);
        setTotalIncome(totalIncome);
        sethighestSale(highestSale);
        setTotalOrders(totalOrders);

    }


    return ( 
        <div className="pos">
            <div className="pos-nav-bar">
              <div className="pos-nav-bar-option" onClick={()=>{navigate("/home")}}>Home</div>
              <div className="pos-nav-bar-option" onClick={()=>{navigate("/pos")}}>POS</div>
           </div>
           <div className="statistics">
                <div className='date-filters'>
                    <div className='date-entries'>
                        <div className="date-entry">
                            <span className='date-label'>Start Day</span>
                            <input ref={(el) => (inputRefs.current[0] = el)} className="date-input" type="number" value={startDay} onChange={(e)=>{setStartDay(e.target.value)}}/>
                        </div>
                        <div className="date-entry">
                            <span className='date-label'>Start Month</span>
                            <input ref={(el) => (inputRefs.current[1] = el)} className="date-input" type="number" value={startMonth} onChange={(e)=>{setStartMonth(e.target.value)}}/>
                        </div>
                        <div className="date-entry">
                            <span className='date-label'>Start Year</span>
                            <input ref={(el) => (inputRefs.current[2] = el)} className="date-input" type="number" value={startYear} onChange={(e)=>{setStartYear(e.target.value)}}/>
                        </div>
                    </div>
                    <div className='date-entries'>
                        <div className="date-entry">
                            <span className='date-label'>End Day</span>
                            <input ref={(el) => (inputRefs.current[3] = el)}  className="date-input" value={endDay} type="number" onChange={(e)=>{setEndDay(e.target.value)}}/>
                        </div>
                        <div className="date-entry">
                            <span className='date-label'>End Month</span>
                            <input ref={(el) => (inputRefs.current[4] = el)} className="date-input" value={endMonth} type="number" onChange={(e)=>{setEndMonth(e.target.value)}}/>
                        </div>
                        <div className="date-entry">
                            <span className='date-label'>End Year</span>
                            <input ref={(el) => (inputRefs.current[5] = el)} className="date-input" value={endYear} type="number" onChange={(e)=>{setEndYear(e.target.value)}}/>
                        </div>
                    </div>
                </div>
                <button className='stat-fun' ref={(el) => (inputRefs.current[6] = el)} onClick={()=>{getDailyStats(startDay,startMonth,startYear,endDay,endMonth,endYear)}}>Get Stats</button>
    
                <div className='stat-data'>
                    <div className='stat-data-container'>
                        <span className="stat-data-label">Total Customers</span>
                        <span className="stat-data-value">{customers}</span>
                    </div>
                    <div className='stat-data-container'>
                        <span className="stat-data-label">Most Ordered Item </span>
                        <span className="stat-data-value">{mostOrderedItem?.name}</span> 
                    </div>
                    <div className='stat-data-container'>
                        <span className="stat-data-label">Highest Sale </span>
                        <span className="stat-data-value">{highestSale}<span id='price'>$</span></span> 
                    </div>
                    <div className='stat-data-container'>
                        <span className="stat-data-label">Total Income </span>
                        <span className="stat-data-value">{totalIncome}<span id='price'>$</span></span> 
                    </div>
                    <div className='stat-data-container'>
                        <span className="stat-data-label">Total Orders </span>
                        <span className="stat-data-value">{totalOrders}</span> 
                    </div>
                </div>
            </div>
                </div>
     );
}
 
export default Statistics;