// Update the meeting grid
const updateMeetings = () => {

    const meetingBody = document.querySelector("tbody")

    let allMeetings = ""
    meetings.sort((a, b) => {
    return  new Date(b.startTime) - new Date(a.startTime);
        } );
    meetings.reverse()
    meetings.forEach(element => {

        const participantsHTML = element.participants
            .map(imgsPath => `<img src="${imgsPath}" alt="user"/>`)
            .join("")

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
            <td><button class="edit-btn">${element.action}</button></td>
        </tr>
        `
    })

    meetingBody.innerHTML = allMeetings
}


// create the meeting 
const createMeeting = (event)=>{
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
   

    
    const meetingDetails = {
        "meetingName" : meetingName ,
        "action" : "Join Link",
        "startTime" : startFormatted,
        "status" : "Scheduled" ,
        "participants" : []
    }
    let meetings = JSON.parse(localStorage.getItem("meetingDetails")) || []
    meetings.push(meetingDetails)
    localStorage.setItem("meetingDetails" , JSON.stringify(meetings))

updateMeetings();
    notification("Meeting Created Succesfully" , "success")
}

// Calling function automatically when loading 
updateMeetings()