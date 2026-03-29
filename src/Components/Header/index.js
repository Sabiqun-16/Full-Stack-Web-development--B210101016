import { Link } from "react-router-dom";
import logo from '../../assets/images/Logo.png';
import CountryDropdown from "../CountryDropdown";

const Header =()=>{
    return(
        <>
            <div className="headerWrapper">
                <div className="top-strip bg-blue">
                    <div className="container">
                        <p className="mb-0 mt-0 text-center"><b><b>📣 Affordable and comfortable shopping 📣</b></b> </p>
                    </div>
                </div>

                <div className="header">
                    <div className="container">
                        <div className="row">
                            <div className="logoWrapper d-flex align-items-center col-sm-2">
                                <Link to={'/'}><img src={logo} alt='Logo'/></Link>
                            </div>

                            <div className='col-sm-10 d-flex align-items-center part2 '>
                               <CountryDropdown/>

                               {/*Header Search Start Here */}
                               
                               {/*Header Search ends Here */}

                            </div>
                        </div>
                    </div> 
                </div>
            </div>
        </>
    )
}

export default Header;