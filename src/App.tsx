import AudioCutter from "./components/AudioCutter"
import AudioWaveformControls from "./components/AudioWave"
// import UploadAudio from "./components/FileUpload"

function App() {
  const audioSrc = "./test.mp3"
  return (
    <>
      <h1 className="text-3xl font-bold">Hello world!</h1>
      {/* <UploadAudio></UploadAudio> */}
      <AudioWaveformControls audioSrc={audioSrc}></AudioWaveformControls>
      {/* <AudioCutter></AudioCutter> */}
    </>
  )
}

export default App
