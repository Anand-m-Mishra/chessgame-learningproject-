//const Chess = require("chess.js");
const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessboard");

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

//render board for the 1st time

const renderBoard = ()=>{
        const board = chess.board();
        boardElement.innerHTML = "";
        board.forEach((row,rowIndex)=>{
                row.forEach((square,squareIndex)=>{
                    //create the div for each square
                    const squareElement = document.createElement("div");
                    squareElement.classList.add("square",
                        (rowIndex+squareIndex)%2==0 ?"light":"dark"
                        );
                        squareElement.dataset.row = rowIndex;
                        squareElement.dataset.col = squareIndex;

                        if(square){
                            const pieceELement = document.createElement("div");
                            pieceELement.classList.add("piece",
                                square.color==="W"?"white":"black"
                            );

                            pieceELement.innerText = getPieceUnicode(square);
                            pieceELement.draggable = playerRole===square.color;

                            pieceELement.addEventListener("dragstart",(e)=>{
                                if(pieceELement.draggable){
                                    draggedPiece = pieceELement;
                                    sourceSquare = {row:rowIndex,col:squareIndex};
                                    e.dataTransfer.setData("text/plain","");
                                }
                            });
                            
                            pieceELement.addEventListener("dragend",(e)=>{
                                draggedPiece = null;
                                sourceSquare = null;
                            });
                            //attach the piece on the square
                            squareElement.appendChild(pieceELement);
                        }

                        squareElement.addEventListener("dragover",(e)=>{
                            e.preventDefault();
                        });

                        squareElement.addEventListener("drop",(e)=>{
                            e.preventDefault();
                            if(draggedPiece){
                                const targetSource = {
                                    row: parseInt(e.squareElement.dataset.row),
                                    col:parseInt(e.squareElement.dataset.col)
                                };

                                handleMove(sourceSquare,targetSource);
                            } 
                            
                        });
                       boardElement.appendChild(squareElement); 
                });   
        });           


    if(playerRole==='b'){
        boardElement.classList.add("flipped");
    }
    else{
        boardElement.classList.remove("flipped");
    }
};

const handleMove =(source,target)=>{
    const move ={
        from:`${String.fromCharCode(97+source.col)}${(8-source.row)}`,
        to:`${(String.fromCharCode(97+target.col))}${(8-target.row)}`,
        promotion:'q'
    }

    socket.emit("move",move);
} 

const getPieceUnicode = (piece) => {
    const unicodePieces = {
        k: "♚", // black king
        q: "♛", // black queen
        r: "♜", // black rook
        b: "♝", // black bishop
        n: "♞", // black knight
        p: "♟", // black pawn
        K: "♔", // white king
        Q: "♕", // white queen
        R: "♖", // white rook
        B: "♗", // white bishop
        N: "♘", // white knight
        P: "♙" // white pawn
      };
    return unicodePieces[piece.type]||"";
  };

  socket.on("playerRole",(role)=>{
    playerRole = role;
    renderBoard();
  });

  socket.on("boardState",()=>{
    chess.load(fen);
    renderBoard();
  });

  socket.on("move",(move)=>{
    chess.move(move);
    renderBoard();
  });


renderBoard();

