import React, { useRef, useEffect, useState } from "react"
import WaveSurfer from "wavesurfer.js"
import { FaPause, FaPlay, FaStop, FaCut } from "react-icons/fa"
import { ImLoop } from "react-icons/im"
import Timeline from "wavesurfer.js/dist/plugins/timeline.esm.js"
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.esm.js"
import bufferToBlob from "../utils/bufferToBlob"

interface AudioWaveformControlsProps {
  audioSrc: string // URL or path to the audio file
}

const AudioWaveformControls: React.FC<AudioWaveformControlsProps> = ({
  audioSrc,
}) => {
  const waveformRef = useRef<HTMLDivElement>(null)
  const waveformInstance = useRef<WaveSurfer | null>(null)
  const regionInstance = useRef<any>(null)

  const newWaveformRef = useRef<HTMLDivElement>(null)
  const newWaveformInstance = useRef<WaveSurfer | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [startTime, setStartTime] = useState<number>(0)
  const [endTime, setEndTime] = useState<number>(10)
  const [isStopped, setIsStopped] = useState(false)
  const [loopNumber, setLoopNumber] = useState<number>(0)
  const isStoppedRef = useRef(isStopped)
  const [isLoopRunning, setIsLoopRunning] = useState(false)

  useEffect(() => {
    isStoppedRef.current = isStopped
  }, [isStopped])

  useEffect(() => {
    if (waveformRef.current) {
      waveformInstance.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: "#0569ff",
        progressColor: "#0353cc",
        cursorColor: "#ddd5e9",
        backend: "MediaElement",
        cursorWidth: 2,
        minPxPerSec: 1,
        fillParent: true,
        autoplay: false,
        interact: true,
        dragToSeek: true,
        audioRate: 1,
        autoScroll: true,
        autoCenter: true,
        plugins: [Timeline.create(), RegionsPlugin.create()],
      })

      const wsRegion = waveformInstance.current?.registerPlugin(
        RegionsPlugin.create()
      )

      regionInstance.current = wsRegion

      waveformInstance.current?.on("ready", () => {
        wsRegion?.clearRegions()

        regionInstance.current?.addRegion({
          start: startTime,
          end: endTime,
          color: "rgba(234, 242, 124, 0.5)",
          drag: true,
          resize: true,
        })
      })

      regionInstance.current.on("region-update", () => {
        console.log("region update")
      })
    }

    return () => {
      if (waveformInstance.current) {
        waveformInstance.current?.destroy()
      }
    }
  }, [])

  useEffect(() => {
    const fetchAudio = async () => {
      try {
        const response = await fetch(audioSrc)
        const arrayBuffer = await response.arrayBuffer()
        const blob = new Blob([arrayBuffer], { type: "audio/mpeg" })
        const objectUrl = URL.createObjectURL(blob)
        waveformInstance.current!.load(objectUrl)
        // setAudioSrc(objectUrl);
      } catch (error) {
        console.error("Error fetching audio:", error)
      }
    }

    if (audioSrc) {
      fetchAudio()
    }
  }, [audioSrc])

  useEffect(() => {
    let wavesurferObj = waveformInstance.current
    if (wavesurferObj) {
      wavesurferObj.on("play", () => {
        setIsPlaying(true)
      })

      wavesurferObj.on("finish", () => {
        setIsPlaying(false)
      })
    }
  }, [])

  const handlePlayPause = () => {
    if (waveformInstance.current) {
      if (isPlaying) {
        waveformInstance.current.pause()
        setIsStopped(true)
      } else {
        waveformInstance.current.play()
        setIsStopped(false)
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleStop = () => {
    if (waveformInstance.current) {
      waveformInstance.current.stop()
      setIsPlaying(false)
      setIsStopped(true)
    }
  }

  const trimHandler = async () => {
    const audioCtx = new AudioContext()
    // const audio = audioRef.current

    const audioResponse = await fetch(audioSrc)
    const audioArrayBuffer = await audioResponse.arrayBuffer()
    const audioBuffer = await audioCtx.decodeAudioData(audioArrayBuffer)

    const trimmedStart = regionInstance.current!.regions[0].start
    const trimmedEnd = regionInstance.current!.regions[0].end

    console.log("Original audioBuffer", audioBuffer)

    const sampleRate = audioBuffer.sampleRate
    const trimmedStartSample = Math.floor(trimmedStart * sampleRate)
    const trimmedEndSample = Math.floor(trimmedEnd * sampleRate)
    const originalLength = audioBuffer.length

    const newLength = originalLength - (trimmedEndSample - trimmedStartSample)
    const resultBuffer = audioCtx.createBuffer(
      audioBuffer.numberOfChannels,
      newLength,
      audioBuffer.sampleRate
    )

    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const originalChannelData = audioBuffer.getChannelData(channel)
      const resultChannelData = resultBuffer.getChannelData(channel)

      for (let i = 0; i < trimmedStartSample; i++) {
        resultChannelData[i] = originalChannelData[i]
      }

      for (let i = trimmedEndSample; i < originalLength; i++) {
        resultChannelData[i - (trimmedEndSample - trimmedStartSample)] =
          originalChannelData[i]
      }
    }

    console.log("Result audioBuffer", resultBuffer)

    const audioBlob = bufferToBlob(resultBuffer)
    const url = URL.createObjectURL(audioBlob)
    const duration = audioBuffer.duration
    console.log(url)

    let peaks = []

    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      peaks.push(resultBuffer.getChannelData(channel))
    }

    // Load the trimmed audio into the original waveform instance
    if (waveformInstance.current) {
      waveformInstance.current.load(url)
    }

    // Clean up the URL after loading
    if (newWaveformInstance.current) {
      newWaveformInstance.current.load(url)

      newWaveformInstance.current.on("ready", function () {
        URL.revokeObjectURL(url)
      })
    }

    newWaveformInstance.current?.on("ready", function () {
      URL.revokeObjectURL(url)
    })
  }

  const regionLoopHandler = async () => {
    setIsLoopRunning(true)
    setIsStopped(false)
    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms))

    const start = regionInstance.current!.regions[0].start
    const end = regionInstance.current!.regions[0].end
    const duration = end - start

    let i = 0
    while (loopNumber == 0 || i < loopNumber) {
      if (isStoppedRef.current) {
        console.log("Loop stopped:", isStoppedRef.current)
        break
      }
      console.log("Loop iteration:", i + 1)
      waveformInstance.current?.setTime(start)
      waveformInstance.current?.play()

      await delay(duration * 1000)

      if (!isStoppedRef.current) {
        waveformInstance.current?.pause()
      }
      i++
    }
  }

  return (
    <div className="audio-waveform-controls w-screen flex flex-col justify-center items-center">
      <div className="waveform-container w-5/6" ref={waveformRef} />
      <div className="waveform-container w-5/6" ref={newWaveformRef} />
      <div className="controls my-10">
        <button onClick={handlePlayPause}>
          {isPlaying ? <FaPause /> : <FaPlay />}
        </button>
        <button onClick={handleStop}>
          <FaStop />
        </button>
        <button onClick={trimHandler}>
          <FaCut />
        </button>
        <div className="flex ">
          <button onClick={regionLoopHandler}>
            <ImLoop />
          </button>
          <input
            onChange={(e) => setLoopNumber(parseInt(e.target.value))}
          ></input>
        </div>
      </div>
    </div>
  )
}

export default AudioWaveformControls
