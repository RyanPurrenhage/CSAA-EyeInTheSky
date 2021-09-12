import logo from '../Assets/Images/logo.svg'
import '../CSS/header.css'


const Header = () => {
    return (
        <div className="header">
            <img
                alt=""
                src={logo}
                width="180"
                height="120"
                className="d-inline-block align-top"
            />
        </div>
    );
}

export default Header
