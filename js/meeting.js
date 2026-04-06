const user = JSON.parse(localStorage.getItem('currentUser'))







// Update the meeting grid
const updateMeetings =async () => {

    const meetingBody = document.querySelector("tbody")
    const meetingMain = document.querySelector('table')
    let meetings = await getMeetingFromUserId(user.user_id)
    console.log("Meetings ")
    console.log(meetings)
    let allMeetings = ""
    if(!meetings || meetings.length === 0){
        meetingMain.innerHTML = `<p class='no-meeting'>No Meeting </p>`
        return 
    }
    meetings.sort((a, b) => {
    return  new Date(b.startTime) - new Date(a.startTime);
        } );
    meetings.reverse()
    meetings.forEach(element => {
      
        // if(element.participants.length === 0){
        //     participantsHTML = `<p>No participants</p>`
        // }else {
        //     participantsHTML = element.participants
        //     .map(imgsPath => `<img src="${imgsPath}" alt="user"/>`)
        //     .join("")
          
        // }
      
    const parseCustomDate = (dateStr) => {
    const [datePart, timePart] = dateStr.split(", ");

    const [day, month, year] = datePart.split("/").map(Number);
    const [hours, minutes, seconds] = timePart.split(":").map(Number);

    return new Date(year, month - 1, day, hours, minutes, seconds);
    };
    const now = new Date();
    const start = parseCustomDate(element.startTime);
    const end = parseCustomDate(element.endTime);

    let action = "";

    if (now < start) {
        const diffMs = start - now;

        const minutes = Math.floor(diffMs / (1000 * 60));
        const hours = Math.floor(minutes / 60);

        action = hours > 0
            ? `Starts in ${hours}h ${minutes % 60}m`
            : `Starts in ${minutes}m`;

    } else if (now >= start && now <= end) {
        action = "Join Now";
    } else {
        action = "View Details";
    }
    let participantsHTML = `<p>No participants</p>`
                allMeetings += `
        <tr>
            <td class="project-name">${element.meetingName}</td>
            <td>
                <div class="team-members">
                    ${participantsHTML}
                </div>
            </td>
            <td><span class="status ${element.status.toLowerCase()}">${element.status}</span></td>
            <td>${element.startTime}</td>
            <td><button class="edit-btn">${action}</button></td>
        </tr>
        `
    })

          meetingBody.innerHTML = allMeetings  
    

}


// create the meeting 
const createMeeting = async (event)=>{
    event.preventDefault()
    const form = event.target
    const meetingName = form.name.value
    const meetingAgenda = form.agenda.value
    const meetingStart = new Date(form.start.value);
    const meetingEnd = new Date(form.end.value);
    const now = new Date();



    if (meetingStart < now) {
        notification("Meeting start time cannot be in the past", "fail");
        return;
    }

   
    if (meetingEnd <= meetingStart) {
        notification("Meeting end time must be after start time", "fail");
        return;
    }

    const startFormatted = meetingStart.toLocaleString();
    const endFormatted = meetingEnd.toLocaleString();
    const meetingId = crypto.randomUUID()
    const meetingDetails = createMeetingObject(
        {
            meetingId:meetingId,
            meetingName : meetingName , 
            startTime:startFormatted ,
            meetingAgenda : meetingAgenda,
            status : 'Scheduled',
            endTime: endFormatted , 
            organizer : user.user_id
        }
    )
    
    await addMeetingDB(meetingDetails)
    const userIds = selectedUsers.map(u => u.user_id);
    const teamIds = selectedTeams.map(t => t.teamId);
    const meet = await getMeetingFromId(meetingId)
    if(!meet){
        notification("Error while saving" ,  'fail')
        return
    }
    const teamUsers =[];
    for(let id of teamIds){
        let usersTeams = await getMappedUsers(id)
        let users = usersTeams.map(u => u.userId)
        
        teamUsers.push(...users)
    }
    const combinedUserIds = [...new Set([...teamUsers, ...userIds])];

  
    await mapUsersToMeeting(combinedUserIds , meetingId)
    await updateMeetings();
        notification("Meeting Created Succesfully" , "success")
        setTimeout(()=>{
 globalThis.location.href = '/html/meeting.html'
        } , 5000)
       
    }

// Calling function automatically when loading 
updateMeetings()






let selectedUsers = [];
let selectedTeams = [];

let allUsers = [];
let allTeams = [];


const loadData = async () => {
    allUsers = await getAllUsersDB();        
    allTeams = await getAllTeamsDB();     
};

loadData();


document.getElementById("search-team").addEventListener("input", (e) => {
    const query = e.target.value.trim().toLowerCase();
    const list = document.getElementById("team-list");

    list.innerHTML = "";

   
    if (!query) return;

    const filtered = allTeams.filter(team =>
        team.teamName.toLowerCase().includes(query)
    );
    if (filtered.length === 0) {
        const div = document.createElement("div");
        div.className = "user-item";
        div.innerText = "No teams found";
        div.style.opacity = "0.6";
        div.style.cursor = "default";

        list.appendChild(div);
        return;
    }
    filtered.forEach(team => {
        const div = document.createElement("div");
        div.className = "user-item";
        div.innerText = team.teamName;

        div.onclick = () => addTeam(team);

        list.appendChild(div);
    });
});

document.getElementById("search-user").addEventListener("input", (e) => {
    const query = e.target.value.trim().toLowerCase();
    const list = document.getElementById("user-list");

    list.innerHTML = "";

  
    if (!query) return;

    const filtered = allUsers.filter(user =>
        user.name.toLowerCase().includes(query)
    );
    if (filtered.length === 0) {
        const div = document.createElement("div");
        div.className = "user-item";
        div.innerText = "No Users found";
        div.style.opacity = "0.6";
        div.style.cursor = "default";

        list.appendChild(div);
        return;
    }
    filtered.forEach(user => {
        const div = document.createElement("div");
        div.className = "user-item";
        div.innerText = user.name;

        div.onclick = () => addUser(user);

        list.appendChild(div);
    });
});


const addUser = (user) => {
    if (selectedUsers.find(u => u.user_id === user.user_id)) return;

    selectedUsers.push(user);
    renderUsers();
};


const addTeam = (team) => {
    if (selectedTeams.find(t => t.teamId === team.teamId)) return;

    selectedTeams.push(team);
    renderTeams();
};


const removeUser = (id) => {
    selectedUsers = selectedUsers.filter(u => u.user_id !== id);
    renderUsers();
};


const removeTeam = (id) => {
    selectedTeams = selectedTeams.filter(t => t.teamId !== id);
    renderTeams();
};


const renderUsers = () => {
    const container = document.getElementById("seletced-users");
    container.innerHTML = "";

    selectedUsers.forEach(user => {
        const tag = document.createElement("div");
        tag.className = "selected-tag";
        tag.innerText = user.name;

        tag.onclick = () => removeUser(user.user_id);

        container.appendChild(tag);
    });
};


const renderTeams = () => {
    const container = document.getElementById("seletced-teams");
    container.innerHTML = "";

    selectedTeams.forEach(team => {
        const tag = document.createElement("div");
        tag.className = "selected-tag";
        tag.innerText = team.teamName;

        tag.onclick = () => removeTeam(team.teamId);

        container.appendChild(tag);
    });
};
