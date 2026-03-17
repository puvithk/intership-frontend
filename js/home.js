// Update the meeting to the grid 
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
// Update total team get the team and count 
const updateTotalTeam = ()=>{
    const teams = JSON.parse(localStorage.getItem("teamDetails")) || []
    const teamCount = teams.length
    const teamCountElemnt = document.getElementById("total-teams")
    teamCountElemnt.innerText = teamCount
}
// Get the meeting and count 
const updateTotalMeeting =() =>{
    const meetings = JSON.parse(localStorage.getItem("meetingDetails")) || []
    const today = new Date();

    const todaysMeeting = meetings.filter(x => {
        const [datePart] = x.startTime.split(","); 
        const [day, month, year] = datePart.split("/");

        return (
            parseInt(day) === today.getDate() &&
            parseInt(month) === (today.getMonth() + 1) &&
            parseInt(year) === today.getFullYear()
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
       filteredMeeting =  meetings.sort((a, b) => {
    return  new Date(b.startTime) - new Date(a.startTime);
        } );
   
    }else {
        filteredMeeting = meetings
    }

    let allMeetings = ""
    
    filteredMeeting.forEach(element => {

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