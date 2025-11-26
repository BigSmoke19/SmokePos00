import { useDispatch, useSelector } from 'react-redux';
import './styles/categories.css';
import { useEffect,useState} from 'react';
import { getCategories } from '../../state/categories/categoriesSlice.js';
import axios from 'axios';
import Loading from './loading.jsx';
import { useNavigate } from 'react-router';


const Categories = () => {

    const {categories, status, error} = useSelector(state => state.categories);

    const dispatch = useDispatch();

    const [newCategory,setNewCategory] = useState('');

    const navigate = useNavigate();
    
    const [editId,setEditId] = useState(null);
    const [newCat,setNewCat] = useState(null);

    useEffect(()=>{
        dispatch(getCategories());
        
    },[dispatch]);

    useEffect(()=>{console.log(categories);},[categories])

    const AddCategory = async () => {

        try {
            const response = await axios.post('http://localhost:8000/api/categories', {
                category: newCategory
        })
        if (response.status === 201) {
            console.log(`Category added with ID: ${response.data.insertId}`);
            setNewCategory('');
        }
        } catch (error) {
            console.error(error.response?.data?.message || 'Something went wrong')
        }

        window.electronAPI.reload();
  };

    const updateCategory = async (id, updatedFields) => {
    try {
        const response = await axios.put(`http://localhost:8000/api/categories/${parseInt(id)}`, updatedFields);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: error.message };
    }
    };


    const handleUpdate = async (id) => {
        if(newCat && newCat !== ""){
             try {
                const response = await updateCategory(id, { category: newCat });
                console.log(response.message);
            } catch (error) {
                console.error('Update failed:', error.message);
            }
        }
        setEditId(null);
        setNewCat(null);

        window.electronAPI.reload();
    };


    const deleteCategory = async (id) =>{
         const options = {
            title: "Confirm Action",
            message: "Are you sure you want to Delete this Item??",
        };

        const result = await window.electronAPI.showConfirmDialog(options);

            if (result === 0) {
                try {
                    const response = await axios.delete(`http://localhost:8000/api/categories/${parseInt(id)}`);
                    window.electronAPI.reload();
                    return response.data;
                } catch (error) {
                    throw error.response?.data || { message: error.message };
                }

                }
        else{}


        
    }

    const handleUpdate0 = (id,cat) =>{
        setEditId(id);
        setNewCat(cat);
    }

    return ( 
        <div className="pos">
             <div className="pos-nav-bar">
              <div className="pos-nav-bar-option" onClick={()=>{navigate("/home")}}>Home</div>
              <div className="pos-nav-bar-option" onClick={()=>{navigate("/pos")}}>POS</div>
              <div className="pos-nav-bar-option" onClick={()=>{navigate("/items")}}>Items</div>
           </div>
           <div className="categories">
            <div className="add-cat">
                <h2 className="add-cat-title">Add a new Category</h2>
                <div className="add-cat-container">
                    <input className="add-cat-input" value={newCategory} type="text" onChange={(e)=>setNewCategory(e.target.value)}/>
                    <button className="add-cat-button" onClick={()=>{(newCategory !== '')?AddCategory():()=>{}}}>Add</button>
                </div>
            </div>
            <div className='categories-cat-container'>
                {status === "loading" && <Loading/>}
                {status === "succeeded" && categories && categories.map((cat)=>(
                    <div className="categories-cat" key={cat.id}>
                            <span className='item-detail'>{cat.category}</span>
                            {editId === cat.id && <input className='edit-input' type='text' value={newCat} onChange={(e)=>{setNewCat(e.target.value)}}/>}
                            {editId !== cat.id && <button className='item-detail' id='edit-btn' onClick={()=>{handleUpdate0(cat.id,cat.category)}}>Edit</button>}
                            {editId === cat.id && <button className='item-detail' id='edit-btn' onClick={()=>{handleUpdate(cat.id)}}>Save</button>}
                            <button className='item-detail' id='edit-btn' onClick={()=>deleteCategory(cat.id)}>Delete</button>
                    </div>
                ))}
                {categories?.length === 0  && <p>No Categories Yet!!</p>}
                {categories && error && <p>{console.log(error)}</p>}
            </div>
           </div>
        </div>
     );
}
 
export default Categories;