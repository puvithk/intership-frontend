// On  click to open new chats 
const openChat = (name , path)=>{
    const chatName = document.getElementById("chat-name")
    const messagesGrid = document.getElementById("message-grid")
    const chatStatus = document.getElementById("chat-status")
    const imageTag = document.getElementById("chat-profile")
    const currentMessages = messagesGrid.innerHTML 
    messagesGrid.innerHTML = loading
    chatName.innerText= name 
    chatStatus.innerText = 'offline'
    imageTag.src = path
    setInterval(()=>{
        messagesGrid.innerHTML =  currentMessages
    }, 5000)
    
}
const sendMessages = ()=>{
    const message = document.getElementById('chat-input-text');
    const meessageGrid = document.getElementById("message-grid")
    const currentTime = new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
            });
    const messageTemplte = `<div class="message sent">
                            <p>${message.value}</p>
                            <span class="timestamp">${currentTime}</span>
                        </div>`
    meessageGrid.innerHTML += messageTemplte
    message.value = ''
    
}