const openChat = (name , path)=>{
    const chatName = document.getElementById("chat-name")
    const chatStatus = document.getElementById("chat-status")
    const imageTag = document.getElementById("chat-profile")
    chatName.innerText= name 
    chatStatus.innerText = 'offline'
    imageTag.src = path
}