const socket = io()


//Elemnets
const $messageForm = document.querySelector('#message-form') 
const $locationForm = document.querySelector('#send-location')
const $messageFormInput = $messageForm.querySelector("input")
const $messageFormButton = $messageForm.querySelector("button")
const $messages = document.querySelector("#messages")

// Templates
const messageTemplate = document.querySelector("#message-template").innerHTML
const locationMessageTemplate = document.querySelector("#location-message-template").innerHTML
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML


// Options
const { username,room } = Qs.parse(location.search,{ignoreQueryPrefix:true})

const autoScroll = ()=>{
    // New Message Element
    const $newMessage = $messages.lastElementChild

    // Height of the new Messages
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
     
    // Visible Height
    const visibleHeight = $messages.offsetHeight

    // Height of message container
    const containerHeight = $messages.scrollHeight

    // How far have I Scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight -newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight

    }
}

socket.on('message',(message)=>{
    const html = Mustache.render(messageTemplate,{
        message:message.text, // 2nd message is value ist is dyanmic variable
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})


socket.on('locationMessage',(message)=>{
    console.log(message)
    const html = Mustache.render(locationMessageTemplate,{
        url:message.url, // 2nd url is value 1st is dyanmic variable
        createdAt:moment(message.createdAt).format('h:mm A')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

socket.on('roomData',({room,users})=>{
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    $messageFormButton.setAttribute('disabled','disabled')
    const text = e.target.elements.message.value
    socket.emit('sendMessage',text,(mess)=>{ // ()=>{} this for acknowledgement of sending message
    $messageFormButton.removeAttribute('disabled')
    $messageFormInput.value = ''
    $messageFormInput.focus()
        console.log("Message Delevired",mess)  // in mess there is string parameter--- callback("string")
    })
    
})

$locationForm.addEventListener('click',()=>{
    $locationForm.setAttribute('disabled','disabled')
    if(!navigator.geolocation){
        return alert("Geolocation is not supported by your browser")
    }
    navigator.geolocation.getCurrentPosition((position)=>{

        socket.emit('sendLocation',{latitude:position.coords.latitude,
        longitude:position.coords.longitude},()=>{
            $locationForm.removeAttribute('disabled')
            console.log("Location Shared")
        })
    })

})

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href = '/'
    }

})


// socket.on('countUpdated',(count)=>{  // countUpdated is evenet name it will same in server also
//     console.log("Count has been updated",count)
// })

// document.querySelector("#increment").addEventListener('click',()=>{
//     console.log("Clicked")
//     // socket.emit('increment')
//     socket.emit('increment')
// })