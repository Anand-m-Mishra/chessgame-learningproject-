const express = require("express");
const http = require("http");
const socket = require("socket.io");
const {Chess} = require("chess.js");


const app = express();

const server = http.createServer(app);

const io = socket(server);

const chess = new Chess();

const path = require("path");
const { log } = require("console");

let players = {};

let currentplayer = "W";

app.set("view engine","ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/",(req,res)=>{
    res.render("index");
})

io.on("connection",(unisocket)=>{
    console.log("player connected");
   
    if(!players.white){
        players.white = unisocket.id;
        unisocket.emit("player role","w");
    }
    else if(!players.black){
        players.black = unisocket.id;
        unisocket.emit("player role","b");
    }else{
        unisocket.emit("game full");
    }

    unisocket.on("disconnected",()=>{
        if(players.white===unisocket.id){
            delete players.white
        }
        if(players.black === unisocket.id){
            delete players.black
        }
    });

    unisocket.on("move",(move)=>{
        try{
            //checks if right person is taking the turn
        if(chess.turn =="w" && unisocket.id!=players.white) return;
        if(chess.turn =="b" && unisocket.id!=players.black) return;

        const result = chess.move(move);//checks if a valid move

        if(result){
            currentplayer = chess.turn();
            io.emit("move",move);
            io.emit("boardstate",chess.fen());
        }
        else{
            console.log("Invalid move",move);
            unisocket.emit("Invalid move");
        }
    }
    catch(err){
        console.log(err);
        unisocket.emit("invalid move: ",move);
    }
    });
});

server.listen(3000,()=>{
    console.log("Listening on port 3000"); 
})



