var net = require('net')
var lib = require("readline")

var client = new net.Socket()

var rl = lib.createInterface({
    input:process.stdin,
    output:process.stdout
})

var chats = {}
var idsChats = {}
var id
var nombre = null
var usuarios = ""
var seleccionado

var ip=require("ip");
var res=ip.address().split(".");
var num1=res[0];
var num2=res[1];
var num3=0;
var num4=0;
var ip=null;
var intervalo=setInterval(()=>{
  var ips=num1+"."+num2+"."+num3+"."+num4;
  var aux1 = new net.Socket()
  aux1.connect(3000, ips,()=>{
    aux1.on("data",(data)=>{
      var obj=JSON.parse(data.toString("utf-8"));
      if(obj.tipo!=null){
        ip=ips;
      }
      aux1.end();
      cerrar();
    });
  })
  aux1.on("error",()=>{
    aux1.end();
  });
  if(num4<=255){
    num4++;
  }else if(num3<=255){
    num3++;
    num4=0;
  }
},1);

function cerrar(){
console.log('\x1Bc')
  rl.question('Como te llamas?: ', (answer) => {
  nombre = answer
  client.connect(3000, ip)
  client.write(JSON.stringify({tipo:1, nombre:nombre}))
  console.log('\x1Bc')
  seleccionado = 0
})
  clearInterval(intervalo);
}

client.on('data', (data) => {
  var res=data.toString("utf-8");
  try {
        var obj=JSON.parse(res);
        elegirEntrada(obj);
    }catch(e){
      var res2=res.split("\n");
         for (var i = 0; i < res2.length-1; i++) {
             var obj=JSON.parse(JSON.stringify(res2[i]));
            elegirEntrada(obj);
         }
    }
 })
rl.on('line', (line) => {
  if(nombre != null){
    if(line.length >1 && line.charAt(0) == "#" && idsChats[line.charAt(1)] != null){
      seleccionado = line.charAt(1)
      limpiarMostrar()
    }else{
      if(seleccionado==0){
        client.write(JSON.stringify({tipo:2, id_emisor:id, username:nombre, mensaje:line, destinatario:idsChats[seleccionado]}))
      }else{
        client.write(JSON.stringify({tipo:3, id_emisor:id, username:nombre, mensaje:line, destinatario:idsChats[seleccionado]}))
      }
    }
  }
})

function  limpiarMostrar(){
    console.log('\x1Bc')
    console.log(usuarios)
    console.log(chats[idsChats[seleccionado]])
  }
  
  function elegirEntrada(obj){
    if(typeof obj =="string"){
      obj= JSON.parse(obj);
    }
    if(obj.tipo==1){
              id = obj.id
          }else if(obj.tipo == 2 || obj.tipo == 3){
            if(obj.id_emisor == id || obj.tipo == 2){
              chats[obj.destinatario] +=  obj.username + ": " + obj.mensaje + "\n"
            }else{
              chats[obj.id_emisor] += obj.username + " : " + obj.mensaje + "\n"
            }
            limpiarMostrar()
          }else if(obj.tipo == 4){
            var usuariosTemp = "Escriba # y el numero de la persona con la que quiere hablar personalmente \n"+
            "ejemplo Escribiendo #0 se puede hablar en el chat Grupal\n\n";
            var chatsTemp = {}
            var idsChatsTemp = {}
            for (var i = 0; i < obj.usuarios.length; i++) {
              if(obj.usuarios[i].id != id){
                usuariosTemp += "[" + i + "]" + obj.usuarios[i].nombre + "  "
                idsChatsTemp[i] = obj.usuarios[i].id
                chatsTemp[obj.usuarios[i].id] = "Chat " + obj.usuarios[i].nombre + "\n\n"
                if(chats[obj.usuarios[i].id] != null){
                  chatsTemp[obj.usuarios[i].id] = chats[obj.usuarios[i].id]
                }
              }
            }
            chats = chatsTemp
            idsChats = idsChatsTemp
            usuarios = usuariosTemp+"\n"
            if(idsChats[seleccionado]==null){
              seleccionado=0;
            }
            limpiarMostrar()
          }
  }