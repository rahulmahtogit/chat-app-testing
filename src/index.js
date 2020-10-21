const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const {generateMessage,generateLocationMessage} = require('./utils/messages')
const  {
    addUser,
    removeUser,
    getUser,
    getUserInRoom
    
} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)


const port = process.env.PORT || 3008

const publicDirectoryPath = path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath))

io.on('connection',(socket)=>{
    console.log("WebSocket Connected")

    socket.on('join',(options,callback)=>{ //options use instead of {username,room} and destructure it by ...options
           const {error, user} =  addUser({id:socket.id,...options})
           if(error){
               return callback(error)
           }
            socket.join(user.room) // Inbuilt to join the room 
            // user.room availaable after passing through addUser It trims and validate the room

            socket.emit('message',generateMessage('Welcome!'))
    socket.broadcast.to(user.room).emit('message',generateMessage(`${user.username} has joined`))
    io.to(user.room).emit('roomData',{
        room:user.room,
        users:getUserInRoom(user.room)
    })
    callback()
    })

    socket.on('sendMessage',(m,callback)=>{
        io.emit('message',generateMessage(m))
        callback("Chala Gya")   // Acknowledge from server message deleviered

    })
    // Google map integration in Your app
    socket.on('sendLocation',(position,callback)=>{
      io.to('Center City').emit('locationMessage',generateLocationMessage(`https://google.com/maps?q=${position.latitude},${position.longitude}`))
      callback()
    })
    socket.on('disconnect',()=>{
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message',generateMessage(`${user.username} has left`))
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUserInRoom(user.room)
            })
        }
        
    })

})



// let count = 0
// server(emit) => client(receive) - countUpdated 
// client(emit) => server(reveive) - increment
// io.on('connection',(socket)=>{
//     console.log("New Websocket Connection")
//     socket.emit('countUpdated',count)  // countUpdated is evenet name it will same in client also
//     socket.on('increment',()=>{
//         count++
//         // socket.emit('countUpdated',count)
//         io.emit('countUpdated',count)
//     })

// })

server.listen(port,()=>{
    console.log(`Server is up on ${port}!`)
})