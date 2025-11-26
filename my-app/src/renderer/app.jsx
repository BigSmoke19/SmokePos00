import { Route,HashRouter as Router,Routes } from "react-router";
import Home from "./home";
import './styles/app.css';
import POS from "./pos";
import Items from "./items";
import Categories from "./categories";
import SaleInvoices from "./saleInvoices";
import Statistics from "./statistics";
import Settings from "./settings";
import Login from "./logIn";


const App = () => {
    return ( 
        <Router>
            <Routes>
                <Route exact path="/" element={<Login/>}  />
                <Route path="/home" element={<Home/>}  />
                <Route exact path="/pos" element={<POS/>}  />
                <Route exact path="/items" element={<Items/>}  />
                <Route exact path="/categories" element={<Categories/>}  />
                <Route exact path="/saleInvoices" element={<SaleInvoices/>}  />
                <Route exact path="/statistics" element={<Statistics/>}  />
                <Route exact path="/settings" element={<Settings/>}  />
                
            </Routes>
        </Router>
     );
}
 
export default App;