/**
 * ==============================================================================
 * 2D DISCRETE WAVELET TRANSFORM (DWT) & IDWT ENGINE (Haar Wavelet)
 * Includes both:
 * 1. Integer Wavelet Transform (IWT / Haar Lifting Scheme) for lossless stego data embedding
 * 2. Multi-resolution Floating Haar DWT for high-precision subband visualization
 * Department of ISE, DBIT - Digital Video Steganography
 * ==============================================================================
 */

class DWTEngine {
  /**
   * Forward 2D Integer Haar Wavelet Transform (IWT / Lifting Scheme)
   * Converts 2D integer matrix (width x height) into 4 integer subbands: LL, LH, HL, HH.
   * Completely lossless and exact integer-to-integer mapping.
   */
  static integerDwt2D(matrix, width, height) {
    const halfW = Math.floor(width / 2);
    const halfH = Math.floor(height / 2);

    const LL = new Int16Array(halfW * halfH);
    const LH = new Int16Array(halfW * halfH);
    const HL = new Int16Array(halfW * halfH);
    const HH = new Int16Array(halfW * halfH);

    const rowL = new Int16Array(halfW * height);
    const rowH = new Int16Array(halfW * height);

    // Step 1: Row-wise 1D Integer Haar
    for (let y = 0; y < height; y++) {
      const rowOffset = y * width;
      const outOffset = y * halfW;
      for (let x = 0; x < halfW; x++) {
        const a = matrix[rowOffset + 2 * x];
        const b = matrix[rowOffset + 2 * x + 1];
        rowL[outOffset + x] = (a + b) >> 1;
        rowH[outOffset + x] = a - b;
      }
    }

    // Step 2: Column-wise 1D Integer Haar
    for (let x = 0; x < halfW; x++) {
      for (let y = 0; y < halfH; y++) {
        const aL = rowL[2 * y * halfW + x];
        const bL = rowL[(2 * y + 1) * halfW + x];
        LL[y * halfW + x] = (aL + bL) >> 1;
        LH[y * halfW + x] = aL - bL;

        const aH = rowH[2 * y * halfW + x];
        const bH = rowH[(2 * y + 1) * halfW + x];
        HL[y * halfW + x] = (aH + bH) >> 1;
        HH[y * halfW + x] = aH - bH;
      }
    }

    return { LL, LH, HL, HH, width, height, halfW, halfH };
  }

  /**
   * Inverse 2D Integer Haar Wavelet Transform (Inverse IWT)
   * Mathematically reconstructs spatial pixel matrix losslessly from integer subbands.
   */
  static integerIdwt2D(dwtObj) {
    const { LL, LH, HL, HH, width, height, halfW, halfH } = dwtObj;
    const rowL = new Int16Array(halfW * height);
    const rowH = new Int16Array(halfW * height);
    const out = new Uint8ClampedArray(width * height);

    // Step 1: Column-wise Inverse
    for (let x = 0; x < halfW; x++) {
      for (let y = 0; y < halfH; y++) {
        const ll = LL[y * halfW + x];
        const lh = LH[y * halfW + x];
        const hl = HL[y * halfW + x];
        const hh = HH[y * halfW + x];

        const aL = ll + ((lh + 1) >> 1);
        const bL = aL - lh;
        rowL[2 * y * halfW + x] = aL;
        rowL[(2 * y + 1) * halfW + x] = bL;

        const aH = hl + ((hh + 1) >> 1);
        const bH = aH - hh;
        rowH[2 * y * halfW + x] = aH;
        rowH[(2 * y + 1) * halfW + x] = bH;
      }
    }

    // Step 2: Row-wise Inverse
    for (let y = 0; y < height; y++) {
      const rowOffset = y * width;
      const inOffset = y * halfW;
      for (let x = 0; x < halfW; x++) {
        const l = rowL[inOffset + x];
        const h = rowH[inOffset + x];

        const a = l + ((h + 1) >> 1);
        const b = a - h;
        out[rowOffset + 2 * x] = a < 0 ? 0 : (a > 255 ? 255 : a);
        out[rowOffset + 2 * x + 1] = b < 0 ? 0 : (b > 255 ? 255 : b);
      }
    }

    return out;
  }

  /**
   * Floating-point 2D Haar DWT (for visual inspection and subband energy display)
   */
  static dwt2D(matrix, width, height) {
    const halfW = Math.floor(width / 2);
    const halfH = Math.floor(height / 2);

    const LL = new Float32Array(halfW * halfH);
    const LH = new Float32Array(halfW * halfH);
    const HL = new Float32Array(halfW * halfH);
    const HH = new Float32Array(halfW * halfH);

    const rowL = new Float32Array(halfW * height);
    const rowH = new Float32Array(halfW * height);
    const SQRT2 = Math.SQRT2;

    for (let y = 0; y < height; y++) {
      const rowOffset = y * width;
      const outOffset = y * halfW;
      for (let x = 0; x < halfW; x++) {
        const a = matrix[rowOffset + 2 * x];
        const b = matrix[rowOffset + 2 * x + 1];
        rowL[outOffset + x] = (a + b) / SQRT2;
        rowH[outOffset + x] = (a - b) / SQRT2;
      }
    }

    for (let x = 0; x < halfW; x++) {
      for (let y = 0; y < halfH; y++) {
        const aL = rowL[2 * y * halfW + x];
        const bL = rowL[(2 * y + 1) * halfW + x];
        LL[y * halfW + x] = (aL + bL) / SQRT2;
        LH[y * halfW + x] = (aL - bL) / SQRT2;

        const aH = rowH[2 * y * halfW + x];
        const bH = rowH[(2 * y + 1) * halfW + x];
        HL[y * halfW + x] = (aH + bH) / SQRT2;
        HH[y * halfW + x] = (aH - bH) / SQRT2;
      }
    }

    return { LL, LH, HL, HH, width, height, halfW, halfH };
  }

  /**
   * Renders the 4-Quadrant DWT Representation (LL, HL, LH, HH) onto a Canvas element.
   */
  static renderDWTToCanvas(dwtObj, canvas) {
    if (!dwtObj || !canvas) return;

    const { LL, LH, HL, HH, width, height, halfW, halfH } = dwtObj;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    // Helper: Find max absolute value for normalization
    const getNorm = (arr) => {
      let max = 1;
      for (let i = 0; i < arr.length; i++) {
        const abs = Math.abs(arr[i]);
        if (abs > max) max = abs;
      }
      return max;
    };

    const normLL = getNorm(LL);
    const normLH = getNorm(LH);
    const normHL = getNorm(HL);
    const normHH = getNorm(HH);

    for (let y = 0; y < halfH; y++) {
      for (let x = 0; x < halfW; x++) {
        const subIdx = y * halfW + x;

        // Top-Left: LL (Approximation)
        const vLL = Math.min(255, Math.max(0, (LL[subIdx] / normLL) * 255));
        const idxLL = (y * width + x) * 4;
        data[idxLL] = vLL;
        data[idxLL + 1] = vLL;
        data[idxLL + 2] = vLL;
        data[idxLL + 3] = 255;

        // Top-Right: HL (Vertical Detail)
        const vHL = Math.min(255, Math.max(0, (Math.abs(HL[subIdx]) / normHL) * 255 * 2.0));
        const idxHL = (y * width + (halfW + x)) * 4;
        data[idxHL] = vHL * 0.2;
        data[idxHL + 1] = vHL * 0.8;
        data[idxHL + 2] = vHL;
        data[idxHL + 3] = 255;

        // Bottom-Left: LH (Horizontal Detail)
        const vLH = Math.min(255, Math.max(0, (Math.abs(LH[subIdx]) / normLH) * 255 * 2.0));
        const idxLH = ((halfH + y) * width + x) * 4;
        data[idxLH] = vLH * 0.8;
        data[idxLH + 1] = vLH * 0.3;
        data[idxLH + 2] = vLH;
        data[idxLH + 3] = 255;

        // Bottom-Right: HH (Diagonal Detail)
        const vHH = Math.min(255, Math.max(0, (Math.abs(HH[subIdx]) / normHH) * 255 * 3.0));
        const idxHH = ((halfH + y) * width + (halfW + x)) * 4;
        data[idxHH] = vHH;
        data[idxHH + 1] = vHH * 0.3;
        data[idxHH + 2] = vHH * 0.5;
        data[idxHH + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);

    // Draw quadrant dividing grid lines
    ctx.strokeStyle = 'rgba(0, 242, 254, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(halfW, 0);
    ctx.lineTo(halfW, height);
    ctx.moveTo(0, halfH);
    ctx.lineTo(width, halfH);
    ctx.stroke();

    // Draw Subband Overlay Labels
    ctx.font = 'bold 12px Fira Code, monospace';
    ctx.fillStyle = '#00f2fe';
    ctx.fillText('LL (Approx)', 8, 18);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('HL (Vertical)', halfW + 8, 18);
    ctx.fillStyle = '#a855f7';
    ctx.fillText('LH (Horizontal)', 8, halfH + 18);
    ctx.fillStyle = '#f43f5e';
    ctx.fillText('HH (Diagonal)', halfW + 8, halfH + 18);
  }
}

window.DWTEngine = DWTEngine;
