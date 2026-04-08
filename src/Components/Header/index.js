import { Link } from "react-router-dom";
import logo from '../../assets/images/Logo.png';
import CountryDropdown from "../CountryDropdown";
import { IoIosSearch } from "react-icons/io";
import Button from '@mui/material/Button';
import { FiUser } from "react-icons/fi";
import { FiShoppingCart } from "react-icons/fi";


const Header = () => {
    return (
        <>
            <div className="headerWrapper">
                <div className="top-strip bg-blue">
                    <div className="container">
                        {/* Fixed: Removed redundant nested <b> tags */}
                        <p className="mb-0 mt-0 text-center"><b>📣 Affordable and comfortable shopping 📣</b></p>
                    </div>
                </div>

                <header className="header">
                    <div className="container">
                        <div className="row">
                            <div className="logoWrapper d-flex align-items-center col-sm-2">
                                <Link to={'/'}><img src={logo} alt='Logo' /></Link>
                            </div>

                            <div className='col-sm-10 d-flex align-items-center part2 '>
                                <CountryDropdown />

                                {/*Header Search Start Here */}
                                <div className='headerSearch ml-3 mr-3'>
                                    <input type='text' placeholder='Search for products....' />
                                    <Button><IoIosSearch /></Button>
                                </div>
                                {/*Header Search ends Here */}

                                <div className='part3 d-flex align-items-center ml-auto'>
                                    <Button className='circle mr-3'><FiUser /></Button>
                                    <div className='ml-auto carTab d-flex align-items-center'>
                                        <span className='price'>৳329</span>
                                        <div className='position-relative ml-2'>
                                            <Button className='circle'><FiShoppingCart /></Button>
                                            <span className='count d-flex align-items-center justify-content-center'>1</span>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </header>
            </div>
        </>
    )
}

export default Header;