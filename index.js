let mediaRecorder;
let audioChunks = [];
let audioBuffer = null;
let audioContext = null;
let loopSource = null;
let isRecording = false;

const recordBtn = document.getElementById('record');
const playBtn = document.getElementById('play');
const stopBtn = document.getElementById('stop');
const deleteBtn = document.getElementById('delete');
const statusDiv = document.getElementById('status');

recordBtn.onclick = async () => {
  if (isRecording) return;

  audioChunks = [];
  statusDiv.textContent = "Recording...";

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) audioChunks.push(e.data);
  };

  mediaRecorder.onstop = async () => {
    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
    const arrayBuffer = await audioBlob.arrayBuffer();
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    statusDiv.textContent = "Recording complete!";
    playBtn.disabled = false;
    deleteBtn.disabled = false;
  };

  mediaRecorder.start();
  isRecording = true;
  recordBtn.disabled = true;
  stopBtn.disabled = false;
};

stopBtn.onclick = () => {
  if (isRecording && mediaRecorder) {
    mediaRecorder.stop();
    isRecording = false;
    recordBtn.disabled = false;
    stopBtn.disabled = true;
    statusDiv.textContent = "Stopped recording.";
  }
  if (loopSource) {
    loopSource.stop();
    loopSource.disconnect();
    loopSource = null;
    statusDiv.textContent = "Playback stopped.";
    playBtn.disabled = false;
    stopBtn.disabled = true;
  }
};

playBtn.onclick = () => {
  if (!audioBuffer) return;

  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  loopSource = audioContext.createBufferSource();
  loopSource.buffer = audioBuffer;
  loopSource.loop = true;
  loopSource.connect(audioContext.destination);
  loopSource.start();

  statusDiv.textContent = "Playing loop...";
  playBtn.disabled = true;
  stopBtn.disabled = false;
};

deleteBtn.onclick = () => {
  audioBuffer = null;
  playBtn.disabled = true;
  stopBtn.disabled = true;
  deleteBtn.disabled = true;
  statusDiv.textContent = "Loop deleted.";
};
