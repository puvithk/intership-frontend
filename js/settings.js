// Check the currect user and undate the text
const checkUsernameUpdate = ()=>{
    const currentUser = JSON.parse(localStorage.getItem("currentUser"))
    const usernameTag = document.getElementById('user-name')
    const designationTag =document.getElementById("user-designation")
    usernameTag.innerText = currentUser.name
    designationTag.innerText = currentUser.designation
}
// check premission if admin as some extra previlage 
const checkPremission = () =>{
    let currentUser = JSON.parse(localStorage.getItem("currentUser"))
    const adminButtons = document.querySelectorAll('.admin-button')
    if(currentUser.designation !="ADMIN"){
      
        adminButtons[0].style.display = "none" ;

    }
}
// Create user form for admin 
const createUserForm = `
<form class="create-user-form" id="userForm" onsubmit="createUser(event)" >

    <div class="form-row">
        <div class="form-input">
            <label for="name">Name</label>
            <input type="text" id="name" name="name" placeholder="Enter name" required>
        </div>

        <div class="form-input">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" placeholder="Enter email" required>
        </div>
    </div>

    <div class="form-row">
        <div class="form-input">
            <label for="organization">Organization</label>
            <input type="text" id="organization" name="organization" placeholder="Enter organization" required>
        </div>

       <div class="form-input">
    <label for="designation">Designation</label>
    <select id="designation" name="designation" required>
    
        <option value="Team Lead">Team Lead</option>
        <option value="ADMIN">Admin</option>
        <option value="Intern">Intern</option>
    </select>
</div>
    </div>

    <div class="form-row">
        

        <div class="form-input">
            <label for="dob">Date of Birth</label>
            <input type="date" id="dob" name="dob" required>
        </div>
    </div>

    <div class="form-row">
        <div class="form-input">
            <label for="work_details">Work Details</label>
            <input type="text" id="work_details" name="work_details" placeholder="Enter work details" required>
        </div>

        <div class="form-input">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" placeholder="Enter password" required>
        </div>
    </div>

    <button class="schedule-btn" type="submit">Create User</button>

</form>
`
//Fucntion to open the create panel
const openCreateUser = ()=>{
    console.log("Clicked")
    const container = document.getElementsByClassName("admin-container")[0]
    container.style.display = "block"
    container.innerHTML =  createUserForm; 
}
const createUser = (event) => {
    event.preventDefault();

    const form = event.target;

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const organization = form.organization.value.trim();
    const designation = form.designation.value.trim();
    const work_details = form.work_details.value.trim();
    const password = form.password.value.trim();
    // check weather all fields are there 
    if (!name || !email || !organization || !designation || !work_details || !password) {
        notification("All fields are required", "fail");
        return;
    }
    const dob = form.dob.value;
    const today = new Date();

    if (new Date(dob) > today) {
        notification("Date of birth can't be in the future", "fail");
        return;
    }
 

    const user = {
        name: name,
        email: email,
        organization: organization,
        designation: designation,
        dob: dob,
        work_details: work_details,
        password: password
    };

   
    let users = JSON.parse(localStorage.getItem("userDetails")) || [];

   
    users.push(user);

   
    localStorage.setItem("userDetails", JSON.stringify(users));

    console.log("User stored:", users);

    notification("User Created " , "success")
    form.reset();
};

// Create team function
const openCreateTeam= ()=>{
    let allUsers = ''
    console.log(users)
    console.log("Came ")
    for(let user of users){
        allUsers+= `<option value='${user.username}'>${user.username}</option>`
        console.log(user.username)
        
    }console.log(allUsers)
    const createTeamForm = `
<form class="create-user-form" id="teamForm" onsubmit="createTeam(event)" >

    <div class="form-row">
        <div class="form-input">
            <label for="team_name">Team Name</label>
            <input type="text" id="team_name" name="team_name" placeholder="Enter team name" required>
        </div>

        <div class="form-input">
            <label for="team_lead">Team Lead</label>
            <select id="team_lead" name="team_lead" required>
                <option value="">Select Team Lead</option>
                ${allUsers}
            </select>
        </div>
    </div>

    <div class="form-row">
        <div class="form-input" style="width:100%;">
            <label for="team_description">Team Description</label>
            <input type="text" id="team_description" name="team_description" placeholder="Enter team description" required>
        </div>
    </div>

    <button class="schedule-btn" type="submit">Create Team</button>

</form>
`;

    const container = document.getElementsByClassName("admin-container")[0]
    container.style.display = "block"
    container.innerHTML =  createTeamForm;
}

const createTeam = (event) =>{
    event.preventDefault()
   
    const team_name = document.getElementById("team_name").value.trim();
    const team_description = document.getElementById("team_description").value.trim();
    const team_lead = document.getElementById("team_lead").value;


    if (!team_name) {
        notification("Team name is required", "fail");
        return;
    }

    if (!team_description) {
        notification("Team description is required", "fail");
        return;
    }

    if (!team_lead) {
        notification("Please select a team lead", "fail");
        return;
    }


    let teamsData = JSON.parse(localStorage.getItem('teamsDetails')) || [];
    let lastTeam = teamsData.length ? teamsData.at(-1) : { team_id: 0 };


    const team = {
        team_id: lastTeam.team_id + 1,
        team_name,
        team_description,
        team_lead
    }
    teamsData.push(team)
    localStorage.setItem("teamDetails" , JSON.stringify(teamsData))
    notification(`Created team ${team.team_name}` , "success")
}


// Calling the functions automaticllay when loading 
checkPremission()
checkUsernameUpdate()
