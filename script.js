let userId =  JSON.parse(localStorage.getItem('currentUser'))|| null
const logout = document.getElementById('logout')
console.log(userId)
console.log(globalThis.location.pathname.split("/").pop())
if(userId === null && globalThis.location.pathname.split("/").pop() != 'auth.html' && globalThis.location.pathname !='/'){
    console.log("Do this ")
    globalThis.location.href = '/html/auth.html'
   
    notification("Login and continue " , 'fail')
   
}else if( globalThis.location.pathname.split("/").pop() != 'auth.html') {
    userId =  userId.user_id
}


if( globalThis.location.pathname.split("/").pop() == 'auth.html') {
    const passwordInput = document.getElementById('password')
const showPassword = document.getElementById('show-password')
    console.log("Added the envent listern ")
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
}
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

function  createUserObject({user_id = crypto.randomUUID(),name,email,organization,status = null,designation = null,work_details = null,profile_image = null,password = null,dob = null,is_active = true
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
const getMeetingFromId = async (meetingId) => {
    try {
        const db = await openMeetingDB();
        const tx = db.transaction('teamMeeting', 'readonly');
        const store = tx.objectStore('teamMeeting');

        const meeting = await new Promise((resolve, reject) => {
            const request = store.get(meetingId);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(new Error("Meeting not found"));
        });

        return meeting || null;

    } catch (e) {
        console.log("Error:", e);
        return null;
    }
};
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
const deleteMeetingById = async (meetingId) => {
    try {
        const db = await openMeetingDB();

        return new Promise((resolve, reject) => {
            const tx = db.transaction("teamMeeting", "readwrite");
            const store = tx.objectStore("teamMeeting");

            const request = store.delete(meetingId);

            request.onsuccess = () => {
                resolve("Meeting deleted successfully");
            };

            request.onerror = (e) => {
                reject(e.target.error);
            };
        });

    } catch (e) {
        console.log("Error deleting meeting:", e);
        return null;
    }
};

const updateMeetingStatus = async (meetingId, newStatus) => {
    try {
        const db = await openMeetingDB();

        return new Promise((resolve, reject) => {
            const tx = db.transaction("teamMeeting", "readwrite");
            const store = tx.objectStore("teamMeeting");

            const getReq = store.get(meetingId);

            getReq.onsuccess = () => {
                const meeting = getReq.result;

                if (!meeting) {
                    reject(new Error("Meeting not found"));
                    return;
                }

          
                meeting.status = newStatus;

                
                const updateReq = store.put(meeting);

                updateReq.onsuccess = () => resolve(meeting);
                updateReq.onerror = (e) => reject(e.target.error);
            };

            getReq.onerror = (e) => reject(e.target.error);
        });

    } catch (e) {
        console.log("Error updating meeting status:", e);
        return null;
    }
};
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
        console.log(teamNames)
        teamNamesIds.push({teamId: element, teamName: teamNames.teamName , teamDescription: teamNames.teamDescription , teamLead :  teamNames.teamLead})
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


// Meeting participants 



const CreateMappingUserMeeting = ({userId , meetingId , participated = false})=>{
    return {userId , meetingId , participated}
}
const openUserMeetingDB = async () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("participantsDB", 1);

        request.onupgradeneeded = (e) => {
            const db = e.target.result;

      
            if (!db.objectStoreNames.contains("userMeeting")) {
                const store = db.createObjectStore("userMeeting", {
                    keyPath: ["userId", "meetingId"] 
                });

                store.createIndex("userId", "userId", { unique: false });
                store.createIndex("meetingId", "meetingId", { unique: false });
    
            }
        };

        request.onsuccess = (e) => resolve(e.target.result);
        request.onerror = (e) => reject(e.target.error);
    });
};

const mapUsersToMeeting = async (userIds, meetingIds) => {
    try {
        const db = await openUserMeetingDB();

       
        const users = Array.isArray(userIds) ? userIds : [userIds];
        const meetings = Array.isArray(meetingIds) ? meetingIds : [meetingIds];

        return new Promise((resolve, reject) => {
            const tx = db.transaction("userMeeting", "readwrite");
            const store = tx.objectStore("userMeeting");

            users.forEach(userId => {
                meetings.forEach(meetingId => {

                    const mapping = CreateMappingUserMeeting({
                        userId,
                        meetingId,
                        participated: false
                    });

                    store.put(mapping); 
                });
            });

            tx.oncomplete = () => {
                resolve("Users mapped to meeting successfully");
            };

            tx.onerror = (e) => {
                reject(e.target.error);
            };
        });

    } catch (e) {
        console.log("Error mapping users:", e);
        throw e;
    }
};


const mappedUsersToMeetingGetMapping = async (userId, meetingId) => {
    try {
        const db = await openUserMeetingDB();
        console.log(userId , meetingId , "Ids ")
        return new Promise((resolve, reject) => {
            const tx = db.transaction("userMeeting", "readonly"); 
            const store = tx.objectStore("userMeeting");

            const req = store.get([userId, meetingId]); 

            req.onsuccess = () => {
                resolve(req.result || null); 
            };

            req.onerror = (e) => {
                reject(e.target.error);
            };
        });

    } catch (e) {
        console.log("Error fetching mapping:", e);
        return null;
    }
};


const updateTheParticipation = async ({ userId, meetingId, participated }) => {
    try {
        const db = await openUserMeetingDB();

        return new Promise((resolve, reject) => {
            const tx = db.transaction("userMeeting", "readwrite");
            const store = tx.objectStore("userMeeting");


            const getReq = store.get([userId, meetingId]);

            getReq.onsuccess = () => {
                let record = getReq.result;

            
                if (!record) {
                    reject(new Error("Mapping not found"));
                    return;
                }

                
                record.participated = participated;

    
                const updateReq = store.put(record);

                updateReq.onsuccess = () => resolve(record);
                updateReq.onerror = (e) => reject(e.target.error);
            };

            getReq.onerror = (e) => reject(e.target.error);
        });

    } catch (e) {
        console.log("Error updating participation:", e);
        return null;
    }
};

// Gte the meeting sassigned to user 
const getMeetingsByUserId = async (userId) => {
    try {
        const db = await openUserMeetingDB();

        return new Promise((resolve, reject) => {
            const tx = db.transaction("userMeeting", "readonly");
            const store = tx.objectStore("userMeeting");

            const index = store.index("userId"); 
            const request = index.getAll(userId);

            request.onsuccess = () => {
                resolve(request.result || []);
            };

            request.onerror = (e) => {
                reject(e.target.error);
            };
        });

    } catch (e) {
        console.log("Error fetching meetings by userId:", e);
        return [];
    }
};

const getMappedUserFromMeetingId = async (meetingId) => {
    try {
        const db = await openUserMeetingDB();

        return new Promise((resolve, reject) => {
            const tx = db.transaction("userMeeting", "readonly");
            const store = tx.objectStore("userMeeting");

            const index = store.index("meetingId"); 
            const request = index.getAll(meetingId);

            request.onsuccess = () => {
                resolve(request.result || []);
            };

            request.onerror = (e) => {
                reject(e.target.error);
            };
        });

    } catch (e) {
        console.log("Error fetching meetings by userId:", e);
        return [];
    }
};



const meetingsFromUserId = async (userId)=>{

    const meetingParticipation = await getMeetingFromUserId(userId)
    const meeting = []
    for(let element of meetingParticipation){
        const meet = await getMeetingFromId(element.meetingId)
        meeting.push(meet)
    }
    return meeting;
}
/*Database Functions */









let teamusers
const refreshAll = async ()=>{
    teamusers = await addUserDB(defaultUser)
    console.log(teamusers)
    teamusers = await getAllUsersDB();
    console.log(teamusers)
    
}
refreshAll()



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





// Logout button 
logout.addEventListener("click", ()=>{
    console.log("Remcoing users ")
    localStorage.removeItem("currentUser")
    globalThis.location.href = '/'
})



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
    // 🔹 Step 1: render static sidebar instantly
    const sidebar = `
        <div class="sidebar-icon">
            <a href="/" class="sidebar-icon-name">NexTeams</a>
            <p class="sidebar-icon-name-mobile">NT</p>
        </div>

        <nav class="sidebar-nav"> 
            <div class="dashboard">
                <a href="../html/home.html">
                    <img src="../img/dashboard.png"/>
                    <span>Dashboard</span>
                </a>
            </div>

            <div class="chats">
                <a href="../html/chats.html">
                    <img src="../img/message.png"/>
                    <span>Chats</span>
                </a>
            </div>

            <div class="teams">
                <a href="../html/teams.html">
                    <img src="../img/team.png"/>
                    <span>Teams</span>
                </a>
            </div>

            <div class="meetings">
                <a href="../html/meeting.html">
                    <img src="../img/meeting.png"/>
                    <span>Meetings</span>
                </a>
            </div>

            <div class="community">
                <a href="../html/community.html">
                    <img src="../img/community.png"/>
                    <span>Community</span>
                </a>
            </div>

            <div class="settings">
                <a href="../html/settings.html">
                    <img src="../img/settings.png"/>
                    <span>Settings</span>
                </a>
            </div>
        </nav>

        <!-- 🔹 Placeholder profile -->
        <div class="sidebar-profile" id="sidebar-profile">
            <img src="/img/defaultuser.png"/>
            <div class="sidebar-profile-info">
                <h2>Loading...</h2>
                <h4>...</h4>
            </div>
        </div>
    `;

    document.querySelector('.sidebar').innerHTML = sidebar;

    setActiveMenu();

    // 🔹 Step 2: load profile separately (async)
    loadSidebarProfile();
};

const loadSidebarProfile = async () => {
    try {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        currentUser = await getUserNameFromId(currentUser.user_id);

        let profileImgSrc;

        if (currentUser.profile_image) {
            profileImgSrc = URL.createObjectURL(currentUser.profile_image); 
        } else {
            profileImgSrc = '/img/defaultuser.png';
        }

        // 🔥 Update ONLY profile section
        const profileDiv = document.getElementById("sidebar-profile");

        profileDiv.innerHTML = `
            <img src="${profileImgSrc}" />
            <div class="sidebar-profile-info">
                <h2>${currentUser.name}</h2>
                <h4>${currentUser.designation}</h4>
            </div>
        `;

    } catch (e) {
        console.log("Profile load failed", e);
    }
};
sideBar()