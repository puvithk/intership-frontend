
// User indeXDB fuinctions
const openUserDB = async ()=>{
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("teamUserDB", 1);

        request.onupgradeneeded = (e) => {
            const db = e.target.result;

            if (!db.objectStoreNames.contains("teamUser")) {
                db.createObjectStore("teamUser", { keyPath: "email" });
            }
        };

        request.onsuccess = (e) => resolve(e.target.result);
        request.onerror = (e) => reject(new Error(e));
    });

}


const getAllUsersDB = async ()=>{
    try{
        const db = await openUserDB()
        const tx = db.transaction('teamUser' , 'readonly')
        const store = tx.objectStore('teamUser')
        const teamUsers = await new Promise((resolve , reject)=>{
            const req = store.getAll()
            req.onsuccess = ()=>resolve(req.result)
            req.onerror =()=> reject(new Error("UserDB error"))

        })
        if(!teamUsers || teamUsers.length === 0){
            return []
        }else {
            return teamUsers
        }
    }catch{
        console.log("Error")
    }
}
const getUserFromEmail = async (email)=>{
    try{
        const db = await openUserDB()
        const tx = db.transaction('teamUser' , 'readonly')
        const store = tx.objectStore('teamUser')
        const teamUsers = await new Promise((resolve , reject)=>{
            const req = store.get(email)
            req.onsuccess = ()=>resolve(req.result)
            req.onerror =()=> reject(new Error("UserDB error"))

        })
        if(!teamUsers || teamUsers.length === 0){
            return null
        }else {
            return teamUsers
        }
    }catch{
        console.log("Error")
    }
}
const addUserDB = async (user)=>{
    try {
        const currectUser =  await getUserFromEmail(user.email)
        console.log(currectUser)
        if(currectUser){
            console.log("User already present ")
            return null
        }
        const db = await openUserDB()
        const tx = db.transaction('teamUser' , 'readwrite')
        const store = tx.objectStore('teamUser')
        
        const teamUsers = await new Promise((resolve , reject)=>{
            const req = store.put(user)
            req.onsuccess = ()=>resolve(req.result)
            req.onerror =()=> reject(new Error("UserDB error"))

        })
        return teamUsers;

    }catch(e){
        console.log(e)
        console.log("Cannot create user ")
    }
}

const getUserNameFromId = async (userId)=>{
    const users = await getAllUsersDB()
    return users.find((element )=>{
        return element.user_id === userId
    })
}

function createUserObject({user_id = crypto.randomUUID(),name,email,organization,status = null,designation = null,work_details = null,profile_image = null,password = null,dob = null,is_active = true
}) {
    return {user_id,name,email,organization,status,designation,work_details,profile_image,password,dob,is_active};
}

const defaultUser = createUserObject({name:'Puvith' , email:'puvithkumar2004@gmail.com' , organization:'ADMIN', designation:'ADMIN' , password:'Puvith'})


//Meeting DB Functions 
function createMeetingObject({
    meetingId = crypto.randomUUID(),meetingName,startTime,endTime,meetingAgenda = null,organizer = null , status='Scheduled'}) {
    if (new Date(endTime) <= new Date(startTime)) {
        throw new Error("End time must be after start time");
    }
    return {meetingId,meetingName,startTime,endTime,meetingAgenda,organizer , status
    };
}

const openMeetingDB = async ()=>{
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("teamMeetingDB", 1);
        request.onupgradeneeded = (e) => {
        const db = e.target.result;

        let store;

        if (db.objectStoreNames.contains("teamMeeting")) {
            store = e.target.transaction.objectStore("teamMeeting");
        } else {
            store = db.createObjectStore("teamMeeting", { keyPath: "meetingId" });
        }

        if (!store.indexNames.contains("organizer")) {
            store.createIndex("organizer", "organizer", { unique: false });
        }}
        request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
})
};
const getAllMeetingDB = async()=>{
    try {
        const db = await openMeetingDB()
        const tx = db.transaction('teamMeeting' , 'readonly')
        const store = tx.objectStore('teamMeeting')
        const meetings = await new Promise((resolve , reject) =>{
            const request = store.getAll()
            request.onsuccess =()=> resolve(request.result)
            request.onerror = ()=> reject(new Error("Meetings couldnt fetch"))
        })
  
        if(!meetings || meetings.length === 0){
            return []
        }
        return meetings

    }catch(e){
        console.log(e)
        console.log("Error")
    }
}

const addMeetingDB =  async (meetingObject)=>{
    try {
         const db = await openMeetingDB()
        const tx = db.transaction('teamMeeting' , 'readwrite')
        const store = tx.objectStore('teamMeeting')
        const meeting = await new Promise((resolve , reject) =>{
            const request = store.put(meetingObject)
            request.onsuccess =()=> resolve(request.result)
            request.onerror = ()=> reject(new Error("Meetings couldnt fetch"))
        })
        return meeting
    }catch(e){
        console.log("Error")
        console.log(e)
        return null
    }
}
const getMeetingFromUserId =  async (userId)=>{
    try {
         const db = await openMeetingDB()
        const tx = db.transaction('teamMeeting' , 'readonly')
        const store = tx.objectStore('teamMeeting')
        const index = store.index('organizer')
        const meeting = await new Promise((resolve , reject) =>{
            const request = index.getAll(userId)
            request.onsuccess =()=> resolve(request.result)
            request.onerror = ()=> reject(new Error("Meetings couldnt fetch"))
        })
        if(!meeting){
            return null
        }
        return meeting
    }catch(e){
        console.log("Error")
        console.log(e)
        return null
    }
}

// Teams DB functions 

function createTeamObject({teamId = crypto.randomUUID(),teamName,teamDescription = null,createdAt = new Date(),teamLead = null
}) {return {    teamId,teamName,teamDescription,createdAt,teamLead
    };
}


const openTeamDB = async ()=>{
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("teamsDB", 1);
        request.onupgradeneeded = (e) => {
        const db = e.target.result;

        if (!db.objectStoreNames.contains("teams")) {
            db.createObjectStore("teams", { keyPath: "teamId" });
        }}
        request.onsuccess = (e) => resolve(e.target.result);
        request.onerror = (e) => reject(e.target.error);
})
};


const createTeamsDB = async (teamObject)=>{
    try {
         const db = await openTeamDB()
        const tx = db.transaction('teams' , 'readwrite')
        const store = tx.objectStore('teams')
        const meeting = await new Promise((resolve , reject) =>{
            const request = store.put(teamObject)
            request.onsuccess =()=> resolve(request.result)
            request.onerror = ()=> reject(new Error("Teams couldnt fetch"))
        })
        return meeting
    }catch(e){
        console.log("Error")
        console.log(e)
        return null
    }
}

const getAllTeamsDB = async ()=>{
        try {
         const db = await openTeamDB()
        const tx = db.transaction('teams' , 'readonly')
        const store = tx.objectStore('teams')
        const meeting = await new Promise((resolve , reject) =>{
            const request = store.getAll()
            request.onsuccess =()=> resolve(request.result)
            request.onerror = ()=> reject(new Error("Teams couldnt fetch"))
        })
        return meeting
    }catch(e){
        console.log("Error")
        console.log(e)
        return []
    }
}

const getTeamById =  async (teamId)=>{
      try {
         const db = await openTeamDB()
        const tx = db.transaction('teams' , 'readonly')
        const store = tx.objectStore('teams')
        const meeting = await new Promise((resolve , reject) =>{
            const request = store.get(teamId)
            request.onsuccess =()=> resolve(request.result)
            request.onerror = ()=> reject(new Error("Teams couldnt fetch"))
        })
        return meeting
    }catch(e){
        console.log("Error")
        console.log(e)
        return null
    }
}

/// User team Mapping 
function createUserTeam(userId, teamId) {
    return {
        userId,
        teamId
    };
}
const openUserTeamDB = async () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("userTeamDB", 1);

        request.onupgradeneeded = (e) => {
            const db = e.target.result;

            if (!db.objectStoreNames.contains("userTeam")) {
                const store = db.createObjectStore("userTeam", { 
                    keyPath: ["userId", "teamId"] 
                });

                // ✅ indexes
                store.createIndex("userId", "userId", { unique: false });
                store.createIndex("teamId", "teamId", { unique: false });
            }
        };

        request.onsuccess = (e) => resolve(e.target.result);
        request.onerror = (e) => reject(e.target.error);
    });
};
const mapUserTeam = async (userId, teamId) => {
    const db = await openUserTeamDB();
    try{
    return new Promise((resolve, reject) => {
        const tx = db.transaction("userTeam", "readwrite");
        const store = tx.objectStore("userTeam");

        const data = createUserTeam(userId, teamId);

        const request = store.add(data); 

        request.onsuccess = () => resolve("User mapped to team");
        request.onerror = (e) => reject(e.target.error);
    });}
    catch(e){
        alert(e)
    }
};


const getMappedUsers = async (teamId) => {
    const db = await openUserTeamDB();
    console.log("Team Id " , teamId)
    return new Promise((resolve, reject) => {
        const tx = db.transaction("userTeam", "readonly");
        const store = tx.objectStore("userTeam");

        const index = store.index("teamId"); 

        const request = index.getAll(teamId);

        request.onsuccess = () => {
            console.log(   `Result for team Id ${ teamId}` , request.result)
            resolve(request.result); 
        };

        request.onerror = (e) => reject(e.target.error);
    });
};
const getMappedTeams  = async (userId)=>{
    try{
        const db = await openUserTeamDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction("userTeam", "readonly");
        const store = tx.objectStore("userTeam");

        const index = store.index("userId"); 

        const request = index.getAll(userId);

        request.onsuccess = () => {
            resolve(request.result); 
        };

        request.onerror = (e) => reject(e.target.error);
    });


    }catch{
        console.log("Error")
    }
}

// Get all teams which the userId belongs to 

const getAllTeamsOfUsers  = async (userId)=>{
    const mappedUsers =await getMappedTeams(userId)
    const allTeams = await getAllTeamsDB()
    const teamsLead  = allTeams.filter((element)=>{
        return element.teamLead === userId
    })
    const mappedTeamIds = mappedUsers.map(t => t.teamId);
    const leadTeamIds = teamsLead.map(t => t.teamId);


    const uniqueTeamIds = [...new Set([...mappedTeamIds, ...leadTeamIds])];
    const teamNamesIds = []
    for(let element of uniqueTeamIds){
        const teamNames = await getTeamById(element)
        teamNamesIds.push({teamId: element, teamName: teamNames.teamName})
    }
    console.log("Team name and ids ")
    console.log(teamNamesIds)
    return teamNamesIds
}


// Create Chats between users 
function createChat({chatId = crypto.randomUUID(),chatName = 'UserName',user1Id,user2Id,createdAt = new Date()
}) {
    const [u1, u2] = [user1Id, user2Id].sort();
    return {
        chatId,
        chatName,
        user1Id: u1,
        user2Id: u2,
        userIds: [user1Id, user2Id],
        createdAt
    };
}

const openUserChatDB = async () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("userChatDB", 1);

        request.onupgradeneeded = (e) => {
            const db = e.target.result;

            if (!db.objectStoreNames.contains("userChat")) {
                const store = db.createObjectStore("userChat", { 
                    keyPath: 'chatId' 
                });

            store.createIndex("userIds", "userIds", { multiEntry: true });
            }
        };

        request.onsuccess = (e) => resolve(e.target.result);
        request.onerror = (e) => reject(e.target.error);
    });
};

const addChatDB = async (chat) => {
    try {
        const db = await openUserChatDB();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction("userChat", "readwrite");
            const store = transaction.objectStore("userChat");

            const request = store.add(chat);

            request.onsuccess = () => {
                resolve("Chat added successfully");
            };

            request.onerror = (e) => {
                reject(e.target.error);
            };
        });

    } catch (error) {
        console.error("Error adding chat:", error);
        throw error;
    }
};


const getChatsByUser = async (userId) => {
    try {
        const db = await openUserChatDB();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction("userChat", "readonly");
            const store = transaction.objectStore("userChat");

            const index = store.index("userIds");

            const request = index.getAll(userId);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = (e) => {
                reject(e.target.error);
            };
        });

    } catch (error) {
        console.error("Error fetching chats:", error);
        throw error;
    }
};
const getChatsById = async (chatId) => {
    try {
        const db = await openUserChatDB();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction("userChat", "readonly");
            const store = transaction.objectStore("userChat");

            

            const request = store.getAll(chatId);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = (e) => {
                reject(e.target.error);
            };
        });

    } catch (error) {
        console.error("Error fetching chats:", error);
        throw error;
    }
};
// Messages DB 
function createMessage({messageId = crypto.randomUUID(),text,messageScope,
    composedBy,chatId = null,channelId = null,timestamp = Date.now()
}) {
    console.log(messageScope)
    console.log(chatId)
    if (
        (messageScope === "CHAT" && (!chatId || channelId)) ||
        (messageScope === "CHANNEL" && (!channelId || chatId))
    ) {
        throw new Error("Invalid message scope configuration");
    }

    return {messageId, text, timestamp, messageScope, composedBy, chatId, channelId
    };
}
const MESSAGESCOPE = {
    CHAT :'CHAT' , 
    CHANNEL : 'CHANNEL'
}


// Messages DB connection 
const openUserMessagesDB = async () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("messagesDB", 1);

        request.onupgradeneeded = (e) => {
            const db = e.target.result;

            if (!db.objectStoreNames.contains("messages")) {
                const store = db.createObjectStore("messages", { 
                    keyPath: 'messageId' 
                });

            store.createIndex("chatId", "chatId");
            store.createIndex('channelId' , 'channelId')
            }
        };

        request.onsuccess = (e) => resolve(e.target.result);
        request.onerror = (e) => reject(e.target.error);
    });
};
const addChatMessages = async (chatMessage) => {
    try {
        const db = await openUserMessagesDB();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction("messages", "readwrite");
            const store = transaction.objectStore("messages");


            store.put(chatMessage);
       

            transaction.oncomplete = () => {
                resolve("Messages added successfully");
            };

            transaction.onerror = (e) => {
                reject(e.target.error);
            };
        });

    } catch (error) {
        console.error("Error adding messages:", error);
        throw error;
    }
};
const getChatMessages = async (chatId) => {
    try {
        const db = await openUserMessagesDB();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction("messages", "readonly");
            const store = transaction.objectStore("messages");

            const index = store.index("chatId");
            const request = index.getAll(chatId);

            request.onsuccess = () => {
                const messages = request.result.sort(
                    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
                );

                resolve(messages);
            };

            request.onerror = (e) => {
                reject(e.target.error);
            };
        });

    } catch (error) {
        console.error("Error fetching chat messages:", error);
        throw error;
    }
};
/*Database Functions */









let teamusers
const refreshAll = async ()=>{
    teamusers = await addUserDB(defaultUser)
    console.log(teamusers)
    teamusers = await getAllUsersDB();
    console.log(teamusers)
    
}
refreshAll()


const passwordInput = document.getElementById('password')
const showPassword = document.getElementById('show-password')
let users =[]

const loading = `<div class="loading">
                            <div class="inner-cirle"></div>
                             <p>Loading Messages</p>
                        </div>`
// FInd user from the localStorge and login 
const login = async (event) =>{
    event.preventDefault()
    const form = event.target
    const email = form.username.value 
    const password = form.password.value
     console.log(users)
    let currentUser = await getUserFromEmail(email)
    const errorMessage = document.getElementById("error-messages")
    console.log("CurrentDetails")
    console.log(currentUser)
  
    if (currentUser && currentUser.password ===  password) {
        localStorage.setItem("currentUser" , JSON.stringify(currentUser))
        globalThis.location.href = "/html/home.html" 
     
    } else {
        errorMessage.classList.add("fail-progress")
        errorMessage.innerText = "Username or password is wrong"
       
      
    }
    return false
}



// Adding the active class
const changeBar = (classname) => {
    const sidebarTitle = document.getElementsByClassName(classname.trim())[0]

    if (sidebarTitle) {
        sidebarTitle.classList.add("sidebar-active")
    }
}



// checking which page is active 
const setActiveMenu = () => {

    const page = globalThis.location.pathname.split("/").pop()

    console.log(page) // for debugging

    if (page === "home.html") changeBar("dashboard")
    if (page === "chats.html") changeBar("chats")
    if (page === "teams.html") changeBar("teams")
    if (page === "meeting.html") changeBar("meetings")
    if (page === "community.html") changeBar("community")
    if (page === "settings.html") changeBar("settings")

}
// Sidebar for all page 
const sideBar = () => {
    const currectUser = JSON.parse(localStorage.getItem('currentUser'))
    const sidebar = `
        <div class="sidebar-icon">
            <a href="/" class="sidebar-icon-name">NexTeams</a>
            <p class="sidebar-icon-name-mobile">NT</p>
        </div>

        <nav class="sidebar-nav"> 
            <div class="dashboard">
                <a href="../html/home.html">
                    <img src="../img/dashboard.png" alt="Dashboard logo"/>
                    <span>Dashboard</span>
                </a>
            </div>

            <div class="chats">
                <a href="../html/chats.html">
                    <img src="../img/message.png" alt="Chats logo"/>
                    <span>Chats</span>
                </a>
            </div>

            <div class="teams">
                <a href="../html/teams.html">
                    <img src="../img/team.png" alt="Teams logo"/>
                    <span>Teams</span>
                </a>
            </div>

            <div class="meetings">
                <a href="../html/meeting.html">
                    <img src="../img/meeting.png" alt="Meetings logo"/>
                    <span>Meetings</span>
                </a>
            </div>

            <div class="community">
                <a href="../html/community.html">
                    <img src="../img/community.png" alt="Community logo"/>
                    <span>Community</span>
                </a>
            </div>

            <div class="settings">
                <a href="../html/settings.html">
                    <img src="../img/settings.png" alt="Settings logo"/>
                    <span>Settings</span>
                </a>
            </div>
        </nav>

        <div class="sidebar-profile">
            <img src="../img/profile.png" alt="User profile"/>
            <div class="sidebar-profile-info">
                <h2>${currectUser.name}</h2>
                <h4>${currectUser.designation}</h4>
            </div>
        </div>
    `

    const asideSidebar = document.getElementsByClassName('sidebar')[0]
    asideSidebar.innerHTML = sidebar

    setActiveMenu()
}

sideBar()

// Notificastion 
const notification = (message , status ) => {
    const container = document.querySelector(".container");
    const alert = document.createElement("div");
    alert.className = "notification-alert";
    alert.style.top = 0
    // Created a strcutred and added css 
    alert.innerHTML = `
        <div class="name-close">
            <h2>Notification</h2>
            <button class="close-button">X</button>
        </div>
        <div class="progress ${status}-progress"></div>
        <div class="notification-message ">
            <p class="${status}">${message}</p>
        </div>
    `;

    // Add toi the main container 
    container.appendChild(alert);

    alert.querySelector(".close-button").addEventListener("click", () => {
        alert.remove();
    });

    // Make only for 5 sec
    setTimeout(() => {
        alert.style.top = '100px'
        alert.remove();
    }, 5000);
};


const icons = ['fa-eye-slash' , 'fa-eye']
showPassword.addEventListener('click' , ()=>{
   
    if(passwordInput.type === 'password'){
        passwordInput.type = 'text'
        showPassword.classList.remove(icons[0])
        showPassword.classList.add(icons[1])
    }else {
        passwordInput.type = 'password'
        showPassword.classList.remove(icons[1])
        showPassword.classList.add(icons[0])
    }
})