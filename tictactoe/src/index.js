import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
//import App from './App';
import reportWebVitals from './reportWebVitals';

function Square(props){
  // check whether to highlight the square
  const highlight = props.highlight ? "highlight" : "";
  return (
    <button className={`square ${highlight}`} onClick={props.onClick}>
      {props.value}
    </button>
  )
}


class Board extends React.Component {
  renderSquare(i) {
    return <Square 
              key={i}
              value = {this.props.squares[i]} 
              onClick = {() => this.props.onClick(i)}
              // check if square at index i included in winnerSquares
              // then pass result to Square component for later highlight
              highlight = {this.props.winnerSquares.includes(i)}/>;
  }

  // nested for loop to render board
  renderBoard(){
    const rows = [];
    const times = 3;
    

    for (let i = 0; i < 3; i++){
      let squares = []
      for (let j = 0; j < 3; j++){
        let square = this.renderSquare(j + i * times);
        squares.push(square);

      }
      rows.push(<div className="board-row" key={i}>{squares}</div>)
    }
    
    return rows;
    
  }

  render() {

    return (
      <div>
        {this.renderBoard()}
        {/* <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>  */}
      </div>
    );
  }
}


class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      xIsNext: true,
      history: [{
        // before first move
        squares: Array(9).fill(null),
        location: {
          col: null,
          row: null
        }
      }],
      stepNumber: 0,
      isAscending: true,
      isDraw: false,
    }
  }

  handleClick(i){
    const history = this.state.history.slice(0,this.state.stepNumber + 1);
    const current = history[history.length-1];
    const squares = current.squares.slice();
    const result = calculateWinner(squares);
    if (result.winner || squares[i]){
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
        // extract col and row from i 
        location: {
          col: i % 3,
          row: Math.floor(i / 3)
        },
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext});
  }

  jumpTo(step){
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    })
  }

  sortMoves(){
    const history = this.state.history.slice();
    
    if (history.length < 1){
      return;
    }
    history.reverse();
    history.map((e,index) => console.log(e.squares + " " + index));
    this.state.history.map((e,index) => console.log(e.squares + " " + index));
    this.setState({
      history: history,
      isAscending: !this.state.isAscending,
    })
    
  }

  convertUnicode(unicode){
    return String.fromCodePoint(parseInt(unicode,16));
  }

  // check for game draw
  boardCheck(squares){
    for (let i = 0; i < squares.length;i++){
      if (squares[i] === null){
        return false;
      }
    }
    return true;
    
    
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    const moves = history.map((step,move) => {
      const desc = move ? 'Go to move #' + move : 'Go to game start';
      return (
        // change class name by iterating through moves then comparing against step number
        // updated in state 
        <li className={move === this.state.stepNumber ? 'active-item' : null} key={move} >
          <button onClick={() => this.jumpTo(move)}>{desc} </button>
          <p>Column:  {step.location.col} Row: {step.location.row}</p>
        </li>
      )
    })
    let status;
    if (winner.winner){
      status = 'Winner: ' + winner.winner;
      
    }
    else if (this.boardCheck(current.squares)){
      status = 'Game draw';
    }
    else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }
    
    return (
      <div className="game">
        <div className="game-board">
          {/* Pass winning squares to Board component for later highlight */
          /* React can adjust the class name later when playing */}
          <Board squares={current.squares} onClick={(i) => this.handleClick(i)} winnerSquares={winner.squares}/>
        </div>
        <div className="game-info">
          <div>{status}</div>
          <div>
            <button onClick={() => this.sortMoves()}>
              Sort Moves
              {this.state.isAscending ? this.convertUnicode('2B83') : this.convertUnicode('2B81')}
            </button>
          </div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Game />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

function calculateWinner(squares) {
  // result contain indices of winning squares
  // and either 'X' or 'O' who is the winner
  const result = {
    squares: [],
    winner: null
  }

  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      result.squares.push(a,b,c); // push a,b,c into winning squares
      result.winner = squares[a]

      return result;
    }
  }
  return result;
}
