const params = new URLSearchParams(window.location.search);
const loadingElement = document.getElementById('loading')
let userId = JSON.parse(localStorage.getItem("currentUser")).user_id
let paramId = params.get('userid')
let currentChat = null
const channelList = document.getElementById('channel-list')
const chatList = document.getElementById('chat-list')
let currentChatId = null
let channels = []


const refreshChannels = async () => {
    if (!userId) {
        userId = JSON.parse(localStorage.getItem('currentUser')).user_id;
    }

    channelList.innerHTML = '';

    channels = await getAllTeamsOfUsers(userId);

    channels.forEach(({ teamId, teamName }) => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${teamName}</span>`;
        li.id = teamId;

        channelList.append(li);
    });
    if(channels.length === 0 ){
        channelList.innerHTML  = '<p>No Channels found</p>'
    }
};
const refreshChats = async (check = true) => {
    const allChats = await getChatsByUser(userId);

    chatList.innerHTML = ''; 

    for(let element of allChats) {
        const li = document.createElement('li');
        const otherUserId = element.user1Id === userId ? element.user2Id : element.user1Id
        console.log("Other user " , otherUserId)
        const otherUsername = await getUserNameFromId(otherUserId)
        console.log("Other user name " , otherUsername)
        li.innerHTML = `
            <button class="chat-user" onclick="openChat('${element.chatId}', '../img/profile2.png')">
                <img src="../img/profile2.png" alt="User profile"/>
                <span>${otherUsername.name}</span>
            </button>
        `;

        chatList.append(li);
    }

    if(allChats.length === 0 ){
        chatList.innerHTML = `<p>No Chats Found</p>`
        const messagesGrid = document.getElementById("message-window");
        messagesGrid.innerHTML = `<p>No Chats Found</p>`
        messagesGrid.style.textAlign = 'center'
        messagesGrid.style.padding = '10px'
       }
    if (check && allChats.length > 0) {
        await updateMessageBody(allChats[0].chatId);
    }
};
const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    });
};
const updateMessageBody = async (chatId) => {
    const messagesGrid = document.getElementById("message-grid");
    messagesGrid.innerHTML = '';

    const allChatsMessages = await getChatMessages(chatId);
    let chatDetails = await getChatsById(chatId);
    chatDetails = chatDetails[0];

    const chatName = document.getElementById("chat-name");
    const chatUserId = chatDetails.user1Id === userId ? chatDetails.user2Id : chatDetails.user1Id
    const chatUserName = await getUserNameFromId(chatUserId)
    chatName.innerText = chatUserName.name;

    allChatsMessages.forEach((element) => {
        const messageBody = document.createElement('div');

        messageBody.className = 'message';
        messageBody.classList.add(
            element.composedBy === userId ? 'sent' : 'received'
        );

        messageBody.innerHTML = `
            <p>${element.text}</p>
            <span class="timestamp">${formatTime(element.timestamp)}</span>
        `;

        messagesGrid.append(messageBody);
    });

  
    currentChat = chatDetails.userIds.find(id => id !== userId);
    currentChatId = chatDetails.chatId;
};
const updateChats = async () =>{
    await refreshChannels()
    await refreshChats()
    
}
// On  click to open new chats 
const openChat = async(name , path)=>{
    console.log("Name id " , name)
    await updateMessageBody(name)
    
}
const sendMessages = async () => {
    if (!currentChatId) {
        const user1 = userId;
        const userName = await getUserNameFromId(paramId);

        const existingChat = await getChatBetweenUsers(user1, paramId);

        if (existingChat) {
            currentChatId = existingChat.chatId;
        } else {
            const chat = createChat({
                chatName: userName.name,
                user1Id: user1,
                user2Id: paramId
            });

            await addChatDB(chat);
            currentChatId = chat.chatId;
        }
    }

    const messageInput = document.getElementById('chat-input-text');

    if (!messageInput.value.trim()) return; 

    const messageObj = createMessage({
        messageScope: MESSAGESCOPE.CHAT,
        composedBy: userId,
        text: messageInput.value,
        chatId: currentChatId
    });

    await addChatMessages(messageObj);

    await updateMessageBody(currentChatId); 

    messageInput.value = '';
};

const openChatMessages = async ()=>{
    const chatList = document.getElementById('chat-list-section')
    chatList.style.display = 'none'
    const chatUser = await getUserNameFromId(paramId)

    const chatName = document.getElementById("chat-name")
    chatName.innerText =  chatUser.name
}
const getChatBetweenUsers = async (userA, userB) => {
    const chats = await getChatsByUser(userA);

    return chats.find(chat => 
        chat.userIds.includes(userA) && 
        chat.userIds.includes(userB)
    );
};
const init = async () => {
    if (paramId) {
        const existingChat = await getChatBetweenUsers(userId, paramId);
        const user = await getUserNameFromId(paramId)
       if (!user) {
    notification('User not found', 'fail');

    setTimeout(() => {
        globalThis.location.href = '/html/chats.html';
    }, 5000);
}
        if (existingChat) {
            currentChatId = existingChat.chatId;
          
            await updateMessageBody(existingChat.chatId);
            await refreshChats(false)
            await refreshChannels()
            loadingElement.style.display = 'none'
        } else {
            await openChatMessages();
            loadingElement.style.display = 'none'
        }
    } else {
        await updateChats();
        loadingElement.style.display = 'none'
    }
};

init();