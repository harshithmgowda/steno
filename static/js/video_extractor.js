/**
 * ==============================================================================
 * HTML5 VIDEO FRAME EXTRACTOR (Client-Side .mp4 / .webm Processing)
 * Department of ISE, DBIT - Digital Video Steganography
 * ==============================================================================
 */

class VideoFrameExtractor {
  /**
   * Extracts an array of ImageData frames from an uploaded video File object.
   * @param {File} videoFile - The uploaded video file (.mp4, .webm, etc.)
   * @param {number} targetFramesCount - Number of frames to extract (default: 20)
   * @param {Function} onProgress - Progress callback (percent, statusText)
   * @returns {Promise<{frames: ImageData[], width: number, height: number, duration: number, fps: number}>}
   */
  static extractFrames(videoFile, targetFramesCount = 20, onProgress = () => {}) {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.preload = "auto";
      video.muted = true;
      video.playsInline = true;

      const videoUrl = URL.createObjectURL(videoFile);
      video.src = videoUrl;

      video.onloadedmetadata = async () => {
        try {
          const duration = video.duration || 1.0;
          let width = video.videoWidth || 320;
          let height = video.videoHeight || 240;

          // Scale down high-res 4K/1080p videos to maximum 480x360 for fast client-side DWT/AFS processing
          const maxDim = 480;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          // Ensure dimensions are even numbers (required for 2D Haar Wavelet DWT)
          width = width - (width % 2);
          height = height - (height % 2);

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d", { willReadFrequently: true });

          const extractedFrames = [];
          const numFrames = Math.max(4, Math.min(60, targetFramesCount));
          const stepTime = duration / numFrames;

          onProgress(5, "Initializing video decoder...");

          for (let i = 0; i < numFrames; i++) {
            const seekTime = Math.min(duration - 0.05, i * stepTime);
            await this.seekToTime(video, seekTime);

            ctx.drawImage(video, 0, 0, width, height);
            const imgData = ctx.getImageData(0, 0, width, height);
            extractedFrames.push(imgData);

            const pct = Math.round(((i + 1) / numFrames) * 90) + 5;
            onProgress(pct, `Extracted frame ${i + 1} of ${numFrames}...`);
          }

          URL.revokeObjectURL(videoUrl);
          onProgress(100, "Frame extraction complete!");

          resolve({
            frames: extractedFrames,
            width,
            height,
            duration,
            fps: Math.round(numFrames / duration) || 24,
            videoBlobUrl: URL.createObjectURL(videoFile)
          });
        } catch (err) {
          URL.revokeObjectURL(videoUrl);
          reject(err);
        }
      };

      video.onerror = () => {
        URL.revokeObjectURL(videoUrl);
        reject(new Error("Unable to decode uploaded video file. Please use MP4 or WebM format."));
      };
    });
  }

  /**
   * Helper: Promisified video seek.
   */
  static seekToTime(video, time) {
    return new Promise((resolve) => {
      const onSeeked = () => {
        video.removeEventListener("seeked", onSeeked);
        resolve();
      };
      video.addEventListener("seeked", onSeeked);
      video.currentTime = time;
    });
  }
}

window.VideoFrameExtractor = VideoFrameExtractor;
