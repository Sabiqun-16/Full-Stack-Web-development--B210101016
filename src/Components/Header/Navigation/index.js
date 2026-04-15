import Button from '@mui/material/Button';
import { IoIosMenu } from "react-icons/io";
import { FaAngleDown } from "react-icons/fa6";



const Navigation = () => {
    return (
        <nav>
            <div className='container'>
                <div className='row'>
                    <div className='col-sm-3 navpart1'>
                        <Button className='allCatTab align-items-center'>
                            <span className='icon1'><IoIosMenu/></span>
                            <span className="text">ALL CATEGORIES</span>
                            <span className='icon2'><FaAngleDown/></span>
                            
                        </Button>
                    </div>

                    <div className='col-sm-9 navpart2'>
                    </div>
                </div>
            </div>
        </nav>
    )

}

export default Navigation;