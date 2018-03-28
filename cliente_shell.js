var net = require('net');
var lib = require("readline");
var inquirer = require('inquirer');
var chalk = require('chalk');
var dateformat = require('dateformat');
var ip = require('ip');

var client = new net.Socket();

var rl = lib.createInterface({
    input:process.stdin,
    output:process.stdout
})

var chats = {};
var idsChats = {};
var id;
var nombre = null;
var usuarios = "";
var seleccionado;

var bienvenida = '                                  CHATNET v0.3                        \n';
bienvenida += '                                desarrollada por                   \n';
bienvenida += '                  jeferson murillo - pedro lopez - jean galviz      \n';
bienvenida += '                       soporte - jmurilloariza@gmail.com            \n';

var help = chalk.yellowBright('HELP!\n');
help += chalk.green("Escribe el simbolo") + chalk.greenBright(" # ") + chalk.green(" seguido del el numero que aparece al lado de cada ");
help += chalk.green("usuario en la lista de conectados para enviar un mensaje personal. Ejemplo: ") + chalk.greenBright("# usuario") + "\n\n" ;
help += chalk.green("Tambien puedes enviar un mensaje difusion a todos los usuario conectados, para") + "\n";
help += chalk.green(" ello escribe ") + chalk.greenBright("#*") + "\n";

console.log(chalk.yellow(bienvenida));
rl.question(chalk.green('Como te llamas?: '), (answer) => {
  nombre = answer;
  client.connect(3000, ip.address());
  client.write(JSON.stringify({tipo:1, nombre:nombre}));
  console.log('\x1Bc');
  seleccionado = 0;

})

client.on('data', (data) => {
    var obj = JSON.parse(data.toString("utf-8"))
    if(obj.tipo === 1){
        id = obj.id;
    }else if(obj.tipo === 2 || obj.tipo === 3){
      if(obj.id_emisor === id || obj.tipo === 2){
        chats[obj.destinatario] += "[" + dateformat() + "] " + obj.username + ": " + obj.mensaje + "\n";
      }else{
        chats[obj.id_emisor] += obj.username + " : " + obj.mensaje + "\n";
      }

      limpiarMostrar();
    }else if(obj.tipo === 4){
      console.log(chalk.yellow(bienvenida));

      var usuariosTemp = '';
      var chatsTemp = {};
      var idsChatsTemp = {};

      obj.usuarios=JSON.parse(obj.usuarios);

      for (var i = 0; i < obj.usuarios.length; i++) {
        if(obj.usuarios[i].id !== id){
          usuariosTemp += chalk.cyan("--") + " [" + i + "]" + obj.usuarios[i].nombre + "\n";
          idsChatsTemp[i] = obj.usuarios[i].id;
          chatsTemp[obj.usuarios[i].id] = "Chat " + obj.usuarios[i].nombre + "\n\n";
          if(chats[obj.usuarios[i].id] !== null){
            chatsTemp[obj.usuarios[i].id] = chats[obj.usuarios[i].id];
          }
        }
      }
      chats = chatsTemp;
      idsChats = idsChatsTemp;
      usuarios = usuariosTemp;
      limpiarMostrar();
    }
 })
rl.on('line', (line) => {
  if(nombre !== null){
    var res=line.split(" ");
    if(res.length > 1 && res[0] === "#" && idsChats[res[1]] != null){
      seleccionado = res[1];
      limpiarMostrar();
    }else{
      if(seleccionado === 0){
        client.write(JSON.stringify({tipo:2, id_emisor:id, username:nombre, mensaje:line, destinatario:idsChats[seleccionado]}));
      }else{
        client.write(JSON.stringify({tipo:3, id_emisor:id, username:nombre, mensaje:line, destinatario:idsChats[seleccionado]}));
      }
    }
  }
})

function  limpiarMostrar(){
  if(nombre != null){
    console.log('\x1Bc');
    console.log(chalk.yellow(bienvenida));
    console.log(help);
    console.log(chalk.cyan('----------------------------- Usuarios Conectados -----------------------------\n'));
    console.log(usuarios);
    console.log(chalk.cyan('-------------------------------------------------------------------------------\n'));
    console.log(chats[idsChats[seleccionado]]);
   }
  }

  function exitHandler(options, err) {
    client.end();
    client = null;
      if (options.cleanup) console.log('clean');
      if (err) console.log(err.stack);
      if (options.exit) process.exit();
  }

  process.on('exit', exitHandler.bind(null,{cleanup:true}));

  //catches ctrl+c event
  process.on('SIGINT', exitHandler.bind(null, {exit:true}));

  // catches "kill pid" (for example: nodemon restart)
  process.on('SIGUSR1', exitHandler.bind(null, {exit:true}));
  process.on('SIGUSR2', exitHandler.bind(null, {exit:true}));
