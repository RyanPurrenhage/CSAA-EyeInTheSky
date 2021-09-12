

function Scores({ firescore, confidence }) {
    return(
       <div>
            <p className="score-label">Fire Risk: </p>
            <p className="score-value">{firescore}</p>
       </div>
    );
}

export default Scores