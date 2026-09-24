import { Link } from 'react-router-dom';
import Button from '@mui/material/Button';
import { IoIosMenu } from "react-icons/io";
import { FaAngleDown } from "react-icons/fa6";


const Navigation = () => {
    return (
        <nav>
            <div className='container'>
                <div className='row align-items-center'>
                    <div className='col-sm-3 navPart1'>
                        <Button className='allCatTab'>
                            <span className='icon1'><IoIosMenu/></span>
                            <span className="text">ALL CATEGORIES</span>
                            <span className='icon2'><FaAngleDown/></span>
                        </Button>
                    </div>

                    <div className='col-sm-9 navPart2 d-flex align'>
                        <ul className='list list-inline ml-auto'>
                            <li className='list-inline-item'><Link to="/">HOME</Link></li>
                            <li className='list-inline-item'><Link to="/fashion">FASHION</Link></li>
                            <li className='list-inline-item'><Link to="/electronic">ELECTRONIC</Link></li>
                            <li className='list-inline-item'><Link to="/bakery">BAKERY</Link></li>
                            <li className='list-inline-item'><Link to="/grocery">GROCERY</Link></li>
                            <li className='list-inline-item'><Link to="/blog">BLOG</Link></li>
                            <li className='list-inline-item'><Link to="/contact">CONTACT</Link></li>
                        </ul>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navigation;