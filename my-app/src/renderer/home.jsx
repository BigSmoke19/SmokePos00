import { useEffect, useState } from 'react';
import './styles/home.css';
import { useNavigate } from "react-router";
import axios from 'axios';
import Verify from './verify';


const Home = () => {

   
   
   const navigate = useNavigate();

   const [verfivation,setVerification] = useState(false);

   useEffect(() => {
      const checkAndInitUser = async () => {
         try {
            // Check if user with userName "user" exists
            const res = await axios.get("http://localhost:8000/api/Users");
            const exists = res.data.some(u => u.id === 1);
            if (!exists) {
               // Call initUser endpoint to create default user
               await axios.post("http://localhost:8000/api/Users");
               console.log("User Created");
            }
            else{
               console.log("User Exist");
            }
         } catch (err) {
            if(err.response && err.response.status === 404){
               // Call initUser endpoint to create default user
               await axios.post("http://localhost:8000/api/Users");
               console.log("User Created");
            }
            else{
            
               console.error("Error checking/creating default user:", err);
            }
         }
      };
      checkAndInitUser();
   }, []);
    

   const navigateSettings = () =>{
      setVerification(true);
   }


    return ( 
        <div className="home">
         {verfivation && <Verify setVerification={setVerification} navigate={navigate}/>}
           <div className="home-nav-bar">
              <div className="home-nav-bar-option" onClick={()=>{navigate('/pos')}}>POS</div>
              <div className="home-nav-bar-option" onClick={()=>{navigateSettings()}}>Settings</div>
              <div className="home-nav-bar-option" onClick={()=>{navigate('/')}}>Logout</div>
           </div>
           <div className="home-body">
            <div className="home-body-route">
               <h2>Items</h2>
               <div className="sub-routes">
                  <div className="sub-route" onClick={()=>{navigate('/items')}}>Items</div>
                  <div className="sub-route" onClick={()=>{navigate('/categories')}}>Categories</div>
               </div>
            </div>
            <div className="home-body-route">
               <h2>Sales</h2>
               <div className="sub-routes">
                  <div className="sub-route" onClick={()=>{navigate('/saleInvoices')}}>Sell Invoices</div>
                  <div className="sub-route" onClick={()=>{navigate('/statistics')}}>Statistics</div>
               </div>
            </div>
           </div>
        </div>
     );
}
 
export default Home;