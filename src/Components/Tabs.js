import '../CSS/tabs.css'

const Tabs = ({ onChangeTab, isActive }) => {
    return(
        <div className="tabs">

            <button className={`tab-button ${isActive==='Drone' ? 'tab-active' : ''}`}
            onClick={() => onChangeTab("Drone")}
            >
                Drone Feed
            </button>

            <button className={`tab-button ${isActive==='Map' ? 'tab-active' : ''}`}
            onClick={() => onChangeTab("Map")}
            >
                Coverage Map
            </button>

        </div>
    );
}

export default Tabs;