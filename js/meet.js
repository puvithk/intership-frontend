
const microphone = document.getElementById('microphone')
const camera = document.getElementById('cameras')
const speaker = document.getElementById("output-audio")
let cameras = []
let microphones = []
let speakers = []
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