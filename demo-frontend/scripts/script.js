const logError = function (err) {
    console.log("Error : ", err);
};

console.log('Starting...');

const remoteContainer = document.getElementById("remote-container");
const canvasContainer = document.getElementById("canvas-container");

function addVideoStream(streamId) {
    const streamDiv = document.createElement("div");
    streamDiv.id = streamId;
    streamDiv.style.transform = "rotateY(180deg)";
    streamDiv.classList.add('remote-video');
    remoteContainer.appendChild(streamDiv);
}

function removeVideoStream(evt) {
    const stream = evt.stream;
    consteam.stop();
    const remDiv = document.getElementById(stream.getId());
    remDiv.parentNode.removeChild(remDiv);
    console.log("Remote stream is removed " + stream.getId());
}

const rtc = {
    client: null,
    joined: false,
    published: false,
    localStream: null,
    remoteStreams: [],
    params: {}
};

const client = AgoraRTC.createClient({
    mode: "rtc",
    codec: "h264"
});

document.getElementById("load").onclick = () => {
    console.log('Fetching token');

    const appID = "1da04466b6d54791aconst3737f04a0be9";
    const uid = +document.getElementById("userId").value;
    const channelName = document.getElementById("channelName").value;

    fetch("http://localhost:3000/token/" + uid + "/" + channelName)
        .then(response => response.json())
        .then((token) => {
            client.init(appID, () => console.log('Agora RTC client intialized'));
            client.join(token, channelName, uid, () => {

                const localStream = AgoraRTC.createStream({
                    streamID: uid,
                    audio: true,
                    video: true,
                    screen: false
                });

                localStream.init(function () {
                    localStream.play('me');
                    client.publish(localStream, logError);
                }, logError);

            }, logError);

            client.on('stream-added', function (evt) {
                client.subscribe(evt.stream, logError);
            });

            client.on('stream-subscribed', function (evt) {
                const stream = evt.stream;
                addVideoStream(stream.getId());
                stream.play(stream.getId().toString());
            });

            client.on('stream-removed', removeVideoStream);
            client.on('peer-leave', removeVideoStream);
        });
}
