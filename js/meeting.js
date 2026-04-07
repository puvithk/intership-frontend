const user = JSON.parse(localStorage.getItem('currentUser'))



 const parseCustomDate = (dateStr) => {

    const [datePart, timePart] = dateStr.split(", ");

    const [day, month, year] = datePart.split("/").map(Number);
    const [hours, minutes, seconds] = timePart.split(":").map(Number);

    return new Date(year, month - 1, day, hours, minutes, seconds);
    };


const getParticipationCount = async (meetingId)=>{
    const meetingsAssignment = await getMappedUserFromMeetingId(meetingId)
    console.log("Meetign assignment ", meetingsAssignment)
    const filter = meetingsAssignment.filter((element)=>{
        return element.participated === true
    })
    return filter.length
}

const getTimeLabel = (start, end) => {
    const now = new Date();

    if (now < start) {
        const diffMs = start - now;

        const minutes = Math.floor(diffMs / (1000 * 60));
        const hours = Math.floor(minutes / 60);

        if (minutes < 1) return "Join Now";
        if (minutes < 60) return `Join Now`;
        if (hours < 24) return `Join Now`;

        return "Upcoming Meeting";
    }

    if (now >= start && now <= end) {
        return "Join Now" ;
    }

    return "View Details";
};

// Update the meeting grid
const updateMeetings =async () => {

    const meetingBody = document.querySelector("tbody")
    const meetingMain = document.querySelector('table')
    let meetings = await getMeetingFromUserId(user.user_id)
    console.log("Meetings ")
    console.log(meetings)
    let allMeetings = ""
    if(!meetings || meetings.length === 0){
        meetingBody.innerHTML = `<p class='no-meeting'>No Meeting </p>`
        return 
    }
    meetings.sort((a, b) => {
    return  new Date(b.startTime) - new Date(a.startTime);
        } );
    meetings.reverse()
    for(let element of meetings){
    const now = new Date();
    const start = parseCustomDate(element.startTime);
    const end = parseCustomDate(element.endTime);

    let action = getTimeLabel(start , end);

     const participantsCount = await getParticipationCount(element.meetingId)
        let participantsHTML= `<p>${participantsCount}</p>` ;
                allMeetings += `
        <tr>
            <td class="project-name">${element.meetingName}</td>
            <td>
                <div class="team-members">
                    ${participantsHTML}
                </div>
            </td>
            <td><span class="status ${element.status.toLowerCase()}">${element.status}</span></td>
            <td>${element.startTime}</td> <td><button class="edit-btn" onclick=openMeeting('${element.meetingId}') ${(now >= start) ? '' :'disabled'}>${action}</button></td>
        <td style='text-align:center ;'>
            <i onclick="deleteMeeting('${element.meetingId}')" class="fa-solid fa-trash"></i>
            </td>
        </tr>
        `
    }

          meetingBody.innerHTML = allMeetings  
    

}


let meetingIdToDelete = null;


const deleteMeeting = (meetingId) => {
    meetingIdToDelete = meetingId; 
    document.getElementById('delete-modal').style.display = 'flex'; 
};


document.getElementById('cancel-btn').addEventListener('click', () => {
    document.getElementById('delete-modal').style.display = 'none';
    meetingIdToDelete = null; 
});

// 3. Handle Confirm Delete button
document.getElementById('confirm-delete-btn').addEventListener('click', async () => {
    if (meetingIdToDelete) {
       
        deleteMeetingById(meetingIdToDelete);
        console.log("Deleted meeting ")
        
        await updateMeetings(); 
        
        // Close modal
        document.getElementById('delete-modal').style.display = 'none';
        meetingIdToDelete = null;
    }
});


// On meeting Fucntion to trigger meeting

// 1. Update your existing openMeeting function
const openMeeting = async (meetingId) => {
    const meeting = await getMeetingFromId(meetingId);
    const now = new Date();
    const start = parseCustomDate(meeting.startTime);
    const end = parseCustomDate(meeting.endTime);

    // Check if meeting is completed (View Details mode)
    if (end < now) {
        viewMeetingDetails(meetingId);
        return;
    }

    // Existing logic for Live/Upcoming meetings
    if (start > now) {
        notification("Meeting Yet to start", 'fail');
    } else {
        const url = `/html/meet.html?meetingid=${meetingId}`;
        window.open(url, '_blank');
    }
};

// 2. New function to fetch and show details
const viewMeetingDetails = async (meetingId) => {
    const meeting = await getMeetingFromId(meetingId);
    const participantsList = document.getElementById('participants-list');
    
    // Set UI elements
    document.getElementById('details-meeting-name').innerText = meeting.meetingName;
    document.getElementById('details-modal').style.display = 'flex';
    participantsList.innerHTML = "<li>Loading...</li>";

    
    const allMappings = await getMappedUserFromMeetingId(meetingId);
    
    if (allMappings.length === 0) {
        participantsList.innerHTML = "<li>No users were invited to this meeting.</li>";
        return;
    }

 
    let presentCount = 0;
    let absentCount = 0;
    let listHTML = "";

  
    for (let record of allMappings) {
        const user = await getUserNameFromId(record.userId);
        const name = user ? user.name : "Unknown User";
        
        if (record.participated) {
            presentCount++;
            listHTML += `
                <li class="participant-item">
                    <span>${name}</span>
                    <span class="status-badge status-present">Attended</span>
                </li>`;
        } else {
            absentCount++;
            listHTML += `
                <li class="participant-item">
                    <span>${name}</span>
                    <span class="status-badge status-absent">Not Attended</span>
                </li>`;
        }
    }

    // 4. Update the counts and the list
    document.getElementById('attended-count').innerText = presentCount;
    document.getElementById('absent-count').innerText = absentCount;
    document.getElementById('total-present-count').innerText = `${presentCount} / ${allMappings.length}`;
    participantsList.innerHTML = listHTML;
};

const closeDetailsModal = () => {
    document.getElementById('details-modal').style.display = 'none';
};




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
    await mapUsersToMeeting(userId , meetingId)
    await updateMeetings();
        notification("Meeting Created Succesfully" , "success")
        setTimeout(()=>{
 globalThis.location.href = '/html/meeting.html'
        } , 5000)
       
    }

// Calling function automatically when loading 







let selectedUsers = [];
let selectedTeams = [];

let allUsers = [];
let allTeams = [];


const loadData = async () => {
    allUsers = await getAllUsersDB();        
    allTeams = await getAllTeamsOfUsers(userId);     
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

// meeting model open 
updateMeetings()