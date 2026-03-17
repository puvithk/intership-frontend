//Predified data for teams 
let teamsData = [
  {
    "team_id": 1,
    "team_name": "Frontend Team",
    "team_description": "Designing responsive UI and improving user experience for the event management website.",
    "created_at": "CURRENT_TIMESTAMP",
    "team_lead": "Puvith"
  },
  {
    "team_id": 2,
    "team_name": "Backend Team",
    "team_description": "Developing secure APIs and database architecture for managing student attendance.",
    "created_at": "CURRENT_TIMESTAMP",
    "team_lead": "Theju"
  },
  {
    "team_id": 3,
    "team_name": "AI / ML Team",
    "team_description": "Building machine learning models to automatically detect and verify students using cameras.",
    "created_at": "CURRENT_TIMESTAMP",
    "team_lead": "Divya"
  },
  {
    "team_id": 4,
    "team_name": "AI / ML Team",
    "team_description": "Building machine learning models to automatically detect and verify students using cameras.",
    "created_at": "CURRENT_TIMESTAMP",
    "team_lead": "Jeevan"
  },

]
let teamData = JSON.parse(localStorage.getItem("teamDetails")) || []

if(teamData.length == 0 ){
    localStorage.setItem("teamDetails" , JSON.stringify(teamsData))
    teamData = teamsData
}
// Load data to the gird 
const loadteamData = ()=>{
    const teamsGrid = document.getElementById("teams-grid")
    let teams = ""
    // Loop all the data and put into the team grid 
    for(let team of teamData){
        teams += `
        <article class="team-card" id="team-card">
        <h3>${team.team_name}</h3>
        <div class="break"></div>
        <h4>Team Lead : ${team.team_lead}</h4>
     
        <div class="break"></div>
        <p>${team.team_description}</p>
        <div class="break"></div>
         <div class="members">
            <p>3 Members</p>
            <img src="/img/arrow.png" onclick="openTeamMemberModel('${team.team_name}')" alt="View team members" title="View team members">
        </div>
    </article>`
    }
    teamsGrid.innerHTML = teams
}
// Call automaticlly during loading of the page 
loadteamData()
// Function to open the team members Details 
const openTeamMemberModel = (teamName) =>{
    const teamDeatils = document.getElementById("team-details")
    const container = document.getElementsByClassName("content")[0]
    const sidebar = document.getElementsByClassName("sidebar")[0]
    const teamNameTag = document.getElementById("team-name")
    teamDeatils.style.display = 'block'
    teamNameTag.innerText = teamName
    container.classList.add('blur')
    sidebar.classList.add('blur')
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

const searchTeam = (word) =>{
    // Teams 
    let filterData = teamData.filter((element)=>{
        
        return element.team_name.toLowerCase().includes(word.toLowerCase().trim()) || element.team_description.toLowerCase().includes(word.toLowerCase().trim())
    })
    // teams the update 
     const teamsGrid = document.getElementById("teams-grid")
    let teams = ""
    for(let team of filterData){
        teams += `
        <article class="team-card" id="team-card">
        <h3>${team.team_name}</h3>
        <div class="break"></div>
        <h4>Team Lead : ${team.team_lead}</h4>
     
        <div class="break"></div>
        <p>${team.team_description}</p>
        <div class="break"></div>
         <div class="members">
            <p>3 Members</p>
            <img src="/img/arrow.png" onclick="openTeamMemberModel('${team.team_name}')" alt="View team members" title="View team members">
        </div>
    </article>`
    }
    teamsGrid.innerHTML = teams 

}
const search = document.getElementById("search-team")
search.addEventListener('keyup' , (e)=>{
    return searchTeam(e.target.value)
})