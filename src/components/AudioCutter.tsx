import { useState, useRef, useEffect } from "react"
import WaveSurfer from "wavesurfer.js"

const AudioCutter = () => {
  const [audioFile, setAudioFile] = useState(null)
  const [startTime, setStartTime] = useState(0)
  const [endTime, setEndTime] = useState(5)
  const audioContextRef = useRef(null)
  const sourceRef = useRef(null)
  const wavesurferRef = useRef(null)

  useEffect(() => {
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy()
    }

    wavesurferRef.current = WaveSurfer.create({
      container: "#waveform",
      waveColor: "violet",
      progressColor: "purple",
    })

    if (audioFile) {
      const reader = new FileReader()
      reader.onload = (event) => {
        wavesurferRef.current.load(event.target.result)
      }
      reader.readAsDataURL(audioFile)
    }

    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy()
      }
    }
  }, [audioFile])

  const handleFileChange = (event) => {
    setAudioFile(event.target.files[0])
  }

  const handleStartTimeChange = (event) => {
    setStartTime(parseFloat(event.target.value))
  }

  const handleEndTimeChange = (event) => {
    setEndTime(parseFloat(event.target.value))
  }

  const playCutAudio = async () => {
    if (audioFile && startTime >= 0 && endTime > startTime) {
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }

      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)()
      audioContextRef.current = audioContext

      const arrayBuffer = await audioFile.arrayBuffer()
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

      const source = audioContext.createBufferSource()
      source.buffer = audioBuffer
      sourceRef.current = source

      const gainNode = audioContext.createGain()
      source.connect(gainNode).connect(audioContext.destination)

      source.start(0, startTime, endTime - startTime)

      source.onended = () => {
        audioContext.close()
      }
    } else {
      alert(
        "Please select a valid audio file and enter valid start and end times."
      )
    }
  }

  return (
    <div>
      <input type="file" accept="audio/*" onChange={handleFileChange} />
      <label>
        Start Time (seconds):
        <input
          type="number"
          value={startTime}
          onChange={handleStartTimeChange}
          step="0.1"
        />
      </label>
      <label>
        End Time (seconds):
        <input
          type="number"
          value={endTime}
          onChange={handleEndTimeChange}
          step="0.1"
        />
      </label>
      <button onClick={playCutAudio}>Play Cut Audio</button>
      <div id="waveform"></div>
    </div>
  )
}

export default AudioCutter
