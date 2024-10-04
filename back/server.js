require('dotenv').config({path:'variaveis.env'});
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const server = express();
const routes = require('./routes');
const servicos = require('./servicos');
 
server.use(cors());
server.use(bodyParser.json());
server.use(express.json());
server.use(routes);

servicos.initializeDatabase();

server.listen(3001, ()=>{
    console.log(`Servidor rodando em: http://localhost:${process.env.PORT}`);
}); 

module.exports = server;