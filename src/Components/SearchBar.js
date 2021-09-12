import { FaSearch } from 'react-icons/fa'
import '../CSS/searchBar.css'


function SearchBar({placeholder}) {
    return (
        <div className="search">
            <div className="search-container">
                <input  id="search-input" className="search-input" type="text" placeholder="Address or Latlong" />
                <i className="fa"><FaSearch /></i>
            </div> 
        </div>
    )
}

export default SearchBar
