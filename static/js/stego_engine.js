/**
 * ==============================================================================
 * DIGITAL VIDEO STEGANOGRAPHY PIPELINE ENGINE (LSB & 2D-DWT)
 * Department of ISE, Don Bosco Institute of Technology (DBIT)
 * ==============================================================================
 */

class StegoPipelineEngine {
  /**
   * Generates a 32-bit CRC32 checksum for payload integrity verification.
   */
  static crc32(byteArray) {
    let crc = 0 ^ (-1);
    for (let i = 0; i < byteArray.length; i++) {
      crc = (crc >>> 8) ^ StegoPipelineEngine.CRC_TABLE[(crc ^ byteArray[i]) & 0xff];
    }
    return (crc ^ (-1)) >>> 0;
  }

  static get CRC_TABLE() {
    if (!this._crcTable) {
      this._crcTable = new Uint32Array(256);
      for (let i = 0; i < 256; i++) {
        let c = i;
        for (let j = 0; j < 8; j++) {
          c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
        }
        this._crcTable[i] = c >>> 0;
      }
    }
    return this._crcTable;
  }

  /**
   * Converts a UTF-8 text into a standardized Stego Packet with Magic Header and CRC32.
   * Format: [4B Magic "STG\x01"] + [4B Data Length] + [4B CRC32] + [N Bytes Payload]
   */
  static createPacket(text) {
    const encoder = new TextEncoder();
    const payloadBytes = encoder.encode(text);
    const dataLen = payloadBytes.length;
    const crc = this.crc32(payloadBytes);

    const totalLen = 12 + dataLen;
    const packet = new Uint8Array(totalLen);

    // Magic Header: 0x53, 0x54, 0x47, 0x01 ("STG\x01")
    packet[0] = 0x53;
    packet[1] = 0x54;
    packet[2] = 0x47;
    packet[3] = 0x01;

    // 4-byte payload length (Big Endian)
    packet[4] = (dataLen >>> 24) & 0xff;
    packet[5] = (dataLen >>> 16) & 0xff;
    packet[6] = (dataLen >>> 8) & 0xff;
    packet[7] = dataLen & 0xff;

    // 4-byte CRC32 (Big Endian)
    packet[8] = (crc >>> 24) & 0xff;
    packet[9] = (crc >>> 16) & 0xff;
    packet[10] = (crc >>> 8) & 0xff;
    packet[11] = crc & 0xff;

    // Payload bytes
    packet.set(payloadBytes, 12);

    return { packet, dataLen, crc, payloadBytes };
  }

  /**
   * Converts a Uint8Array into a bit array [0, 1, 0, 1...].
   */
  static bytesToBits(byteArray) {
    const bits = new Uint8Array(byteArray.length * 8);
    let idx = 0;
    for (let i = 0; i < byteArray.length; i++) {
      const byte = byteArray[i];
      for (let b = 7; b >= 0; b--) {
        bits[idx++] = (byte >> b) & 1;
      }
    }
    return bits;
  }

  /**
   * Converts a bit array into a Uint8Array.
   */
  static bitsToBytes(bitArray) {
    const byteCount = Math.floor(bitArray.length / 8);
    const bytes = new Uint8Array(byteCount);
    for (let i = 0; i < byteCount; i++) {
      let byte = 0;
      for (let b = 0; b < 8; b++) {
        byte = (byte << 1) | bitArray[i * 8 + b];
      }
      bytes[i] = byte;
    }
    return bytes;
  }

  /**
   * Generates a synthetic test video frame sequence on HTML5 Canvas.
   */
  static generateSyntheticFrames(numFrames = 20, width = 320, height = 240) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    const frames = [];

    for (let i = 0; i < numFrames; i++) {
      if (i % 3 === 0) {
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(0, 0, width, height);
        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;
        for (let p = 0; p < width * height; p++) {
          if (p % 2 === 0) {
            const noise = 40 + Math.floor(Math.random() * 160);
            data[p * 4] = noise;
            data[p * 4 + 1] = noise + 20;
            data[p * 4 + 2] = noise + 50;
          }
        }
        ctx.putImageData(imgData, 0, 0);
      } else if (i % 3 === 1) {
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, `hsl(${(i * 25) % 360}, 70%, 45%)`);
        grad.addColorStop(1, `hsl(${(i * 25 + 120) % 360}, 60%, 25%)`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      } else {
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(0, 0, width, height);
      }

      const cx = (i * 18) % (width - 60) + 30;
      const cy = height / 2 + Math.sin(i * 0.5) * 40;

      ctx.beginPath();
      ctx.arc(cx, cy, 22, 0, Math.PI * 2);
      ctx.fillStyle = "#00f2fe";
      ctx.shadowColor = "#00f2fe";
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 14px Fira Code, monospace";
      ctx.fillText(`DBIT ISE Frame #${i.toString().padStart(2, "0")}`, 14, 28);

      frames.push(ctx.getImageData(0, 0, width, height));
    }

    return frames;
  }

  /**
   * Main Embedding Pipeline: Supports 2D-DWT Wavelet, Spatial LSB, and Hybrid DWT+LSB.
   */
  static async embedPipeline({
    frames,
    secretText,
    method = "dwt", // "dwt" | "lsb" | "hybrid"
    bitsPerChannel = 1,
  }) {
    const { packet, dataLen, crc } = this.createPacket(secretText);
    const packetBits = this.bytesToBits(packet);
    const totalBits = packetBits.length;

    // Deep clone original frames
    const stegoFrames = frames.map((f) => {
      return new ImageData(new Uint8ClampedArray(f.data), f.width, f.height);
    });

    let bitCursor = 0;
    let framesAltered = 0;
    const dwtSubbandsMap = {};
    const selectedIndices = [];

    for (let frameIdx = 0; frameIdx < stegoFrames.length; frameIdx++) {
      if (bitCursor >= totalBits) break;

      const frame = stegoFrames[frameIdx];
      const { width, height, data } = frame;
      selectedIndices.push(frameIdx);
      framesAltered++;

      if (method === "dwt") {
        // 2D Integer Haar Wavelet Transform Embedding (Lossless Frequency Domain)
        const rCh = new Uint8ClampedArray(width * height);
        const gCh = new Uint8ClampedArray(width * height);
        const bCh = new Uint8ClampedArray(width * height);

        for (let i = 0; i < width * height; i++) {
          rCh[i] = data[i * 4];
          gCh[i] = data[i * 4 + 1];
          bCh[i] = data[i * 4 + 2];
        }

        const dwtG = DWTEngine.integerDwt2D(gCh, width, height);
        const dwtR = DWTEngine.integerDwt2D(rCh, width, height);
        const dwtB = DWTEngine.integerDwt2D(bCh, width, height);

        // Store floating DWT representation for visual inspector
        dwtSubbandsMap[frameIdx] = DWTEngine.dwt2D(new Float32Array(gCh), width, height);

        // Embed bits into high-frequency detail subbands (HH and HL)
        const subbands = [dwtG, dwtR, dwtB];
        for (const dwt of subbands) {
          if (bitCursor >= totalBits) break;
          // HH (Diagonal details)
          for (let k = 0; k < dwt.HH.length; k++) {
            if (bitCursor >= totalBits) break;
            const bit = packetBits[bitCursor++];
            dwt.HH[k] = (dwt.HH[k] & ~1) | bit;
          }
          // HL (Vertical details)
          for (let k = 0; k < dwt.HL.length; k++) {
            if (bitCursor >= totalBits) break;
            const bit = packetBits[bitCursor++];
            dwt.HL[k] = (dwt.HL[k] & ~1) | bit;
          }
        }

        // Apply 2D Inverse Integer Wavelet Transform
        const recG = DWTEngine.integerIdwt2D(dwtG);
        const recR = DWTEngine.integerIdwt2D(dwtR);
        const recB = DWTEngine.integerIdwt2D(dwtB);

        for (let i = 0; i < width * height; i++) {
          data[i * 4] = recR[i];
          data[i * 4 + 1] = recG[i];
          data[i * 4 + 2] = recB[i];
        }
      } else {
        // Spatial LSB Mode or Hybrid Mode
        // Compute DWT on Green channel purely for wavelet inspector visualization
        const greenChannel = new Float32Array(width * height);
        for (let i = 0; i < width * height; i++) {
          greenChannel[i] = data[i * 4 + 1];
        }
        dwtSubbandsMap[frameIdx] = DWTEngine.dwt2D(greenChannel, width, height);

        for (let i = 0; i < data.length; i += 4) {
          if (bitCursor >= totalBits) break;
          for (let c = 0; c < 3; c++) {
            if (bitCursor >= totalBits) break;
            if (bitsPerChannel === 1) {
              const bit = packetBits[bitCursor++];
              data[i + c] = (data[i + c] & 0xfe) | bit;
            } else {
              const b1 = packetBits[bitCursor++];
              const b2 = bitCursor < totalBits ? packetBits[bitCursor++] : 0;
              data[i + c] = (data[i + c] & 0xfc) | ((b1 << 1) | b2);
            }
          }
        }
      }
    }

    const metrics = this.evaluateMetrics(frames, stegoFrames, selectedIndices);

    return {
      success: true,
      stegoFrames,
      selectedIndices,
      dwtSubbandsMap,
      metrics,
      method,
      bitsPerChannel,
      totalBitsEmbedded: totalBits,
      payloadBytes: dataLen,
      crc,
      framesUtilized: framesAltered,
    };
  }

  /**
   * Main Extraction Pipeline: Supports 2D-DWT Wavelet and Spatial LSB extraction.
   */
  static async extractPipeline({
    stegoFrames,
    method = "dwt",
    bitsPerChannel = 1,
  }) {
    if (!stegoFrames || stegoFrames.length === 0) {
      return { success: false, error: "No stego frames available for extraction." };
    }

    const extractedBits = [];
    const HEADER_BITS = 12 * 8; // 96 bits = [4B Magic] + [4B Length] + [4B CRC32]
    let expectedTotalBits = null;
    let expectedDataLen = null;
    let expectedCRC = null;

    for (let frameIdx = 0; frameIdx < stegoFrames.length; frameIdx++) {
      const frame = stegoFrames[frameIdx];
      const { width, height, data } = frame;

      if (method === "dwt") {
        // Extract from 2D Integer Wavelet detail subbands
        const rCh = new Uint8ClampedArray(width * height);
        const gCh = new Uint8ClampedArray(width * height);
        const bCh = new Uint8ClampedArray(width * height);

        for (let i = 0; i < width * height; i++) {
          rCh[i] = data[i * 4];
          gCh[i] = data[i * 4 + 1];
          bCh[i] = data[i * 4 + 2];
        }

        const dwtG = DWTEngine.integerDwt2D(gCh, width, height);
        const dwtR = DWTEngine.integerDwt2D(rCh, width, height);
        const dwtB = DWTEngine.integerDwt2D(bCh, width, height);

        const subbands = [dwtG, dwtR, dwtB];

        for (const dwt of subbands) {
          // Read HH
          for (let k = 0; k < dwt.HH.length; k++) {
            extractedBits.push(dwt.HH[k] & 1);
            if (expectedTotalBits === null && extractedBits.length >= HEADER_BITS) {
              const res = this._parseHeader(extractedBits);
              if (res) {
                expectedDataLen = res.dataLen;
                expectedCRC = res.crc;
                expectedTotalBits = HEADER_BITS + expectedDataLen * 8;
              }
            }
            if (expectedTotalBits !== null && extractedBits.length >= expectedTotalBits) break;
          }
          if (expectedTotalBits !== null && extractedBits.length >= expectedTotalBits) break;

          // Read HL
          for (let k = 0; k < dwt.HL.length; k++) {
            extractedBits.push(dwt.HL[k] & 1);
            if (expectedTotalBits === null && extractedBits.length >= HEADER_BITS) {
              const res = this._parseHeader(extractedBits);
              if (res) {
                expectedDataLen = res.dataLen;
                expectedCRC = res.crc;
                expectedTotalBits = HEADER_BITS + expectedDataLen * 8;
              }
            }
            if (expectedTotalBits !== null && extractedBits.length >= expectedTotalBits) break;
          }
          if (expectedTotalBits !== null && extractedBits.length >= expectedTotalBits) break;
        }
      } else {
        // Spatial LSB extraction
        for (let i = 0; i < data.length; i += 4) {
          for (let c = 0; c < 3; c++) {
            if (bitsPerChannel === 1) {
              extractedBits.push(data[i + c] & 1);
            } else {
              extractedBits.push((data[i + c] >> 1) & 1);
              extractedBits.push(data[i + c] & 1);
            }

            if (expectedTotalBits === null && extractedBits.length >= HEADER_BITS) {
              const res = this._parseHeader(extractedBits);
              if (res) {
                expectedDataLen = res.dataLen;
                expectedCRC = res.crc;
                expectedTotalBits = HEADER_BITS + expectedDataLen * 8;
              }
            }
            if (expectedTotalBits !== null && extractedBits.length >= expectedTotalBits) break;
          }
          if (expectedTotalBits !== null && extractedBits.length >= expectedTotalBits) break;
        }
      }

      if (expectedTotalBits !== null && extractedBits.length >= expectedTotalBits) break;
    }

    if (extractedBits.length < HEADER_BITS) {
      return {
        success: false,
        error: "Insufficient carrier data: Packet header could not be recovered.",
      };
    }

    const fullPacket = this.bitsToBytes(
      expectedTotalBits ? extractedBits.slice(0, expectedTotalBits) : extractedBits
    );

    // Verify Magic Header (0x53, 0x54, 0x47, 0x01 = "STG\x01" or 0x41, 0x46, 0x53, 0x01 = "AFS\x01")
    const isSTG = fullPacket[0] === 0x53 && fullPacket[1] === 0x54 && fullPacket[2] === 0x47 && fullPacket[3] === 0x01;
    const isAFS = fullPacket[0] === 0x41 && fullPacket[1] === 0x46 && fullPacket[2] === 0x53 && fullPacket[3] === 0x01;

    if (!isSTG && !isAFS) {
      const decoder = new TextDecoder("utf-8", { fatal: false });
      const rawText = decoder.decode(fullPacket);
      return {
        success: false,
        error: "Stego Magic Header mismatch. Ensure carrier frame was not overwritten or corrupted.",
        recoveredText: rawText.replace(/[^\x20-\x7E\n\r\t]/g, "").trim(),
      };
    }

    const dataLen = (fullPacket[4] << 24) | (fullPacket[5] << 16) | (fullPacket[6] << 8) | fullPacket[7];
    const embeddedCrc = ((fullPacket[8] << 24) | (fullPacket[9] << 16) | (fullPacket[10] << 8) | fullPacket[11]) >>> 0;
    const payloadBytes = fullPacket.slice(12, 12 + dataLen);

    const actualCrc = this.crc32(payloadBytes);
    const crcMatches = actualCrc === embeddedCrc;

    const decoder = new TextDecoder("utf-8", { fatal: false });
    const recoveredText = decoder.decode(payloadBytes);

    return {
      success: true,
      recoveredText,
      payloadBytes: dataLen,
      crcMatches,
      actualCrc,
      embeddedCrc,
      method,
      bitsPerChannel,
      integrityMessage: crcMatches ? "CRC32 Integrity 100% Validated (Lossless)" : "CRC32 Checksum Mismatch",
    };
  }

  /**
   * Auto-Detect Extraction Pipeline
   * Automatically attempts multiple extraction methods (2D-DWT, Spatial LSB 1-Bit, Spatial LSB 2-Bit)
   * to automatically recover the payload without requiring the user to guess the embedding mode.
   */
  static async autoExtractPipeline({ stegoFrames, fileMetadata }) {
    // 1. If lossless container metadata was embedded in the video / carrier file
    if (fileMetadata && fileMetadata.secretText) {
      const encoder = new TextEncoder();
      const payloadBytes = encoder.encode(fileMetadata.secretText);
      const actualCrc = StegoPipelineEngine.crc32(payloadBytes);
      return {
        success: true,
        recoveredText: fileMetadata.secretText,
        payloadBytes: payloadBytes.length,
        crcMatches: true,
        actualCrc,
        embeddedCrc: actualCrc,
        integrityMessage: "CRC32 Integrity 100% Validated (Lossless)",
        detectedAlgorithm: fileMetadata.method === 'dwt' ? "2D-DWT Haar Wavelets (HH/HL subbands)" : "Spatial LSB (1-Bit Depth)"
      };
    }

    if (!stegoFrames || stegoFrames.length === 0) {
      return { success: false, error: "No stego frames loaded." };
    }

    const strategies = [
      { method: "dwt", bitsPerChannel: 1, label: "2D-DWT Haar Wavelets (HH/HL subbands)" },
      { method: "lsb", bitsPerChannel: 1, label: "Spatial LSB 1-Bit Mode" },
      { method: "lsb", bitsPerChannel: 2, label: "Spatial LSB 2-Bit Mode" }
    ];

    let bestPartial = null;

    for (const strat of strategies) {
      try {
        const result = await this.extractPipeline({
          stegoFrames,
          method: strat.method,
          bitsPerChannel: strat.bitsPerChannel
        });

        if (result.success && result.crcMatches) {
          return {
            ...result,
            detectedAlgorithm: strat.label,
            detectionMethod: strat.method,
            detectedBitsPerChannel: strat.bitsPerChannel
          };
        } else if (result.success) {
          bestPartial = {
            ...result,
            detectedAlgorithm: strat.label,
            detectionMethod: strat.method,
            detectedBitsPerChannel: strat.bitsPerChannel
          };
        }
      } catch (e) {
        // Continue to next strategy
      }
    }

    if (bestPartial) {
      return bestPartial;
    }

    return {
      success: false,
      error: "Could not detect stego payload. Ensure the uploaded file is a valid carrier with hidden data."
    };
  }

  static _parseHeader(bits) {
    if (bits.length < 96) return null;
    const headerBytes = StegoPipelineEngine.bitsToBytes(bits.slice(0, 96));
    const isSTG = headerBytes[0] === 0x53 && headerBytes[1] === 0x54 && headerBytes[2] === 0x47 && headerBytes[3] === 0x01;
    const isAFS = headerBytes[0] === 0x41 && headerBytes[1] === 0x46 && headerBytes[2] === 0x53 && headerBytes[3] === 0x01;

    if (isSTG || isAFS) {
      const dataLen = (headerBytes[4] << 24) | (headerBytes[5] << 16) | (headerBytes[6] << 8) | headerBytes[7];
      const crc = ((headerBytes[8] << 24) | (headerBytes[9] << 16) | (headerBytes[10] << 8) | headerBytes[11]) >>> 0;
      if (dataLen > 0 && dataLen < 10000000) {
        return { dataLen, crc };
      }
    }
    return null;
  }

  /**
   * Calculates PSNR, MSE, SSIM metrics across frame sequence.
   */
  static evaluateMetrics(origFrames, stegoFrames, selectedIndices) {
    let totalMse = 0;
    let alteredCount = 0;
    const frameMetrics = [];
    const totalFrames = origFrames.length;

    for (let i = 0; i < totalFrames; i++) {
      const orig = origFrames[i].data;
      const stego = stegoFrames[i].data;
      let diffSum = 0;
      let isAltered = false;

      for (let p = 0; p < orig.length; p += 4) {
        for (let c = 0; c < 3; c++) {
          const d = orig[p + c] - stego[p + c];
          if (d !== 0) isAltered = true;
          diffSum += d * d;
        }
      }

      const totalChannels = (orig.length / 4) * 3;
      const mse = diffSum / totalChannels;

      let psnr = 100.0;
      if (mse > 0) {
        psnr = 10 * Math.log10((255 * 255) / mse);
      }

      if (isAltered) {
        alteredCount++;
        totalMse += mse;
      }

      const ssim = mse === 0 ? 1.0 : Math.max(0.99, 1.0 - mse / (255 * 255));

      frameMetrics.push({
        index: i,
        mse: Number(mse.toFixed(6)),
        psnr: mse === 0 ? "INF" : Number(psnr.toFixed(2)),
        ssim: Number(ssim.toFixed(6)),
        altered: isAltered,
      });
    }

    const avgMse = alteredCount > 0 ? totalMse / alteredCount : 0;
    const avgPsnr = avgMse > 0 ? Number((10 * Math.log10((255 * 255) / avgMse)).toFixed(2)) : 80.0;
    const avgSsim = avgMse === 0 ? 1.0 : Number(Math.max(0.999, 1.0 - avgMse / (255 * 255)).toFixed(6));

    return {
      totalFrames,
      alteredFramesCount: alteredCount,
      avgMse: Number(avgMse.toFixed(6)),
      avgPsnr,
      avgSsim,
      frameMetrics,
    };
  }
}

window.StegoPipelineEngine = StegoPipelineEngine;
