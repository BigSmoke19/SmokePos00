import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useDispatch,useSelector } from 'react-redux';
import { getUsers } from '../../state/users/usersSlice';
import './styles/settings.css';
import axios from 'axios';

const Settings = () => {

    const navigate = useNavigate();

    const dispatch = useDispatch();
    const {users, status, error} = useSelector(state => state.users);

    const [userName,setUserName] = useState("");
    const [password,setPassword] = useState("");
    const [confirmPassword,setConfirmPassword] = useState("");
    const [companyName,setCompanyName] = useState("");
    const [phoneNumber,setPhoneNumber] = useState("");
    const [location,setLocation] = useState("");
    const [description,setDescription] = useState("");


    const [printers, setPrinters] = useState([]);
    const [selectedPrinter, setSelectedPrinter] = useState("");


    useEffect(()=>{
        dispatch(getUsers());
    },[dispatch]);


      useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch available printers
        const printerList = await window.electronAPI.getPrinters();
        setPrinters(printerList);

        // Load saved printer from config
        const config = await window.electronAPI.getConfig();
        if (config?.printer) {
          setSelectedPrinter(config.printer);

        }
      } catch (err) {
        console.error("Error fetching printers/config:", err);
      }
    };
    fetchData();
  }, []);

    const handleSelect = async (e) => {
        const printerName = e.target.value;
        setSelectedPrinter(printerName);
        await window.electronAPI.setConfig({ printer: printerName }); // ✅ save to config.json
    };

    const handleSaveCompany = async () =>{
        if(companyName && phoneNumber && location && description){
            await window.electronAPI.setConfig({ companyName: companyName,location: location,phoneNumber: phoneNumber,description: description });
         const options = {
            title: "Company Info Updated!!",
            message: `Hello ${companyName}`,
        };

        result = await window.electronAPI.showConfirmDialog(options);
        }
    }

    const handleSaveUser = async () =>{

        console.log(users[0].id, users[0].userName);

        if(userName !== "" && password !== "" && confirmPassword !== ""){
            if(password === confirmPassword){
                try {
                // Update the first user (adjust if you support multiple users)
                const userId = parseInt(users[0]?.id);
                if(userId){
                    console.log(userId)
                    await axios.put(`http://localhost:8000/api/Users/${userId}`, {
                    userName,
                    password,
                    });
                    const options = {
                        title: "Success",
                        message: "User updated successfully!",
                    };
                    await window.electronAPI.showConfirmDialog(options);
                    dispatch(getUsers()); // Refresh user info
                    setPassword("");
                    setConfirmPassword("");
                }
                else{
                    const options = {
                    title: "Error",
                    message: "No user found to update.",
                };
                await window.electronAPI.showConfirmDialog(options);
                    return;
                }
                
            } catch (err) {
                const options = {
                    title: "Error",
                    message: err.response?.data?.msg || "Failed to update user.",
                };
                await window.electronAPI.showConfirmDialog(options);
            }
            }
            else{
                const options = {
                    title: "Error!!!",
                    message: `passwords must match!!!`,
                };

                result = await window.electronAPI.showConfirmDialog(options);
            }
        }
        else{
            const options = {
                    title: "Error!!!",
                    message: `User name or password can't be empty!!`,
                };

                result = await window.electronAPI.showConfirmDialog(options);
        }

    }

    return ( 
        <div className="pos">
            <div className="pos-nav-bar">
              <div className="pos-nav-bar-option" onClick={()=>{navigate("/home")}}>Home</div>
              <div className="pos-nav-bar-option" onClick={()=>{navigate("/pos")}}>POS</div>
              <div className="pos-nav-bar-option" onClick={()=>{navigate("/")}}>Log Out</div>
           </div>
           <div className="settings">
            <div className="settings-entries">
                <h2  className='settings-title'>User Info</h2>

                <div className="settings-input">
                    <span className="settings-label">UserName</span>
                    <input type="text" value={userName} onChange={(e)=>{setUserName(e.target.value)}} className="user-info-input" />
                </div>
                <div className="settings-input">
                    <span className="settings-label">New Password</span>
                    <input style={{marginBottom:"10px"}}type="password" value={password} onChange={(e)=>{setPassword(e.target.value)}} className="user-info-input" />
                </div>
                <div className="settings-input">
                    <span className="settings-label">Confirm New Password</span>
                    <input style={{marginBottom:"10px"}} type="password" value={confirmPassword} onChange={(e)=>{setConfirmPassword(e.target.value)}} className="user-info-input" />
                </div>
                <button className='settings-btn' onClick={()=>{handleSaveUser()}}>Save New User</button>
            </div>
            <div className="settings-entries">
                <h2  className='settings-title'>Company Info</h2>
                <div className="settings-input">
                    <span className="settings-label">Company Name</span>
                    <input type="text" value={companyName} onChange={(e)=>{setCompanyName(e.target.value)}} className="user-info-input" />
                </div>
                <div className="settings-input">
                    <span className="settings-label">Phone Number</span>
                    <input type="text" value={phoneNumber} onChange={(e)=>{setPhoneNumber(e.target.value)}} className="user-info-input" />
                </div>
                <div className="settings-input">
                    <span className="settings-label">Location</span>
                    <input type="text" value={location} onChange={(e)=>{setLocation(e.target.value)}} className="user-info-input" />
                </div>
                <div className="settings-input">
                    <span className="settings-label">Description</span>
                    <input type="text" value={description} onChange={(e)=>{setDescription(e.target.value)}} className="user-info-input" />
                </div>
                <button className='settings-btn' onClick={()=>{handleSaveCompany()}}>Save Changes</button>
            </div>
            <div className='settings-entries'>
                <h2>Print Settings</h2>
                    <select style={{marginBottom:"10px"}}
                        value={selectedPrinter}
                        onChange={handleSelect}
                        className="border p-2 rounded w-full"
                        >
                        <option value="">-- Choose a printer --</option>
                        {printers.map((p) => (
                        <option key={p.name} value={p.name}>
                            {p.name}
                        </option>
                        ))}
                    </select>
            </div>
           </div>
        </div>
     );
}
 
export default Settings;