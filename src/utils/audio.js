export const createAudioContext = () => {
  return new (window.AudioContext || window.webkitAudioContext)();
};

const disconnectAllNodes = (node) => {
  if (node.numberOfOutputs) {
    for (let i = 0; i < node.numberOfOutputs; i++) {
      const outputs = node.connect(audioContext.destination);
      node.disconnect(audioContext.destination);
      if (outputs && outputs.length) {
        outputs.forEach(disconnectAll);
      }
    }
  }
};

export const destroyAudioContext = (audioContext) => {
  return new Promise((resolve, reject) => {
    if (audioContext.state === 'closed') {
      resolve();
      return;
    }

    disconnectAllNodes(audioContext.destination);

    audioContext
      .close()
      .then(() => {
        resolve();
      })
      .catch((error) => {
        console.error('Error closing AudioContext:', error);
        reject(error);
      });
  });
};

export const calculateRMS = (array) => {
  let rms = 0;
  for (let i = 0; i < array.length; i++) {
    // Convert byte data (0-255) to float (-1 to 1)
    const floatSample = (array[i] - 128) / 128;
    rms += floatSample * floatSample;
  }
  rms = Math.sqrt(rms / array.length);
  return rms;
};

export const getNormalizedGain = (analyserNode) => {
  const dataArray = new Uint8Array(analyserNode.frequencyBinCount);
  analyserNode.getByteFrequencyData(dataArray);
  return 1 - calculateRMS(dataArray);
};
