import React, { useRef, useEffect, useState } from "react"
import {
  CURSOR_COLOR,
  PROGRESS_COLOR,
  REGION_COLOR,
  REGION_END_TIME,
  REGION_START_TIME,
  WAVE_COLOR,
} from "../constants"
import WaveSurfer from "wavesurfer.js"
import { FaPause, FaPlay, FaStop, FaCut } from "react-icons/fa"
import { ImLoop } from "react-icons/im"
import Timeline from "wavesurfer.js/dist/plugins/timeline.esm.js"
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.esm.js"
import { trimHandler } from "./AudioWaveUtils/trimHandler"
import { fetchAudio } from "./AudioWaveUtils/fetchAudio"

interface AudioWaveformControlsProps {
  audioSrc: string
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
  const [isStopped, setIsStopped] = useState(false)
  const [loopNumber, setLoopNumber] = useState<number>(0)
  const isStoppedRef = useRef(isStopped)

  useEffect(() => {
    isStoppedRef.current = isStopped
  }, [isStopped])

  useEffect(() => {
    if (waveformRef.current) {
      waveformInstance.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: WAVE_COLOR,
        progressColor: PROGRESS_COLOR,
        cursorColor: CURSOR_COLOR,
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
        normalize: true,
        plugins: [Timeline.create(), RegionsPlugin.create()],
      })
      createRegionInstance()
    }

    return () => {
      if (waveformInstance.current) {
        waveformInstance.current?.destroy()
      }
    }
  }, [])

  useEffect(() => {
    if (audioSrc) {
      fetchAudio(audioSrc, waveformInstance.current)
    }
  }, [audioSrc])

  const createRegionInstance = () => {
    const wsRegion = waveformInstance.current?.registerPlugin(
      RegionsPlugin.create()
    )

    regionInstance.current = wsRegion

    waveformInstance.current?.on("ready", () => {
      wsRegion?.clearRegions()

      regionInstance.current?.addRegion({
        start: REGION_START_TIME,
        end: REGION_END_TIME,
        color: REGION_COLOR,
        drag: true,
        resize: true,
      })
    })
  }

  const handlePlayPauseFunctionality = () => {
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

  const handleStopFunctionality = () => {
    if (waveformInstance.current) {
      waveformInstance.current.stop()
      setIsPlaying(false)
      setIsStopped(true)
    }
  }

  const handleTrimFunctionality = async () => {
    trimHandler(audioSrc, regionInstance, waveformInstance, newWaveformInstance)
  }

  const regionLoopHandler = async () => {
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
      <div className="controls my-10  flex w-1/2 justify-evenly">
        <button onClick={handlePlayPauseFunctionality}>
          {isPlaying ? <FaPause /> : <FaPlay />}
        </button>
        <button onClick={handleStopFunctionality}>
          <FaStop />
        </button>
        <button onClick={handleTrimFunctionality}>
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
