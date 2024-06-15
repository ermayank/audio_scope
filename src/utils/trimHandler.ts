// trimHandler.js
import bufferToBlob from "./bufferToBlob"

export const trimHandler = async (
  audioSrc: any,
  regionInstance: any,
  waveformInstance: any,
  newWaveformInstance: any
) => {
  const audioCtx = new AudioContext()

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
