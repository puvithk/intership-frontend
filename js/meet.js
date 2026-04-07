
const microphone = document.getElementById('microphone')
const camera = document.getElementById('cameras')
const speaker = document.getElementById("output-audio")
const params = new URLSearchParams(window.location.search);
const currentUser = document.getElementById('current-user')
let cameras = []
let microphones = []
let speakers = []
let meetingIdGlobal ;

const checkPermision = async ()=>{
    const meetingId = params.get('meetingid')
    
    const meeting =  await mappedUsersToMeetingGetMapping(userId , meetingId)
    if(meeting){
        console.log(meetingId , "Meeting 1")
        meetingIdGlobal =  meetingId
    }
    console.log(meetingIdGlobal , "Meeting ")
    return !!(meeting);
}

document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.getElementById("webcam-toggle");
    const video = document.getElementById("webcam");

    let stream = null; // store stream globally

    video.muted = true;

    toggle.addEventListener("change", async () => {
        const selectedCam =camera.value
        
        const selectedMic =microphone.value
        console.log(selectedCam , selectedMic)
        // ✅ If checkbox is ON → Start camera
        if (toggle.checked) {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    deviceId: selectedCam ? { exact: selectedCam } : undefined
                },
                audio: {
                    deviceId: selectedMic ? { exact: selectedMic } : undefined
                }
            });

                video.srcObject = stream;
                video.play();

            } catch (err) {
                console.error(err);
                alert("Camera access denied!");
                toggle.checked = false; // reset toggle
            }
        } 
        
        // ❌ If checkbox is OFF → Stop camera
        else {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                video.srcObject = null;
                stream = null;
            }
        }
    });
    async function restartStream() {
    if (!stream) return;

    stream.getTracks().forEach(track => track.stop());

    const selectedMic = microphone.value;
    const selectedCam = camera.value;

    stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: selectedCam } },
        audio: { deviceId: { exact: selectedMic } }
    });

    video.srcObject = stream;
}

// listeners
microphone.addEventListener("change", restartStream);
camera.addEventListener("change", restartStream);
});

async function getDevices() {
    try {
        await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        const devices = await navigator.mediaDevices.enumerateDevices();

        cameras = devices.filter(device => device.kind === "videoinput");
        microphones = devices.filter(device => device.kind === "audioinput");
        speakers = devices.filter(device => device.kind === "audiooutput");

        console.log("Cameras:", cameras);
        console.log("Microphones:", microphones);
        console.log("Speakers:", speakers);
        microphones.forEach((element)=>{
            const options = document.createElement('option')
            options.innerText  = element.label
            options.value = element.deviceId
            microphone.append(options)
        })
        cameras.forEach((element)=>{
            const options = document.createElement('option')
            options.innerText  = element.label
            options.value = element.deviceId
            camera.append(options)
        })
        speakers.forEach((element)=>{
            const options = document.createElement('option')
            options.innerText  = element.label
            options.value = element.deviceId
            speaker.append(options)
        })
    } catch (err) {
        console.error(err);
    }
}

getDevices();
const getPermission = async()=>{
    const check = await checkPermision()
    console.log(check)
    if(!check){
        notification("Not allowed" , 'fail')
        console.log("Redireting ")
        setInterval(()=>{
                globalThis.location.href = '/html/home.html'
        } , 5000)
       
    }

}

const mainSection =  document.getElementById('main-section-join')
const joinNowBtn = document.getElementById('join-now')
joinNowBtn.addEventListener('click' ,async ()=>{
   console.log("Userid meetingId" , userId , meetingIdGlobal)
    await updateTheParticipation({
        userId:userId , meetingId:meetingIdGlobal , participated:true
    })
    const name = await getUserNameFromId(userId)
    currentUser.innerText =  name.name
    mainSection.classList.add('hide')
})

const endBtn = document.getElementById('end-call')
endBtn.addEventListener('click' , ()=>{
    showEndScreen()
})
const showEndScreen = () => {
    const screen = document.getElementById("end-screen");
    screen.classList.remove("hide");

    let time = 5;
    const countdownEl = document.getElementById("countdown");

    const interval = setInterval(() => {
        time--;
        countdownEl.innerText = time;

        if (time === 0) {
            clearInterval(interval);

            // 🔥 redirect (replace removes history)
            window.location.replace("/html/home.html");
        }
    }, 1000);
};

const goHome = () => {
    window.location.replace("/html/home.html");
};
getPermission()