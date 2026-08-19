/**
 * ==============================================================================
 * ADAPTIVE FRAME SELECTION (AFS) ENGINE
 * Department of ISE, DBIT - Digital Video Steganography
 * ==============================================================================
 */

class AFSEngine {
  /**
   * Converts RGBA ImageData to a grayscale Float32Array.
   */
  static imageDataToGrayscale(imgData) {
    const { width, height, data } = imgData;
    const gray = new Float32Array(width * height);
    for (let i = 0; i < width * height; i++) {
      const r = data[i * 4];
      const g = data[i * 4 + 1];
      const b = data[i * 4 + 2];
      gray[i] = 0.299 * r + 0.587 * g + 0.114 * b;
    }
    return gray;
  }

  /**
   * Computes spatial texture variance using 3x3 Laplacian edge convolution.
   */
  static calculateTextureVariance(gray, width, height) {
    const lap = new Float32Array(width * height);
    let sum = 0;
    let count = 0;

    // Laplacian kernel: [0, 1, 0; 1, -4, 1; 0, 1, 0]
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const val =
          gray[(y - 1) * width + x] +
          gray[(y + 1) * width + x] +
          gray[y * width + (x - 1)] +
          gray[y * width + (x + 1)] -
          4 * gray[y * width + x];
        lap[y * width + x] = val;
        sum += val;
        count++;
      }
    }

    const mean = sum / count;
    let varSum = 0;
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const diff = lap[y * width + x] - mean;
        varSum += diff * diff;
      }
    }

    const lapVar = varSum / count;

    // Intensity standard deviation
    let gSum = 0;
    for (let i = 0; i < gray.length; i++) gSum += gray[i];
    const gMean = gSum / gray.length;
    let gVarSum = 0;
    for (let i = 0; i < gray.length; i++) {
      const diff = gray[i] - gMean;
      gVarSum += diff * diff;
    }
    const stdDev = Math.sqrt(gVarSum / gray.length);

    return Number((lapVar * 0.7 + stdDev * 0.3).toFixed(2));
  }

  /**
   * Computes Shannon Entropy of the grayscale distribution.
   */
  static calculateEntropy(gray) {
    const hist = new Int32Array(256);
    for (let i = 0; i < gray.length; i++) {
      const bin = Math.min(255, Math.max(0, Math.round(gray[i])));
      hist[bin]++;
    }

    const total = gray.length;
    let entropy = 0;
    for (let i = 0; i < 256; i++) {
      if (hist[i] > 0) {
        const p = hist[i] / total;
        entropy -= p * Math.log2(p);
      }
    }
    return Number(entropy.toFixed(3));
  }

  /**
   * Computes temporal motion difference against previous frame.
   */
  static calculateMotionDifference(grayCurr, grayPrev) {
    if (!grayPrev) return 0.0;
    let diffSum = 0;
    for (let i = 0; i < grayCurr.length; i++) {
      diffSum += Math.abs(grayCurr[i] - grayPrev[i]);
    }
    return Number((diffSum / grayCurr.length).toFixed(2));
  }

  /**
   * Analyzes an array of frame ImageData objects and ranks them.
   */
  static analyzeFrames(frameImgDataList) {
    const analysis = [];
    let prevGray = null;

    for (let i = 0; i < frameImgDataList.length; i++) {
      const imgData = frameImgDataList[i];
      const gray = this.imageDataToGrayscale(imgData);
      const texture = this.calculateTextureVariance(gray, imgData.width, imgData.height);
      const entropy = this.calculateEntropy(gray);
      const motion = this.calculateMotionDifference(gray, prevGray);

      // Composite AFS suitability score
      const suitability = Number((texture * 0.5 + entropy * 20.0 + motion * 1.5).toFixed(2));

      analysis.push({
        index: i,
        textureVariance: texture,
        entropy: entropy,
        motionScore: motion,
        suitabilityScore: suitability,
        gray: gray,
        width: imgData.width,
        height: imgData.height,
      });

      prevGray = gray;
    }

    return analysis;
  }

  /**
   * Deterministically selects carrier frame indices based on designated strategy & ratio.
   */
  static selectCarrierFrames(analysis, ratio = 0.35, strategy = "hybrid", minFrames = 2) {
    const total = analysis.length;
    const targetCount = Math.min(total, Math.max(minFrames, Math.ceil(total * ratio)));

    const sorted = [...analysis];
    if (strategy === "texture_variance") {
      sorted.sort((a, b) => b.textureVariance - a.textureVariance);
    } else if (strategy === "motion_energy") {
      sorted.sort((a, b) => b.motionScore - a.motionScore);
    } else {
      sorted.sort((a, b) => b.suitabilityScore - a.suitabilityScore);
    }

    const selected = sorted.slice(0, targetCount).map((item) => item.index);
    return selected.sort((a, b) => a - b); // Keep in chronological order
  }
}

window.AFSEngine = AFSEngine;
