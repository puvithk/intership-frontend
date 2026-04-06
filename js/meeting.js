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
    const meetingDetails = createMeetingObject(
        {
            meetingName : meetingName , 
            startTime:startFormatted ,
            meetingAgenda : meetingAgenda,
            status : 'Scheduled',
            endTime: endFormatted , 
            organizer : user.user_id
        }
    )
    
    await addMeetingDB(meetingDetails)

    await updateMeetings();
        notification("Meeting Created Succesfully" , "success")
    }

// Calling function automatically when loading 
updateMeetings()