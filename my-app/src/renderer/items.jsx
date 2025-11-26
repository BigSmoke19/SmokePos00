import './styles/items.css'
import { useNavigate } from 'react-router';
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { getItems } from '../../state/items/itemsSlice';
import { getCategories } from '../../state/categories/categoriesSlice';
import axios from 'axios';


const Items = () => {

    const dispatch = useDispatch();
    const {items, status, error} = useSelector(state => state.items);
    const {categories , status : catStatus, error : catError} = useSelector(state => state.categories);

    const [selectedItems,setSelectedItems] = useState(null);
    //const [categories,setCategories] = useState(null);
    const [selectedCat,setSelectedCat] = useState(null);

    const [editItemId,setEditItemId] = useState(null);
    const [editItemName,setEditItemName] = useState(null);
    const [editItemCategory,setEditItemCategory] = useState(null);
    const [editItemPrice,setEditItemPrice] = useState(null);
    const [editItemBc,setEditItemBc] = useState(null);

    const [newItemName,setNewItemName] = useState("");
    const [newItemCategory,setNewItemCategory] = useState("");
    const [newItemPrice,setNewItemPrice] = useState(0);
    const [newItemBc,setNewItemBc] = useState("");

    const navigate = useNavigate();
    
    const inputRefs = useRef([]);

    useEffect(()=>{
        dispatch(getItems());
        dispatch(getCategories());
    },[dispatch])

    useEffect(()=>{
        console.log(items)
    },[items])

  useEffect(()=>{
        if(categories){
            selectCat(categories[0]?.category);
        }
    },[categories]);

    const selectCat = (cat) => {
        let newItems = [];
        items.forEach((item)=>{
            if(item.category === cat){
                newItems.push(item)
            }
        });

        setSelectedItems(newItems);
        setSelectedCat(cat)
    };

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

    const handleEditItem = ( item) =>{
        setEditItemId(item.id);
        setEditItemName(item.name);
        setEditItemCategory(item.category);
        setEditItemPrice(parseFloat(item.price));
        setEditItemBc(item.barCode);
    }

    const updateItem = async (id, updatedFields) => {
    try {
        const response = await axios.put(`http://localhost:8000/api/items/${parseInt(id)}`, updatedFields);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: error.msg };
    }
    };


    const handleUpdate = async (id) => {
        if(editItemId && editItemCategory && editItemName && editItemPrice){
             try {
                const response = await updateItem(id, { name: editItemName,price: editItemPrice,category: editItemCategory , barCode: editItemBc});
                console.log(response.message);
            } catch (error) {
                console.error('Update failed:', error.msg);
            }
        }
        setEditItemId(null);
        setEditItemName(null);
        setEditItemCategory(null);
        setEditItemPrice(null);
        setEditItemBc(null);

       window.electronAPI.reload();
    };

    
    const handleAddNewItem = async () => {
        console.log(newItemBc)
        if(newItemName !== "" && newItemCategory !== "" && parseFloat(newItemPrice) !== 0)
        {
            try {
                const response = await axios.post('http://localhost:8000/api/items', 
                    {
                    name: newItemName,
                    price: parseFloat(newItemPrice),
                    category: newItemCategory,
                    barCode: newItemBc || null
            })
            if (response.status === 201) {
                console.log(`Item added with ID: ${response.data.insertId}`);
                setNewItemName('');
                setNewItemPrice(0);
                setNewItemCategory('');
                setNewItemBc("");
            }
            } catch (error) {
                console.log(error);
                console.error(error.response?.data?.msg || 'Something went wrong')
            }

            window.electronAPI.reload();
    }
  };

     const deleteItem = async (id) =>{
         const options = {
            title: "Confirm Action",
            message: "Are you sure you want to Delete this Item??",
        };

        const result = await window.electronAPI.showConfirmDialog(options);

            if (result === 0) {
                try {
                    const response = await axios.delete(`http://localhost:8000/api/items/${parseInt(id)}`);
                    window.electronAPI.reload();
                    return response.data;
                } catch (error) {
                    throw error.response?.data || { message: error.message };
                }

                }
        else{}


        
    }


    return ( 
        <div className="pos">
            <div className="pos-nav-bar">
              <div className="pos-nav-bar-option" onClick={()=>{navigate("/home")}}>Home</div>
              <div className="pos-nav-bar-option" onClick={()=>{navigate("/pos")}}>POS</div>
              <div className="pos-nav-bar-option" onClick={()=>{navigate("/categories")}}>Categories</div>
           </div>
            <div  className="add-new-item">
                <h2>Add a new Item</h2>
                <div className="add-item-inputs">
                    <div className="add-item-details">
                        Name: <input ref={(el) => (inputRefs.current[0] = el)} type="text" value={newItemName} onChange={(e)=>{setNewItemName(e.target.value)}} className='item-detail'/>
                        Price: <input ref={(el) => (inputRefs.current[1] = el)} type="number" value={newItemPrice} onChange={(e)=>{setNewItemPrice(parseFloat(e.target.value))}} className='item-detail'/>
                        Category: <select ref={(el) => (inputRefs.current[2] = el)} className='item-detail' onChange={(e)=>{setNewItemCategory(e.target.value)}}>
                            <option className='item-detail' value={newItemCategory}>{newItemCategory}</option>
                            {categories && categories.map((cat)=>(
                                <option key={cat.id} value={cat.category}>{cat.category}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        BarCode: <input id='barCode' ref={(el) => (inputRefs.current[3] = el)} type="text" value={newItemBc} onChange={(e)=>{setNewItemBc(e.target.value)}} className='item-detail'/>
                    </div>
                    <button ref={(el) => (inputRefs.current[4] = el)} className='item-detail' id='edit-btn' onClick={()=>{handleAddNewItem()}}>Save</button>
                </div>
            </div>
           <div className="items">
                <div className="items-categories-list">
                    {categories && categories.map((cat)=>(
                        <div key={cat.id} onClick={()=>selectCat(cat.category)}
                        className={(cat.category === selectedCat)?"selected-category":"items-category"}>
                            {cat.category}
                        </div>
                    ))}
                </div>
                <div className="items-list">
                    {selectedItems && selectedItems.map((item)=>(
                        <div className="item-list-container" key={item.id}>
                            <div  className="items-list-item">
                                <span className='item-detail' id='id'>{item.id}</span>
                                <span className='item-detail'>{item.name}</span>
                                <span className='item-detail' id='price'>{item.price}$</span>
                                <span className='item-detail' >{item.barCode}</span>
                                <button className='item-detail' id='edit-btn' onClick={()=>handleEditItem(item)}>Edit</button>
                                <button className='item-detail' id='edit-btn' onClick={()=>{deleteItem(item.id)}}>Delete</button>
                            </div>
                            {editItemId === item.id &&<div  className="items-list-item">
                                <input type="text" value={editItemName} onChange={(e)=>{setEditItemName(e.target.value)}} className='item-detail'/>
                                <input type="number" value={editItemPrice} onChange={(e)=>{setEditItemPrice(parseFloat(e.target.value))}} className='item-detail'/>
                                <select  onChange={(e)=>{setEditItemCategory(e.target.value)}}>
                                    <option value={editItemCategory}>{editItemCategory}</option>
                                    {categories && categories.map((cat)=>(
                                        <option key={cat.id} value={cat.category}>{cat.category}</option>
                                    ))}
                                </select>
                                <input type="text" value={editItemBc} onChange={(e)=>{setEditItemBc(e.target.value)}} className='item-detail'/>
                                <button className='item-detail' id='edit-btn' onClick={()=>{handleUpdate(item.id)}}>Save</button>
                            </div>}
                        </div>
                    ))}
                </div>
           </div>
        </div>
     );
}
 
export default Items;