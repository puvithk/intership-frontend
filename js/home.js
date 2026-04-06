let meetings  =[]
 const parseCustomDate = (dateStr) => {

    const [datePart, timePart] = dateStr.split(", ");

    const [day, month, year] = datePart.split("/").map(Number);
    const [hours, minutes, seconds] = timePart.split(":").map(Number);

    return new Date(year, month - 1, day, hours, minutes, seconds);
    };

// Update the meeting to the grid 
const updateMeetings =async () => {
    const userId = JSON.parse(localStorage.getItem('currentUser')).user_id
    const meetingBody = document.querySelector("tbody")
    let allMeetings = ""
    meetings =await getMeetingFromUserId(userId)

    if(meetings.length === 0){
        const tr = document.createElement('tr')
        tr.innerHTML = `<td colspan='3'>No meetings</td>`
        meetingBody.append(tr)
        return
    }
    const parseCustomDate = (dateStr) => {
    const [datePart, timePart] = dateStr.split(", ");

    const [day, month, year] = datePart.split("/").map(Number);
    const [hours, minutes, seconds] = timePart.split(":").map(Number);

    return new Date(year, month - 1, day, hours, minutes, seconds);
    };
    meetings.sort((a, b) => {
    return  new Date(b.startTime) - new Date(a.startTime);
        } );
    meetings.reverse()
    meetings.forEach(element => {

        let participantsHTML= '<p>No participants</p>' ;
        let action = "";
         const now = new Date();
    const start = parseCustomDate(element.startTime);
    const end = parseCustomDate(element.endTime);
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
// Update total team get the team and count 
const updateTotalTeam =async ()=>{
    const teams = await getAllTeamsDB()
    const teamCount = teams.length
    const teamCountElemnt = document.getElementById("total-teams")
    teamCountElemnt.innerText = teamCount
}
// Get the meeting and count 
const updateTotalMeeting = async() =>{
    const meetings = await getAllMeetingDB()
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

// Function for Updated the table 
const updateMeetingsUsingFilter = (filter ) => {

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
   
    filteredMeeting.forEach(element => {

         let action = "";
         const now = new Date();
    const start = parseCustomDate(element.startTime);
    const end = parseCustomDate(element.endTime);
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


        
        let participantsHTML= `<p>No participants</p>`;
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
            <td><button class="edit-btn">${action}</button></td>
        </tr>
        `
    })

    meetingBody.innerHTML = allMeetings
}

//  Get the filtering element
const meetingFilterElemet = document.getElementById("meeting-filter")
// Add event listerner
meetingFilterElemet.addEventListener('change' , (e)=>{
    updateMeetingsUsingFilter(e.target.value)
})

// calling automaticlly when reloading 
updateTotalMeeting()
updateMeetings()
updateTotalTeam()