let teamData = []
const loadAllteamData = async()=>{
   teamData = await getAllTeamsDB(); 
   console.log(teamData)
}
const getUserNameFromIdTeams = async (userId)=>{
    const users = await getAllUsersDB()
    const user = users.find((element)=>{
        return userId === element.user_id
    })
    return user ? user.name : 'Unknown'
}
const getAllUsersFromId = async (userId)=>{
    const users = await getAllUsersDB()
    const user = users.find((element)=>{
        return userId === element.user_id
    })
    return user 
}
// Load data to the gird 
const loadteamData = async ()=>{
    const teamsGrid = document.getElementById("teams-grid")
    let teams = ""
    console.log("teams Data ")
    console.log(teamData)
    // Loop all the data and put into the team grid 
    for(let team of teamData){
        let teamLeadName =await getUserNameFromIdTeams(team.teamLead)
        teams += `
        <article class="team-card" id="team-card">
        <h3>${team.teamName}</h3>
        <div class="break"></div>
        <h4>Team Lead : ${teamLeadName}</h4>
     
        <div class="break"></div>
        <p>${team.teamDescription}</p>
        <div class="break"></div>
         <div class="members">
            <p>3 Members</p>
            <img src="/img/arrow.png" onclick="openTeamMemberModel('${team.teamName}' , '${team.teamId}')" alt="View team members" title="View team members">
        </div>
    </article>`
    }
    teamsGrid.innerHTML = teams
}
// Call automaticlly during loading of the page 
const refreshTeamAll = async()=>{
    await loadAllteamData()
    await loadteamData()

}
refreshTeamAll()

// Fucntion to Update the team members details 
const updateTeamMembersDetails = async (teamId) =>{
    const tbody = document.getElementById('tbody-team-members')
    const totalMembers = document.getElementById('total-members')
    tbody.innerHTML = ''
    console.log(totalMembers)
    // Get the users and teamId 
    const userOfTeam = await getMappedUsers(teamId)
    // Check weather the team is empty 
    if(userOfTeam.length ===  0 ){
        tbody.innerHTML= `<tr>
            <td colspan="3">No members</td>
                </tr>`
        totalMembers.innerHTML =  `${userOfTeam.length}`
        return
    }
    let teamMembers = []
    // Get the users details 
    for (let { userId, teamId } of userOfTeam) {
    const userDetails = await getAllUsersFromId(userId);
    teamMembers.push(userDetails)
    }
   
    totalMembers.innerText =  `${teamMembers.length}`
  

    // Update the body
    teamMembers.forEach((element)=>{
        const tr = document.createElement('tr')
        tr.innerHTML = `
            <td>${element.name}</td>
            <td>${element.designation}</td>
            <td><button  onclick="window.location.href='/html/chats.html?userid=${element.user_id}'" class="edit-btn">Message</button></td>
        `
        tbody.append(tr)
    })
    
}


    // Function to open the team members Details 
const openTeamMemberModel = async (teamName , teamId) =>{

    console.log('Team ID ')
    console.log(teamId)
    const allUserOfTeam = await getMappedUsers(teamId)
    console.log(allUserOfTeam)
    const teamDeatils = document.getElementById("team-details")
    const container = document.getElementsByClassName("content")[0]
    const sidebar = document.getElementsByClassName("sidebar")[0]
    const teamNameTag = document.getElementById("team-name")
    const addMembers = document.getElementById('add-members')
    const input = document.createElement('input')
    input.type ='hidden'
    input.value = teamId
    input.id = 'teamId'
    addMembers.append(input)
    teamDeatils.style.display = 'block'
    teamNameTag.innerText = teamName
    container.classList.add('blur')
    sidebar.classList.add('blur')
    await updateTeamMembersDetails(teamId)
}
// Closer the model make the display none , remove the blur
const closeTeamMemberModel= ()=>{
    const teamDeatils = document.getElementById("team-details")
    const container = document.getElementsByClassName("content")[0]
    const sidebar = document.getElementsByClassName("sidebar")[0]
 teamDeatils.style.display = 'none'
  
    container.classList.remove('blur')
    sidebar.classList.remove('blur')

}

const searchTeam =async (word) =>{
    // Teams 
    let filterData = teamData.filter((element)=>{
        
        return element.teamName.toLowerCase().includes(word.toLowerCase().trim()) 
        || element.teamDescription.toLowerCase().includes(word.toLowerCase().trim())
    })



    // teams the update 
    const teamsGrid = document.getElementById("teams-grid")
    let teams = ""
    for(let team of filterData){
        let teamLeadName =await getUserNameFromIdTeams(team.teamLead)
        teams += `
        <article class="team-card" id="team-card">
        <h3>${team.teamName}</h3>
        <div class="break"></div>
        <h4>Team Lead : ${teamLeadName}</h4>
     
        <div class="break"></div>
        <p>${team.teamDescription}</p>
        <div class="break"></div>
         <div class="members">
            <p>3 Members</p>
            <img src="/img/arrow.png" onclick="openTeamMemberModel('${team.teamName}' , '${team.teamId}')" alt="View team members" title="View team members">
        </div>
    </article>`
    }
    teamsGrid.innerHTML = teams 

}
const search = document.getElementById("search-team")
search.addEventListener('keyup' , (e)=>{
    return searchTeam(e.target.value)
})
let allUsers ;
const getAllUsersTeam = async ()=>{
    allUsers = await getAllUsersDB()
    console.log("All users ")
    console.log(allUsers)
}
getAllUsersTeam()
const userList = document.getElementById("userList");
const searchInput = document.getElementById("searchUser");
const addBtn = document.getElementById("addBtn");
const selectedUsersDiv = document.getElementById("selectedUsers");

let selectedUsers = [];
let tempSelected = new Set(); // temporary checkbox selection

// Render user list with checkboxes
function renderUsers(filteredUsers) {
    userList.innerHTML = "";

    filteredUsers.forEach(user => {
        const div = document.createElement("div");
        div.className = "user-item";

        div.innerHTML = `
            <input type="checkbox" data-id="${user.id}" />
            <span>${user.name}</span>
        `;

        const checkbox = div.querySelector("input");

        checkbox.addEventListener("change", (e) => {
            console.log("Seleted"
            )
            console.log(user.user_id)
            if (e.target.checked) {
                tempSelected.add(user.user_id);
            } else {
                tempSelected.delete(user.user_id);
            }
        });

        userList.appendChild(div);
    });
}

// Add selected users
addBtn.addEventListener("click", async () => {
    const teamId = document.getElementById('teamId').value
    const info = document.getElementById('error-message')
    console.log(teamId)
    console.log(tempSelected)
    let currentSeletect = []
    try{
      for (const element of tempSelected) {
        await mapUserTeam(element, teamId)
        currentSeletect.push(allUsers.find(user => user.user_id === element))
    }  
    }catch{
        info.innerText = 'User already in team'
         tempSelected.clear(); 
         info.style.color = 'red'
         return 
    }
    info.innerText = 'SuccessFully Added'

    tempSelected.clear(); 
    allUsers = allUsers.filter(user => !currentSeletect.some(selected => selected.user_id === user.user_id))
    renderUsers(allUsers);   
    renderSelectedUsers();
    await updateTeamMembersDetails(teamId)
});

// Show selected users
function renderSelectedUsers() {
    selectedUsersDiv.innerHTML = "";

    selectedUsers.forEach(user => {
        const tag = document.createElement("span");
        tag.className = "tag";
        tag.innerText = user.name;

        selectedUsersDiv.appendChild(tag);
    });
}

// Search
searchInput.addEventListener("input", () => {
    const value = searchInput.value.toLowerCase();

    const filtered = allUsers.filter(user =>
        user.name.toLowerCase().includes(value)
    );

    renderUsers(filtered);
});

// Initial render
renderUsers(users);