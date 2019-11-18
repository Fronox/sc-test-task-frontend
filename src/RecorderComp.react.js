import React from "react";
import RecordRTC from "recordrtc";
import { Modal } from 'react-bootstrap';
import axios from "axios";

function captureUserMedia(videoEabled, audioEnabled, callback) {
  const videoSettings = videoEabled ? {
    mandatory: {
      //minAspectRatio: 1.77,
      minWidth: 720,
      minHeight: 480,

      maxWidth: 1280,
      maxHeight: 720,
    }
  } : videoEabled;
  const params = {  
    video: videoSettings, 
    audio: audioEnabled 
  };
  navigator.getUserMedia(params, callback, error => {
    alert(JSON.stringify(error));
  });
}

const Checkbox = props => (
  <input type="checkbox" {...props} />
)

class RecorderCompReact extends React.Component {

  constructor(properties) {
    super(properties);

    this.state = {
      recordVideo: null,
      src: null,
      uploadSuccess: null,
      uploading: false,
      video: true,
      audio: true,
      width: 100,
      height: 480
    };

    this.requestUserMedia = this.requestUserMedia.bind(this);
    this.startRecord = this.startRecord.bind(this);
    this.stopRecord = this.stopRecord.bind(this);
    this.uploadToS3 = this.uploadToS3.bind(this);
  }

  componentDidMount() {
    document.getElementById('stop-record-btn').disabled = true;
    document.getElementById('upload-btn').disabled = true;
    this.requestUserMedia();
  }

  startRecord() {
    captureUserMedia(this.state.video, this.state.audio, stream => {
      console.log('Recording is strarted');
      document.getElementById('vid-en').disabled = true;
      document.getElementById('aud-en').disabled = true;
      document.getElementById('start-record-btn').disabled = true;
      document.getElementById('stop-record-btn').disabled = false;
      document.getElementById('upload-btn').disabled = true;
      document.getElementById('video-viewer').srcObject = stream;

      this.setState({ uploadSuccess: false })
      this.setState({ recordVideo: RecordRTC(stream, {
        type: 'video',
        canvas: {
          width: this.state.width,
          height: this.state.height
        }})
      });
      this.state.recordVideo.startRecording()
    });
  }

  stopRecord() {
    this.state.recordVideo.stopRecording(_ => {
      console.log('Recoding is stopped');
      document.getElementById('vid-en').disabled = false;
      document.getElementById('aud-en').disabled = false;
      document.getElementById('start-record-btn').disabled = false;
      document.getElementById('stop-record-btn').disabled = true;
      document.getElementById('upload-btn').disabled = false;
      const video = document.getElementById('video-viewer');
      video.src = video.srcObject = null;
      video.src = URL.createObjectURL(this.state.recordVideo.getBlob());
    })
  }

  uploadToS3(){
    const url = 'http://localhost:4000/api/v1/video'
    const blob = this.state.recordVideo.getBlob();
    const formData = new FormData();
    console.log(blob)
    formData.append('file', blob);

    this.setState({uploading: true, uploadSuccess: false});

    console.log(formData);

    axios.post(url, formData, {}).then(res => {
      this.setState({uploading: false, uploadSuccess: true});
      console.log(res)
    })
  }

  requestUserMedia(){
    captureUserMedia(this.state.video, this.state.audio, stream => {
      this.setState({src: stream});
      const video = document.getElementById('video-viewer');
      video.srcObject = stream;
    })
  }


  render() {
    return(
      <div>
        <div><video id={'video-viewer'} autoPlay muted playsInline/></div>
        <div>
          <Checkbox 
            id="vid-en"
            checked={this.state.video}
            onChange={event => this.setState({video: event.target.checked})}
          />
          <label>Video enabled</label>
        </div>
        <div>
          <Checkbox 
            id="aud-en"
            checked={this.state.audio}
            onChange={event => this.setState({audio: event.target.checked})}
          />
          <label>Audio enabled</label>
        </div>
        <div><button id={'start-record-btn'} onClick={this.startRecord}>Start Record</button></div>
        <div><button id={'stop-record-btn'} onClick={this.stopRecord}>Stop Record</button></div>
        <div><button id={'upload-btn'} onClick={this.uploadToS3}>Upload to S3</button></div>
        {this.state.uploading ?
          <div>Uploading...</div> : null}
        <Modal show={this.state.uploadSuccess}><Modal.Body>Upload success!</Modal.Body></Modal>
      </div>
    )
  }
}

export default RecorderCompReact;
