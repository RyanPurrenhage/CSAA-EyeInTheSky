import Database from '../Components/Database'

function Customers() {
    let info = null;

    info = <Database />

    return(
        <div>
            {info}
        </div>
    );
}


export default Customers