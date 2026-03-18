

let users = JSON.parse(localStorage.getItem('userDetails'))
let meetings = JSON.parse(localStorage.getItem('meetingDetails'))
if(users==null){
    let user = {
        name : "Puvith",
        password : "",
        designation: "ADMIN"
    }
    let users = [user ]
    localStorage.setItem('userDetails' , JSON.stringify(users))
  
}
if(meetings== null){
  let mockMeetings = [
    {
        meetingName: "Sprint Planning - Q3",
        participants: [
            "../img/profile.png",
            "../img/profile1.png",
            "../img/profile2.png"
        ],
        status: "Completed",
        startTime: "Today, 10:00 AM",
        action: "View Notes"
    },
    {
        meetingName: "Design Review",
        participants: [
            "../img/profile2.png",
            "../img/profile1.png"
        ],
        status: "Scheduled",
        startTime: "Tomorrow, 02:30 PM",
        action: "Join Link"
    },
    {
        meetingName: "Client Kickoff",
        participants: [
            "../img/profile1.png",
            "../img/profile2.png",
            "../img/profile.png",
            "../img/profile4.png"
        ],
        status: "Live Now",
        startTime: "Started 5m ago",
        action: "Join Now"
    }
]
localStorage.setItem("meetingDetails" , JSON.stringify(mockMeetings))
meetings = localStorage.getItem("meetingDetails")
}
const loading = `<div class="loading">
                            <div class="inner-cirle"></div>
                             <p>Loading Messages</p>
                        </div>`
// FInd user from the localStorge and login 
const login = (event) =>{

    const form = event.target
    const username = form.username.value 
     console.log(users)
    let currentUser = users.find(x => x.name === username)
    const errorMessage = document.getElementById("error-messages")
    console.log(currentUser)

    if (currentUser) {
        localStorage.setItem("currentUser" , JSON.stringify(currentUser))

        globalThis.location.href = "/html/home.html"
       
     
    } else {
        errorMessage.classList.add("fail-progress")
        errorMessage.innerText = "User not found"

      
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
    const currectUser = JSON.parse(localStorage.getItem('currentUser'))
    const sidebar = `
        <div class="sidebar-icon">
            <a href="/" class="sidebar-icon-name">NexTeams</a>
            <p class="sidebar-icon-name-mobile">NT</p>
        </div>

        <nav class="sidebar-nav"> 
            <div class="dashboard">
                <a href="../html/home.html">
                    <img src="../img/dashboard.png" alt="Dashboard logo"/>
                    <span>Dashboard</span>
                </a>
            </div>

            <div class="chats">
                <a href="../html/chats.html">
                    <img src="../img/message.png" alt="Chats logo"/>
                    <span>Chats</span>
                </a>
            </div>

            <div class="teams">
                <a href="../html/teams.html">
                    <img src="../img/team.png" alt="Teams logo"/>
                    <span>Teams</span>
                </a>
            </div>

            <div class="meetings">
                <a href="../html/meeting.html">
                    <img src="../img/meeting.png" alt="Meetings logo"/>
                    <span>Meetings</span>
                </a>
            </div>

            <div class="community">
                <a href="../html/community.html">
                    <img src="../img/community.png" alt="Community logo"/>
                    <span>Community</span>
                </a>
            </div>

            <div class="settings">
                <a href="../html/settings.html">
                    <img src="../img/settings.png" alt="Settings logo"/>
                    <span>Settings</span>
                </a>
            </div>
        </nav>

        <div class="sidebar-profile">
            <img src="../img/profile.png" alt="User profile"/>
            <div class="sidebar-profile-info">
                <h2>${currectUser.name}</h2>
                <h4>${currectUser.designation}</h4>
            </div>
        </div>
    `

    const asideSidebar = document.getElementsByClassName('sidebar')[0]
    asideSidebar.innerHTML = sidebar

    setActiveMenu()
}

sideBar()

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

