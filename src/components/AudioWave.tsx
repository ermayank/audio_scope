import React, { useRef, useEffect, useState } from "react"
import WaveSurfer from "wavesurfer.js"
import { FaPause, FaPlay, FaStop, FaCut } from "react-icons/fa"
import { ImLoop } from "react-icons/im"
import Timeline from "wavesurfer.js/dist/plugins/timeline.esm.js"
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.esm.js"

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
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  const audioRef = useRef(null)
  const [trimmedAudioBlob, setTrimmedAudioBlob] = useState(null)

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

  // once the file URL is ready, load the file to produce the waveform
  useEffect(() => {
    if (audioSrc && waveformInstance.current) {
      waveformInstance.current!.load(audioSrc)
    }
  }, [audioSrc])

  useEffect(() => {
    let wavesurferObj = waveformInstance.current
    if (wavesurferObj) {
      // once the waveform is ready, play the audio
      // wavesurferObj.on("ready", () => {
      //   wavesurferObj.play()
      // })

      // once audio starts playing, set the state variable to true
      wavesurferObj.on("play", () => {
        setIsPlaying(true)
      })

      // once audio starts playing, set the state variable to false
      wavesurferObj.on("finish", () => {
        setIsPlaying(false)
      })
    }
  }, [waveformInstance.current])

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

  // const trimHandler = async () => {
  //   const start = regionInstance.current!.regions[0].start
  //   const end = regionInstance.current!.regions[0].end

  //   console.log(start, end)

  //   let audioData = waveformInstance.current?.getDecodedData()
  //   // waveformInstance.current?.play(start, end)
  //   console.log(audioData)
  //   const combined = new Float32Array(audioData!.length)
  //   // const start = startTime
  //   // const end = endTime

  //   if (audioBuffer && waveformInstance.current) {
  //     // const sampleRate = audioBuffer.sampleRate
  //     // const length = (end - start) * sampleRate

  //     const audioContext = new (window.AudioContext || window.AudioContext)()
  //     audioContextRef.current = audioContext

  //     const arrayBuffer = await audioSrc.arrayBuffer()
  //     const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

  //     const source = audioContext.createBufferSource();
  //     source.buffer = audioBuffer;

  //     const gainNode = audioContext.createGain();
  //     source.connect(gainNode).connect(audioContext.destination);

  //     source.start(0, startTime, endTime - startTime);

  //     // const trimmedBuffer = waveformInstance.current.backend.ac.createBuffer(
  //     //   audioBuffer.numberOfChannels,
  //     //   length,
  //     //   sampleRate
  //     // )

  //     // for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
  //     //   const channelData = audioBuffer.getChannelData(channel)
  //     //   trimmedBuffer.copyToChannel(
  //     //     channelData.slice(start * sampleRate, end * sampleRate),
  //     //     channel
  //     //   )
  //     // }

  //     // const trimmedBlob = bufferToWave(trimmedBuffer)
  //     // const trimmedUrl = URL.createObjectURL(trimmedBlob)

  //     // waveformInstance.current.load(trimmedUrl)
  //   }
  // }

  // const trimHandler = async () => {
  //   const audioCtx = new AudioContext()
  //   const audio = audioRef.current

  //   const audioResponse = await fetch(audioSrc)
  //   const audioArrayBuffer = await audioResponse.arrayBuffer()
  //   const audioBuffer = await audioCtx.decodeAudioData(audioArrayBuffer)

  //   // const audioBuffer = await new Promise((resolve) => {
  //   //   const reader = new FileReader()
  //   //   reader.onload = () => resolve(audioCtx.decodeAudioData(reader.result))
  //   //   reader.readAsArrayBuffer(audio.files[0])
  //   // })

  //   // const trimmedStart = /* get trim start value from state */;
  //   // const trimmedEnd = /* get trim end value from state */;
  //   const trimmedStart = regionInstance.current!.regions[0].start
  //   const trimmedEnd = regionInstance.current!.regions[0].end

  //   console.log("Original audioBuffer", audioBuffer)

  //   // Option 2: Manual Trimming (fallback for browsers without slice):
  //   const sampleRate = audioBuffer.sampleRate
  //   const channelData = []

  //   const trimmedStartSample = trimmedStart * sampleRate
  //   const trimmedEndSample = trimmedEnd * sampleRate
  //   const originalLength = audioBuffer.length

  //   for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
  //     const originalChannelData = audioBuffer.getChannelData(channel)
  //     const trimmedChannelData = originalChannelData.slice(
  //       trimmedStartSample,
  //       trimmedEndSample
  //     )
  //     channelData.push(trimmedChannelData)
  //   }

  //   const trimmedBuffer = audioCtx.createBuffer(
  //     audioBuffer.numberOfChannels,
  //     channelData[0].length,
  //     audioBuffer.sampleRate
  //   )

  //   for (let channel = 0; channel < trimmedBuffer.numberOfChannels; channel++) {
  //     trimmedBuffer.copyToChannel(channelData[channel], channel)
  //   }

  //   console.log("Trimmed audioBuffer", trimmedBuffer)

  //   // Create a new buffer for the result of the subtraction
  //   const resultBuffer = audioCtx.createBuffer(
  //     audioBuffer.numberOfChannels,
  //     originalLength,
  //     audioBuffer.sampleRate
  //   )

  //   for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
  //     const originalChannelData = audioBuffer.getChannelData(channel)
  //     const resultChannelData = resultBuffer.getChannelData(channel)
  //     const trimmedChannelData = channelData[channel]

  //     for (let i = 0; i < originalLength; i++) {
  //       if (i >= trimmedStartSample && i < trimmedEndSample) {
  //         // Subtract the trimmed buffer sample from the original buffer sample
  //         resultChannelData[i] =
  //           originalChannelData[i] - trimmedChannelData[i - trimmedStartSample]
  //       } else {
  //         // Keep the original buffer sample
  //         resultChannelData[i] = originalChannelData[i]
  //       }
  //     }
  //   }
  //   console.log("Result audioBuffer", resultBuffer)

  //   // const trimmedAudio = await audioCtx.createBuffer(
  //   //   trimmedBuffer.numberOfChannels,
  //   //   trimmedBuffer.length,
  //   //   trimmedBuffer.sampleRate
  //   // )

  //   // trimmedBuffer.copyToChannelData(trimmedAudio.getChannelData(0))

  //   // const trimmedBlob = await new Promise((resolve) => {
  //   //   audioCtx.decodeAudioData(trimmedAudio, (buffer) => {
  //   //     const blob = new Blob([buffer], { type: "audio/wav" })
  //   //     resolve(blob)
  //   //   })
  //   // })

  //   // setTrimmedAudioBlob(trimmedBlob)
  // }

  // const trimHandler = async () => {
  //   const audioCtx = new AudioContext()

  //   // Fetch the audio data
  //   const audioResponse = await fetch(audioSrc)
  //   const audioArrayBuffer = await audioResponse.arrayBuffer()
  //   const audioBuffer = await audioCtx.decodeAudioData(audioArrayBuffer)

  //   // Define the trim start and end points
  //   const trimmedStart = regionInstance.current!.regions[0].start
  //   const trimmedEnd = regionInstance.current!.regions[0].end

  //   console.log("Original audioBuffer", audioBuffer)

  //   // Get the sample rate and calculate sample positions
  //   const sampleRate = audioBuffer.sampleRate
  //   const trimmedStartSample = Math.floor(trimmedStart * sampleRate)
  //   const trimmedEndSample = Math.floor(trimmedEnd * sampleRate)
  //   const originalLength = audioBuffer.length

  //   // Extract channel data for each channel and trim
  //   const channelData = []
  //   for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
  //     const originalChannelData = audioBuffer.getChannelData(channel)
  //     const trimmedChannelData = originalChannelData.slice(
  //       trimmedStartSample,
  //       trimmedEndSample
  //     )
  //     channelData.push(trimmedChannelData)
  //   }

  //   // Create a buffer for the trimmed audio
  //   const trimmedBuffer = audioCtx.createBuffer(
  //     audioBuffer.numberOfChannels,
  //     channelData[0].length,
  //     audioBuffer.sampleRate
  //   )

  //   // Copy trimmed data into the new buffer
  //   for (let channel = 0; channel < trimmedBuffer.numberOfChannels; channel++) {
  //     trimmedBuffer.copyToChannel(channelData[channel], channel)
  //   }

  //   console.log("Trimmed audioBuffer", trimmedBuffer)

  //   // Create a buffer for the result of the subtraction
  //   const resultBuffer = audioCtx.createBuffer(
  //     audioBuffer.numberOfChannels,
  //     originalLength,
  //     audioBuffer.sampleRate
  //   )

  //   // Subtract the trimmed buffer from the original buffer
  //   for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
  //     const originalChannelData = audioBuffer.getChannelData(channel)
  //     const resultChannelData = resultBuffer.getChannelData(channel)
  //     const trimmedChannelData = channelData[channel]

  //     for (let i = 0; i < originalLength; i++) {
  //       if (i >= trimmedStartSample && i < trimmedEndSample) {
  //         // Subtract the trimmed buffer sample from the original buffer sample
  //         resultChannelData[i] =
  //           originalChannelData[i] -
  //           (trimmedChannelData[i - trimmedStartSample] || 0)
  //       } else {
  //         // Keep the original buffer sample
  //         resultChannelData[i] = originalChannelData[i]
  //       }
  //     }
  //   }

  //   console.log("Result audioBuffer", resultBuffer)

  //   // You can now use resultBuffer for further processing or playback
  //   // Example: Create a new AudioBufferSourceNode and play the result
  //   const resultSource = audioCtx.createBufferSource()
  //   resultSource.buffer = resultBuffer
  //   resultSource.connect(audioCtx.destination)
  //   resultSource.start()

  //   // Optionally, handle errors and ensure cleanup
  //   resultSource.onended = () => {
  //     audioCtx.close()
  //   }
  // }

  const trimHandler = async () => {
    const audioCtx = new AudioContext()
    const audio = audioRef.current

    // Fetch the audio data
    const audioResponse = await fetch(audioSrc)
    const audioArrayBuffer = await audioResponse.arrayBuffer()
    const audioBuffer = await audioCtx.decodeAudioData(audioArrayBuffer)

    // Define the trim start and end points
    const trimmedStart = regionInstance.current!.regions[0].start
    const trimmedEnd = regionInstance.current!.regions[0].end

    console.log("Original audioBuffer", audioBuffer)

    // Get the sample rate and calculate sample positions
    const sampleRate = audioBuffer.sampleRate
    const trimmedStartSample = Math.floor(trimmedStart * sampleRate)
    const trimmedEndSample = Math.floor(trimmedEnd * sampleRate)
    const originalLength = audioBuffer.length

    // Create a new buffer for the result
    const newLength = originalLength - (trimmedEndSample - trimmedStartSample)
    const resultBuffer = audioCtx.createBuffer(
      audioBuffer.numberOfChannels,
      newLength,
      audioBuffer.sampleRate
    )

    // Concatenate the parts before and after the trimmed section
    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const originalChannelData = audioBuffer.getChannelData(channel)
      const resultChannelData = resultBuffer.getChannelData(channel)

      // // Copy the data before the trimmed section
      for (let i = 0; i < trimmedStartSample; i++) {
        resultChannelData[i] = originalChannelData[i]
      }
      // for (let i = 0; i < trimmedStartSample; i++) {
      //   resultChannelData[i] = originalChannelData[i]
      // }

      // Copy the data after the trimmed section
      for (let i = trimmedEndSample; i < originalLength; i++) {
        resultChannelData[i - (trimmedEndSample - trimmedStartSample)] =
          originalChannelData[i]
      }
    }

    console.log("Result audioBuffer", resultBuffer)

    // You can now use resultBuffer for further processing or playback
    // Example: Create a new AudioBufferSourceNode and play the result
    const resultSource = audioCtx.createBufferSource()
    resultSource.buffer = resultBuffer
    resultSource.connect(audioCtx.destination)
    // resultSource.start()

    // Optionally, handle errors and ensure cleanup
    resultSource.onended = () => {
      audioCtx.close()
    }

    // Replace with your AudioBuffer

    const audioBlob = await bufferToWave(resultBuffer)
    const url = URL.createObjectURL(audioBlob)
    const duration = audioBuffer.duration

    const peaks = [
      resultBuffer.getChannelData(0),
      resultBuffer.getChannelData(1),
    ] // Optional for peaks
    if (newWaveformRef.current) {
      newWaveformInstance.current = WaveSurfer.create({
        container: newWaveformRef.current,
        waveColor: "#0569ff",
        progressColor: "#0353cc",
        cursorColor: "#ddd5e9",
        backend: "MediaElement",
        cursorWidth: 2,
        minPxPerSec: 1,
        fillParent: true,
        autoplay: true,
        interact: true,
        dragToSeek: true,
        audioRate: 1,
        autoScroll: true,
        autoCenter: true,

        plugins: [Timeline.create(), RegionsPlugin.create()],
      })
    }
    newWaveformInstance.current?.load(url, peaks, duration)

    newWaveformInstance.current?.on("ready", function () {
      URL.revokeObjectURL(url)
    })
  }

  const bufferToWave = (abuffer: AudioBuffer) => {
    let numOfChan = abuffer.numberOfChannels,
      length = abuffer.length * numOfChan * 2 + 44,
      buffer = new ArrayBuffer(length),
      view = new DataView(buffer),
      channels = [],
      i,
      sample,
      offset = 0,
      pos = 0

    setUint32(0x46464952) // "RIFF"
    setUint32(length - 8) // file length - 8
    setUint32(0x45564157) // "WAVE"

    setUint32(0x20746d66) // "fmt " chunk
    setUint32(16) // length = 16
    setUint16(1) // PCM (uncompressed)
    setUint16(numOfChan)
    setUint32(abuffer.sampleRate)
    setUint32(abuffer.sampleRate * 2 * numOfChan) // avg. bytes/sec
    setUint16(numOfChan * 2) // block-align
    setUint16(16) // 16-bit (hardcoded in this demo)

    setUint32(0x61746164) // "data" - chunk
    setUint32(length - pos - 4) // chunk length

    for (i = 0; i < abuffer.numberOfChannels; i++)
      channels.push(abuffer.getChannelData(i))

    while (pos < length) {
      for (i = 0; i < numOfChan; i++) {
        sample = Math.max(-1, Math.min(1, channels[i][offset])) // clamp
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0 // scale to 16-bit signed int
        view.setInt16(pos, sample, true) // write 16-bit sample
        pos += 2
      }
      offset++ // next source sample
    }

    function setUint16(data: number) {
      view.setUint16(pos, data, true)
      pos += 2
    }

    function setUint32(data: number) {
      view.setUint32(pos, data, true)
      pos += 4
    }

    return new Blob([buffer], { type: "audio/wav" })
  }

  const regionLoopHandler = async () => {
    setIsLoopRunning(true)
    setIsStopped(false)
    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms))

    const start = regionInstance.current!.regions[0].start
    const end = regionInstance.current!.regions[0].end
    const duration = end - start

    //If loop number is 0 or NaN then loop infinitely
    let i = 0
    let loopCondition =
      loopNumber == 0 || isNaN(loopNumber) ? true : i < loopNumber
    console.log(loopNumber)

    while (i < loopNumber) {
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
