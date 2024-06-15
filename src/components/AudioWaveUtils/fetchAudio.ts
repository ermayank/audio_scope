import WaveSurfer from "wavesurfer.js"

// fetchAudio.js
export const fetchAudio = async (
  audioSrc: string,
  waveformInstance: WaveSurfer | null
) => {
  try {
    const response = await fetch(audioSrc)
    const arrayBuffer = await response.arrayBuffer()
    const blob = new Blob([arrayBuffer], { type: "audio/mpeg" })
    const objectUrl = URL.createObjectURL(blob)
    waveformInstance?.load(objectUrl)
  } catch (error) {
    console.error("Error fetching audio:", error)
  }
}
