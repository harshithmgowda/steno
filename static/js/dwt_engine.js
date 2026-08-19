/**
 * ==============================================================================
 * 2D DISCRETE WAVELET TRANSFORM (DWT) & IDWT ENGINE (Haar Wavelet)
 * Department of ISE, DBIT - Digital Video Steganography
 * ==============================================================================
 */

class DWTEngine {
  /**
   * Performs 1D Haar Wavelet Transform on a 1D array.
   */
  static dwt1D(arr) {
    const n = arr.length;
    const half = Math.floor(n / 2);
    const low = new Float32Array(half);
    const high = new Float32Array(half);
    const SQRT2 = Math.SQRT2;

    for (let i = 0; i < half; i++) {
      const a = arr[2 * i];
      const b = arr[2 * i + 1];
      low[i] = (a + b) / SQRT2;
      high[i] = (a - b) / SQRT2;
    }
    return { low, high };
  }

  /**
   * Performs 1D Inverse Haar Wavelet Transform.
   */
  static idwt1D(low, high) {
    const half = low.length;
    const out = new Float32Array(half * 2);
    const SQRT2 = Math.SQRT2;

    for (let i = 0; i < half; i++) {
      out[2 * i] = (low[i] + high[i]) / SQRT2;
      out[2 * i + 1] = (low[i] - high[i]) / SQRT2;
    }
    return out;
  }

  /**
   * Performs 2D Haar DWT on a single 2D channel matrix (width x height).
   * Decomposes into 4 subbands: LL, LH, HL, HH.
   */
  static dwt2D(matrix, width, height) {
    const halfW = Math.floor(width / 2);
    const halfH = Math.floor(height / 2);

    const LL = new Float32Array(halfW * halfH);
    const LH = new Float32Array(halfW * halfH);
    const HL = new Float32Array(halfW * halfH);
    const HH = new Float32Array(halfW * halfH);

    // Step 1: Row-wise 1D DWT
    const rowL = new Float32Array(halfW * height);
    const rowH = new Float32Array(halfW * height);

    for (let y = 0; y < height; y++) {
      const row = matrix.subarray(y * width, (y + 1) * width);
      const { low, high } = this.dwt1D(row);
      rowL.set(low, y * halfW);
      rowH.set(high, y * halfW);
    }

    // Step 2: Column-wise 1D DWT on rowL and rowH
    const colBuf = new Float32Array(height);

    // Columns of rowL -> LL and LH
    for (let x = 0; x < halfW; x++) {
      for (let y = 0; y < height; y++) colBuf[y] = rowL[y * halfW + x];
      const { low, high } = this.dwt1D(colBuf);
      for (let y = 0; y < halfH; y++) {
        LL[y * halfW + x] = low[y];
        LH[y * halfW + x] = high[y];
      }
    }

    // Columns of rowH -> HL and HH
    for (let x = 0; x < halfW; x++) {
      for (let y = 0; y < height; y++) colBuf[y] = rowH[y * halfW + x];
      const { low, high } = this.dwt1D(colBuf);
      for (let y = 0; y < halfH; y++) {
        HL[y * halfW + x] = low[y];
        HH[y * halfW + x] = high[y];
      }
    }

    return { LL, LH, HL, HH, width, height, halfW, halfH };
  }

  /**
   * Performs 2D Inverse Haar DWT to reconstruct the channel matrix.
   */
  static idwt2D(dwtObj) {
    const { LL, LH, HL, HH, width, height, halfW, halfH } = dwtObj;
    const rowL = new Float32Array(halfW * height);
    const rowH = new Float32Array(halfW * height);

    const lowCol = new Float32Array(halfH);
    const highCol = new Float32Array(halfH);

    // Step 1: Reconstruct rowL columns from LL and LH
    for (let x = 0; x < halfW; x++) {
      for (let y = 0; y < halfH; y++) {
        lowCol[y] = LL[y * halfW + x];
        highCol[y] = LH[y * halfW + x];
      }
      const col = this.idwt1D(lowCol, highCol);
      for (let y = 0; y < height; y++) rowL[y * halfW + x] = col[y];
    }

    // Step 2: Reconstruct rowH columns from HL and HH
    for (let x = 0; x < halfW; x++) {
      for (let y = 0; y < halfH; y++) {
        lowCol[y] = HL[y * halfW + x];
        highCol[y] = HH[y * halfW + x];
      }
      const col = this.idwt1D(lowCol, highCol);
      for (let y = 0; y < height; y++) rowH[y * halfW + x] = col[y];
    }

    // Step 3: Reconstruct rows from rowL and rowH
    const out = new Float32Array(width * height);
    const rowLBuf = new Float32Array(halfW);
    const rowHBuf = new Float32Array(halfW);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < halfW; x++) {
        rowLBuf[x] = rowL[y * halfW + x];
        rowHBuf[x] = rowH[y * halfW + x];
      }
      const row = this.idwt1D(rowLBuf, rowHBuf);
      out.set(row, y * width);
    }

    return out;
  }

  /**
   * Renders the 4-Quadrant DWT Representation (LL, HL, LH, HH) onto a Canvas element.
   */
  static renderDWTToCanvas(dwtObj, canvas) {
    const { LL, LH, HL, HH, halfW, halfH } = dwtObj;
    canvas.width = halfW * 2;
    canvas.height = halfH * 2;
    const ctx = canvas.getContext("2d");
    const imgData = ctx.createImageData(canvas.width, canvas.height);
    const data = imgData.data;

    const norm = (val, isLow) => {
      if (isLow) return Math.min(255, Math.max(0, val / Math.SQRT2));
      return Math.min(255, Math.max(0, (val + 128))); // detail bands centered around 128
    };

    // Quadrant 1 (Top-Left: LL)
    for (let y = 0; y < halfH; y++) {
      for (let x = 0; x < halfW; x++) {
        const val = norm(LL[y * halfW + x], true);
        const idx = (y * canvas.width + x) * 4;
        data[idx] = val;
        data[idx + 1] = val;
        data[idx + 2] = val;
        data[idx + 3] = 255;
      }
    }

    // Quadrant 2 (Top-Right: HL - Vertical Details)
    for (let y = 0; y < halfH; y++) {
      for (let x = 0; x < halfW; x++) {
        const val = norm(HL[y * halfW + x], false);
        const idx = (y * canvas.width + (x + halfW)) * 4;
        data[idx] = val * 0.9;
        data[idx + 1] = val * 0.9;
        data[idx + 2] = val * 1.1; // bluish tint for vertical detail
        data[idx + 3] = 255;
      }
    }

    // Quadrant 3 (Bottom-Left: LH - Horizontal Details)
    for (let y = 0; y < halfH; y++) {
      for (let x = 0; x < halfW; x++) {
        const val = norm(LH[y * halfW + x], false);
        const idx = ((y + halfH) * canvas.width + x) * 4;
        data[idx] = val * 0.9;
        data[idx + 1] = val * 1.1; // greenish tint for horizontal detail
        data[idx + 2] = val * 0.9;
        data[idx + 3] = 255;
      }
    }

    // Quadrant 4 (Bottom-Right: HH - Diagonal Details)
    for (let y = 0; y < halfH; y++) {
      for (let x = 0; x < halfW; x++) {
        const val = norm(HH[y * halfW + x], false);
        const idx = ((y + halfH) * canvas.width + (x + halfW)) * 4;
        data[idx] = val * 1.1; // magenta tint for diagonal detail
        data[idx + 1] = val * 0.9;
        data[idx + 2] = val * 1.1;
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);

    // Draw grid divider lines & labels
    ctx.strokeStyle = "rgba(0, 242, 254, 0.6)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(halfW, 0);
    ctx.lineTo(halfW, canvas.height);
    ctx.moveTo(0, halfH);
    ctx.lineTo(canvas.width, halfH);
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 11px Fira Code, monospace";
    ctx.fillText("LL (Approx)", 6, 16);
    ctx.fillText("HL (Vertical)", halfW + 6, 16);
    ctx.fillText("LH (Horizontal)", 6, halfH + 16);
    ctx.fillText("HH (Diagonal)", halfW + 6, halfH + 16);
  }
}

window.DWTEngine = DWTEngine;
