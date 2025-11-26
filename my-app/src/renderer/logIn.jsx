import { useState,useEffect,useRef } from 'react';
import './styles/login.css';
import { useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { getUsers } from '../../state/users/usersSlice';
import bcrypt from 'bcryptjs';



const Login = () => {

    const {users, status, error: usersError} =  useSelector(state => state.users);
    const dispatch = useDispatch();

    const [user,setUser] = useState("");
    const [password,setPassword] = useState("");
    const [error,setError] = useState(null);
    const [isPending,setIsPending] = useState(false);
    const navigate = useNavigate();

    const [recovery,setRecovery] = useState("");
    const [recoveryMode,setRecoveryMode] = useState(false);

    const inputRefs = useRef([]);

    useEffect(()=>{
        dispatch(getUsers());
    },[dispatch])

    useEffect(() => {
        const handleKeyDown = (event) => {
            const currentIndex = inputRefs.current.indexOf(document.activeElement);
            if (event.key === 'Enter' && currentIndex < inputRefs.current.length - 1) {
              inputRefs.current[currentIndex + 1].focus();
              event.preventDefault();
            }
            else if (event.key === 'ArrowDown'  && currentIndex < inputRefs.current.length - 1) {
                inputRefs.current[currentIndex + 1].focus();
            } else if (event.key === 'ArrowUp'&& currentIndex > 0) {
                inputRefs.current[currentIndex - 1].focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);


    const handleLogin = async () =>{
        setIsPending(true);
        setError(null);
        if(user !== "" && password !== ""){
            const hashedPassword = await bcrypt.hash(password, 10);
            if(user === users[0].userName &&  bcrypt.compareSync(password, users[0].password)){
                navigate("/home");
            }
            else{
                setError("Wrong Entries!!");
            }
        }
        
        
        setIsPending(false);
    }


    const getMacAddress = async () => {
    return await window.electronAPI.getMacAddress();
    };


    const recoverPassword = async() =>{
        const re = await getMacAddress();
        if(recovery === re){
            navigate("/settings");
        }else{
            const options = {
                    title: "Error!!!",
                    message: `Recovery Faild!!!`,
                };

                result = await window.electronAPI.showConfirmDialog(options);
        }
        
    }


    return (
         <div className="login">
            <div className="login-container">
                
                <div className="login-input-container">
                    <label className='login-label'>User: </label>
                    <input ref={(el) => (inputRefs.current[0] = el)} disabled={isPending} onChange={(e)=>{setUser(e.target.value)}} className="login-input" type="text" />
                </div>
                <div className="login-input-container">
                    <label className='login-label'>Password: </label>
                    <input ref={(el) => (inputRefs.current[1] = el)} disabled={isPending} onChange={(e)=>{setPassword(e.target.value)}} className="login-input" type="password" />
                </div>
                <div className="login-input-container">
                    <button ref={(el) => (inputRefs.current[2] = el)} disabled={isPending} className='login-btn' onClick={handleLogin}>{(isPending)?"Logging in ... ":"Login"}</button>
                </div>
            </div>
            <div className='recover' onClick={()=>{setRecoveryMode(true)}}>Recover User</div>
            {recoveryMode && <input type="text" onChange={(e)=>{setRecovery(e.target.value)}}/>}
            {recoveryMode && <button className='recover-btn' onClick={()=>{recoverPassword()}}>Recover</button>}
            {error && <div style={{fontSize:"x-large"}} className="error">{error}</div>}
         </div> 
        );
}
 
export default Login;