import './styles/verify.css';
import { useDispatch,useSelector } from 'react-redux';
import { getUsers } from '../../state/users/usersSlice';
import { useEffect, useState } from 'react';
import bcrypt from 'bcryptjs';

const Verify = ({setVerification,navigate}) => {

    const dispatch = useDispatch();
    const {users, status, error} = useSelector(state => state.users);

    const [password,setPassword] = useState("");

         
    useEffect(()=>{
        dispatch(getUsers());
    },[dispatch]);

    const verifyPassword = async() =>{
        const hashedPassword = await bcrypt.hash(password, 10);
        if(bcrypt.compareSync(password, users[0].password)){
            navigate("/settings");
        }
        else{
            const options = {
            title: "Error",
            message: `Wrong Password!!`,
        };

        result = await window.electronAPI.showConfirmDialog(options);
        }
    }

    return ( 
        <div className="verify">
           <div className="verify-container">
                <h2 className='verify-title'>Enter User Password</h2>
                <input className='verify-input' value={password} onChange={(e)=>{setPassword(e.target.value)}} type="password" />
                <div className='verify-btns'>
                    <button className='verify-btn' onClick={()=>{verifyPassword()}}>Verify</button>
                    <button className='verify-btn' onClick={()=>{setVerification(false)}}>Cancel</button>
                </div>
           </div>
        </div>
     );
}
 
export default Verify;