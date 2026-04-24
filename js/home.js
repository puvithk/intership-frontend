let meetings  =[]
// Time stamp converter 
 const parseCustomDate = (dateStr) => {

    const [datePart, timePart] = dateStr.split(", ");

    const [day, month, year] = datePart.split("/").map(Number);
    const [hours, minutes, seconds] = timePart.split(":").map(Number);

    return new Date(year, month - 1, day, hours, minutes, seconds);
    };

// Get the action
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

// Get the partipation count 
const getParticipationCount = async (meetingId)=>{
    const meetingsAssignment = await getMappedUserFromMeetingId(meetingId)
    const filter = meetingsAssignment.filter((element)=>{
        return element.participated === true
    })
    return filter.length
}
// Update the meeting to the grid 
const updateMeetings =async () => {
    const userId = JSON.parse(localStorage.getItem('currentUser')).user_id
    const meetingBody = document.querySelector("tbody")
    let allMeetings = ""
    let meetingsFromOrg =await getMeetingFromUserId(userId)
    let meetingParticiaption =  await meetingsFromUserId(userId)
    meetings = Object.values(
    [...meetingParticiaption, ...meetingsFromOrg].reduce((acc, item) => {
        acc[item.meetingId] = item;
        return acc;
    }, {})
);
    console.log(meetings , "meetings")
    if(meetings.length === 0){
        const tr = document.createElement('tr')
        tr.innerHTML = `<td colspan='3'>No meetings</td>`
        meetingBody.append(tr)
        return
    }
 
    meetings.sort((a, b) => {
    return  new Date(b.startTime) - new Date(a.startTime);
        } );
    meetings.reverse()
    for(let element of meetings) {
        const participantsCount = await getParticipationCount(element.meetingId)
        let participantsHTML= `<p>${participantsCount}</p>` ;
        const now = new Date();
    const start = parseCustomDate(element.startTime);
    const end = parseCustomDate(element.endTime);
        let action = getTimeLabel(start , end);
         
        let status = null
        if(start < now && end < now ){
            status = 'Completed'
            await updateMeetingStatus(element.meetingId , status)

        }else if (start < now && end > now){
            status =  'Live'
            await updateMeetingStatus(element.meetingId , status)
        }


        allMeetings += `
        <tr>
            <td class="project-name">${element.meetingName}</td>
            <td>
                <div class="team-members">
                    ${participantsHTML}
                </div>
            </td>
            <td><span class="status ${status ? status.toLowerCase(): element.status.toLowerCase()}">${status || element.status}</span></td>
            <td>${element.startTime}</td>
               <td style="display:flex ; align-items:center ;justify-content: center;"><button style='width:100%;' class="edit-btn" onclick="openMeeting('${element.meetingId}')" ${(now >= start) ? '' :'disabled'}>${action}</button></td>
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
        
        await refreshHome(); 
        
        // Close modal
        document.getElementById('delete-modal').style.display = 'none';
        meetingIdToDelete = null;
    }
});



// Update your existing openMeeting function
const openMeeting = async (meetingId) => {
    const meeting = await getMeetingFromId(meetingId);
    const now = new Date();
    const start = parseCustomDate(meeting.startTime);
    const end = parseCustomDate(meeting.endTime);

    // Check if meeting is completed
    if (end < now) {
        viewMeetingDetails(meetingId);
        return;
    }

    if (start > now) {
        notification("Meeting Yet to start", 'fail');
    } else {
        const url = `/html/meet.html?meetingid=${meetingId}`;
        window.open(url, '_blank');
    }
};

// New function to fetch and show details
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

// Update total team get the team and count 
const updateTotalTeam =async ()=>{
    const teams = await getAllTeamsOfUsers(userId)
    const teamCount = teams.length
    const teamCountElemnt = document.getElementById("total-teams")
    teamCountElemnt.innerText = teamCount
}
// Get the meeting and count 
const updateTotalMeeting = async() =>{
    const meetings = await getMeetingFromUserId(userId)
    const today = new Date();

    const todaysMeeting = meetings.filter(x => {
        const [datePart] = x.startTime.split(","); 
        const [day, month, year] = datePart.split("/");

        return (
            Number.parseInt(day) === today.getDate() &&
            Number.parseInt(month) === (today.getMonth() + 1) &&
           Number.parseInt(year) === today.getFullYear()
        );
    });

    const totalMeeting = document.getElementById('total-meetings')
    totalMeeting.innerText = todaysMeeting.length
}
// get meeting count which is scheduled but not live or completed 
const updateTotalPendingMeeting = async() =>{
    const meetings = await getMeetingFromUserId(userId)
    const today = new Date();

    const todaysMeeting = meetings.filter(x => {
        const [datePart] = x.startTime.split(","); 
        const [day, month, year] = datePart.split("/");

        return (
            Number.parseInt(day) === today.getDate() &&
            Number.parseInt(month) === (today.getMonth() + 1) &&
           Number.parseInt(year) === today.getFullYear()
        );
    });
    const pendingMeetings = todaysMeeting.filter((element)=>{
        return element.status === 'Scheduled'
    })
    const totalMeeting = document.getElementById('pending-meeting')
    totalMeeting.innerText = pendingMeetings.length
}

// Function for Updated the table 
const updateMeetingsUsingFilter = async (filter ) => {

    const meetingBody = document.querySelector("tbody")
    let filteredMeeting ;
    if(filter=="Completed"){
        filteredMeeting = meetings.filter((value)=>{
            return value.status === 'Completed'
        })
    }else if(filter=="Scheduled"){
         filteredMeeting = meetings.filter((value)=>{
            return value.status === 'Scheduled'
        })
    }else if(filter=="Lastest"){
       filteredMeeting =  meetings.toSorted((a, b) => {
    return  new Date(b.startTime) - new Date(a.startTime);
    
        } );
    filteredMeeting.reverse()
    }else if(filter=="Today"){
        const today = new Date();

        filteredMeeting = meetings.filter((meeting) => {
        const meetingDate = parseCustomDate(meeting.startTime);

        return (
            meetingDate.getDate() === today.getDate() &&
            meetingDate.getMonth() === today.getMonth() &&
            meetingDate.getFullYear() === today.getFullYear()
        );
    });
}
    else {
        filteredMeeting = meetings
    }

    let allMeetings = ""
   
    if(filteredMeeting.length===0){
        meetingBody.innerHTML = ''
        const tr = document.createElement('tr')
        tr.innerHTML = `<td colspan='3'>No meetings</td>`
        meetingBody.append(tr)
        return
    }
   
    for(let element of filteredMeeting) {

         
         const now = new Date();
    const start = parseCustomDate(element.startTime);
    const end = parseCustomDate(element.endTime);
         let action = getTimeLabel(start , end);   

        const participantsCount = await getParticipationCount(element.meetingId)
        let participantsHTML= `<p>${participantsCount}</p>` ;
      
        // if(element.participants.length === 0){
        //     participantsHTML = 
        // }else {
        //     participantsHTML = element.participants
        //     .map(imgsPath => `<img src="${imgsPath}" alt="user"/>`)
        //     .join("")
          
        // }

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
            <td style="display:flex ; align-items:center ;justify-content: center;"><button class="edit-btn" style='width:100%;'  onclick="openMeeting('${element.meetingId}')" ${(now >= start ) ? '' :'disabled'}>${action}</button></td>
          <td style='text-align:center ;'>
            <i onclick="deleteMeeting('${element.meetingId}')" class="fa-solid fa-trash"></i>
            </td>
        </tr>
        `
    }

    meetingBody.innerHTML = allMeetings
}

//  Get the filtering element
const meetingFilterElemet = document.getElementById("meeting-filter")
// Add event listerner
meetingFilterElemet.addEventListener('change' , (e)=>{
    updateMeetingsUsingFilter(e.target.value)
})

// calling automaticlly when reloading
const loadingh = document.getElementById('loadingh')
const refreshHome=  async ()=>{
    await updateTotalMeeting()
 await updateMeetings()
 await updateTotalTeam()
 await updateTotalPendingMeeting()
 loadingh.style.display = 'none'
}
refreshHome()
