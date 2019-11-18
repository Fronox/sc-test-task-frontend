import React from 'react';
import logo from './logo.svg';
import './App.css';
import RecorderCompReact from './RecorderComp.react'

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        {/*//Video element used for rendering video self-view
        <video width="25%"  id="localVideo" autoPlay playsInline  muted="muted"/>
        //Video element used for rendering video of remote party
        <video width="50%" id="remoteVideo" autoPlay playsInline />

        <WebRTCClient
          video={true}
          autoRegister = {true}
          sipDomain={decodeURIComponent(this.queryParams.domain)}
          sipServer={decodeURIComponent(this.queryParams.sipserver)}
          sipUser={decodeURIComponent(this.queryParams.userid)}
          sipPassword={decodeURIComponent(this.queryParams.password)}
          destination={decodeURIComponent(this.queryParams.destination)}
          metaData={{param1:"value1",obj1:{objparam1:"objvalue1"}}}
        />*/
          RecorderCompReact
        }
      </header>
    </div>
  );
}

export default App;
