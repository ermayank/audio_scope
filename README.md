# Audio Project

This repository contains a React-based application for audio processing, including features like audio trimming and waveform visualization using WaveSurfer.js.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [File Structure](#file-structure)
- [Contributing](#contributing)
- [License](#license)

## Features

- Load and visualize audio waveforms
- Trim audio segments
- Playback control with visual feedback
- Modular code structure for ease of maintenance

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/ermayank/audio.git
    ```

2. Navigate to the project directory:

    ```bash
    cd audio
    ```

3. Install the dependencies:

    ```bash
    npm install
    ```
4. Install Server dependencies:

    ```bash
    cd server
    npm install
    ```
## Usage

1. Start the development server:

    ```bash
    npm run dev
    ```

2. Open your browser and go to `http://localhost:3000` to see the application in action.

## File Structure

- `src/`
  - `components/`
    - `MainComponent.js`: Main component that integrates audio processing and visualization.
  - `utils/`
    - `fetchAudio.js`: Contains the function for fetching and loading audio.
    - `trimHandler.js`: Contains the function for trimming audio.
    - `colors.js`: Contains color constants used in the application.
  - `App.js`: Main application file.
  - `index.js`: Entry point of the application.

### MainComponent.js

Main component that sets up WaveSurfer instance and handles audio processing.

### fetchAudio.js

Contains the function to fetch audio from a given source and load it into the WaveSurfer instance.

### trimHandler.js

Contains the function to trim audio based on user-defined regions and load the trimmed audio.

### colors.js

Contains color constants used for WaveSurfer visualization.
