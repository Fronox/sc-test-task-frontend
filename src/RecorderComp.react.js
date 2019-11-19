import React from "react";
import RecordRTC from "recordrtc";
import { Modal } from 'react-bootstrap';
import axios from "axios";

export const Checkbox = props => (
  <input type="checkbox" {...props} />
);

class RecorderCompReact extends React.Component {

  constructor(properties) {
    super(properties);
    this.state = {
      recordVideo: null,
      blob: null,
      src: null,
      uploadSuccess: null,
      uploading: false,
      video: true,
      audio: true,
      maxWidth: process.env.REACT_APP_CAPTURE_MAX_WIDTH,
      maxHeight: process.env.REACT_APP_CAPTURE_MAX_HEIGHT,
      minWidth: process.env.REACT_APP_CAPTURE_MIN_WIDTH,
      minHeight: process.env.REACT_APP_CAPTURE_MIN_HEIGHT,
    };

    this.requestUserMedia = this.requestUserMedia.bind(this);
    this.startRecord = this.startRecord.bind(this);
    this.stopRecord = this.stopRecord.bind(this);
    this.uploadToS3 = this.uploadToS3.bind(this);
  }

  componentDidMount() {
    console.log(process.env);
    document.getElementById('stop-record-btn').disabled = true;
    document.getElementById('upload-btn').disabled = true;
    this.requestUserMedia(stream => {
      this.setState({src: stream});
      const video = document.getElementById('video-viewer');
      video.srcObject = stream;
    });
  }

  startRecord() {
    this.requestUserMedia(stream => {
      console.log('Recording is strarted');
      document.getElementById('vid-en').disabled = true;
      document.getElementById('aud-en').disabled = true;
      document.getElementById('start-record-btn').disabled = true;
      document.getElementById('stop-record-btn').disabled = false;
      document.getElementById('upload-btn').disabled = true;
      const video = document.getElementById('video-viewer');
      video.srcObject = stream;
      video.controls = false;
      video.muted = true;

      this.setState({ uploadSuccess: false });
      this.setState({ recordVideo: RecordRTC(stream)});
      this.state.recordVideo.startRecording()
    })
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
      video.controls = true;
    })
  }

  uploadToS3(){
    const url = process.env.REACT_APP_ENDPOINT;
    const blob = this.state.recordVideo.getBlob();
    const formData = new FormData();
    formData.append('file', blob);

    this.setState({uploading: true, uploadSuccess: false});

    axios.post(url, formData, {}).then(res => {
      this.setState({uploading: false, uploadSuccess: true});
      console.log(res)
    })
  }

  requestUserMedia(callback){
    const videoSettings = this.state.video ? {
        mandatory: {
          minWidth: this.state.minWidth,
          minHeight: this.state.minHeight,

          maxWidth: this.state.maxWidth,
          maxHeight: this.state.maxHeight,
        }
      } : false;
    const params = {
      video: videoSettings,
      audio: this.state.audio
    };
    navigator.getUserMedia(params, callback, error => {
      alert(JSON.stringify(error));
    });
  }

  render() {
    return(
      <div>
        <div><video id={'video-viewer'} autoPlay playsInline muted width={768} height={432}/></div>
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
