import React, { useState } from "react"
import AudioWaveformControls from "./components/AudioWave"
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import UploadAudio from "./components/UploadAudio"

const App: React.FC = () => {
  const [audioSrc, setAudioSrc] = useState<string>("")

  return (
    <>
      <h1 className="text-3xl my-5 font-bold text-center">Staccato</h1>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <UploadAudio
                onUploadSuccess={(audioSrc) => setAudioSrc(audioSrc)}
              />
            }
          />
          <Route
            path="/edit"
            element={<AudioWaveformControls audioSrc={audioSrc} />}
          />
        </Routes>
      </Router>
    </>
  )
}

export default App
