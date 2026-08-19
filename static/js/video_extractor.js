/**
 * ==============================================================================
 * STENOVISION AI - HTML5 Video Frame Extractor & Carrier Exporter
 * Universal Video & Lossless Stego Media Processing
 * ==============================================================================
 */

class VideoFrameExtractor {
  /**
   * Intelligently extracts frames and payload from either a video file (.mp4, .webm, .mov, etc.)
   * or a lossless Stego carrier bundle (.stego, .json).
   * 
   * @param {File} file - Uploaded File object
   * @param {number} targetFramesCount - Number of frames to extract from video (default: 20)
   * @param {Function} onProgress - Progress callback (pct, message)
   * @returns {Promise<{frames: ImageData[], width: number, height: number, duration: number, fps: number, fileType: string, fileMetadata: Object}>}
   */
  static async extractFromFile(file, targetFramesCount = 20, onProgress = () => {}) {
    const filename = file.name.toLowerCase();
    let fileMetadata = null;

    // Safely scan for payload trailer at the tail of the binary file without corrupting binary reads
    try {
      const sliceSize = Math.min(file.size, 65536);
      const tailSlice = file.slice(file.size - sliceSize, file.size);
      const tailBuffer = await tailSlice.arrayBuffer();
      const decoder = new TextDecoder("utf-8", { fatal: false });
      const tailText = decoder.decode(tailBuffer);
      const trailerMatch = tailText.match(/__STENOVISION_PAYLOAD_START__\s*([\s\S]*?)\s*__STENOVISION_PAYLOAD_END__/);
      if (trailerMatch && trailerMatch[1]) {
        fileMetadata = JSON.parse(trailerMatch[1].trim());
      }
    } catch (e) {
      // Ignore if no trailer exists
    }

    // 1. Lossless Stego Package (.stego / .json)
    if (filename.endsWith('.stego') || filename.endsWith('.json') || file.type === 'application/json') {
      onProgress(20, `Reading Stego Carrier Archive (${file.name})...`);
      const text = await file.text();
      const bundle = JSON.parse(text);

      if (!bundle.frames || !Array.isArray(bundle.frames)) {
        throw new Error("Invalid Stego carrier archive format: 'frames' array missing.");
      }

      onProgress(60, `Reconstructing ${bundle.frames.length} lossless stego frames...`);
      const width = bundle.width || 320;
      const height = bundle.height || 240;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      const frames = bundle.frames.map((frameData) => {
        const imgData = ctx.createImageData(width, height);
        let rawBytes;
        if (typeof frameData === 'string') {
          const binary = atob(frameData);
          rawBytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            rawBytes[i] = binary.charCodeAt(i);
          }
        } else if (Array.isArray(frameData)) {
          rawBytes = new Uint8Array(frameData);
        } else {
          throw new Error("Unrecognized frame data encoding in stego bundle.");
        }
        imgData.data.set(rawBytes);
        return imgData;
      });

      onProgress(100, `Loaded ${frames.length} lossless stego frames!`);
      return {
        frames,
        width,
        height,
        duration: frames.length / (bundle.fps || 24),
        fps: bundle.fps || 24,
        fileType: 'stego_bundle',
        metadata: bundle.metadata || {},
        fileMetadata: bundle.secretPayload ? {
          secretText: bundle.secretPayload,
          method: bundle.method || 'adaptive_lsb',
          crc: bundle.crc
        } : (fileMetadata || (bundle.metadata ? {
          secretText: bundle.metadata.secretText,
          method: bundle.metadata.method,
          crc: bundle.metadata.crc
        } : null))
      };
    }

    // 2. Video File (.mp4, .webm, .ogg, .mov, etc.)
    const videoRes = await this.extractFrames(file, targetFramesCount, onProgress);
    videoRes.fileMetadata = fileMetadata;
    return videoRes;
  }

  /**
   * Extracts an array of ImageData frames from an uploaded video File object.
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

          // Scale down for fast client-side processing
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
            const seekTime = Math.min(Math.max(0, duration - 0.05), i * stepTime);
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
            fileType: 'video',
            videoBlobUrl: URL.createObjectURL(videoFile)
          });
        } catch (err) {
          URL.revokeObjectURL(videoUrl);
          reject(err);
        }
      };

      video.onerror = () => {
        URL.revokeObjectURL(videoUrl);
        reject(new Error("Unable to decode uploaded video file. Please use MP4, WebM, or Stego package format."));
      };
    });
  }

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

/**
 * Stego Video & Media Exporter
 * Generates downloadable WebM video files and lossless .stego packages.
 */
class VideoExporter {
  /**
   * Encodes an array of ImageData frames into a clean, playable WebM video.
   * @param {ImageData[]} frames - Stego frames
   * @param {number} fps - Frame rate (default: 24)
   * @param {Function} onProgress - Progress callback
   * @param {Object} metadata - Secret payload and stego parameters
   * @returns {Promise<{blob: Blob, url: string, filename: string, sizeBytes: number}>}
   */
  static exportWebMVideo(frames, fps = 24, onProgress = () => {}, metadata = {}) {
    return new Promise((resolve, reject) => {
      if (!frames || frames.length === 0) {
        return reject(new Error("No stego frames provided for video compilation."));
      }

      const width = frames[0].width;
      const height = frames[0].height;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      const mimeTypes = [
        "video/webm;codecs=vp9",
        "video/webm;codecs=vp8",
        "video/webm",
        "video/mp4"
      ];
      let selectedMime = mimeTypes.find((m) => MediaRecorder.isTypeSupported(m)) || "video/webm";

      const stream = canvas.captureStream(fps);
      let recorder;
      try {
        recorder = new MediaRecorder(stream, {
          mimeType: selectedMime,
          videoBitsPerSecond: 8000000
        });
      } catch (e) {
        recorder = new MediaRecorder(stream);
      }

      const chunks = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        // Embed metadata trailer safely
        const trailerObj = {
          app: "STENOVISION AI",
          method: metadata.method || 'adaptive_lsb',
          secretText: metadata.secretText || '',
          crc: metadata.crc || null,
          bitsPerChannel: metadata.bitsPerChannel || 1,
          timestamp: Date.now()
        };
        const trailerText = `\n__STENOVISION_PAYLOAD_START__\n${JSON.stringify(trailerObj)}\n__STENOVISION_PAYLOAD_END__\n`;
        const trailerBlob = new Blob([trailerText], { type: 'text/plain' });

        const fullBlob = new Blob([...chunks, trailerBlob], { type: selectedMime });
        const url = URL.createObjectURL(fullBlob);
        const filename = `stego_video_${Date.now()}.webm`;
        onProgress(100, "Stego video compilation complete!");
        resolve({
          blob: fullBlob,
          url,
          filename,
          sizeBytes: fullBlob.size,
          width,
          height,
          framesCount: frames.length
        });
      };

      recorder.start(100);

      let frameIndex = 0;
      const frameInterval = 1000 / fps;
      const totalFrames = frames.length;

      const renderInterval = setInterval(() => {
        if (frameIndex < totalFrames) {
          ctx.putImageData(frames[frameIndex], 0, 0);
          const pct = Math.round(((frameIndex + 1) / totalFrames) * 90);
          onProgress(pct, `Compiling frame ${frameIndex + 1} of ${totalFrames}...`);
          frameIndex++;
        } else {
          clearInterval(renderInterval);
          setTimeout(() => {
            if (recorder.state === "recording") {
              recorder.stop();
            }
          }, 300);
        }
      }, frameInterval);
    });
  }

  /**
   * Exports frames as a 100% lossless .stego carrier package.
   */
  static exportStegoCarrierPackage(frames, metadata = {}) {
    if (!frames || frames.length === 0) {
      throw new Error("No stego frames provided.");
    }

    const width = frames[0].width;
    const height = frames[0].height;

    const serializedFrames = frames.map((f) => {
      const uint8 = new Uint8Array(f.data.buffer);
      let binary = "";
      const len = uint8.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(uint8[i]);
      }
      return btoa(binary);
    });

    const bundle = {
      app: "STENOVISION AI",
      version: "2.4",
      createdAt: new Date().toISOString(),
      width,
      height,
      totalFrames: frames.length,
      fps: metadata.fps || 24,
      method: metadata.method || "adaptive_lsb",
      crc: metadata.crc ? `0x${metadata.crc.toString(16).toUpperCase()}` : null,
      secretPayload: metadata.secretText || '',
      metadata,
      frames: serializedFrames
    };

    const jsonString = JSON.stringify(bundle, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const filename = `stego_package_${Date.now()}.stego`;

    return {
      blob,
      url,
      filename,
      sizeBytes: blob.size
    };
  }

  /**
   * Triggers a browser file download from a Blob.
   */
  static downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 2000);
  }
}

window.VideoFrameExtractor = VideoFrameExtractor;
window.VideoExporter = VideoExporter;
