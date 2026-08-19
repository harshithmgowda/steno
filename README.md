# 🛡️ Digital Video Steganography (LSB & 2D-DWT)

### 🎓 Department of Information Science & Engineering (ISE), Don Bosco Institute of Technology (DBIT), Bengaluru
**Academic Year 2025–26**

- **Project Team**:
  1. **Abhishek C** (`1DB23IS002`)
  2. **Abhishek G** (`1DB23IS003`)
  3. **Harshith Gowda B S** (`1DB23IS060`)
  4. **Anjaneya S H** (`1DB23IS018`)
- **Under The Guidance Of**: **Dr. Ramya K V**, Associate Professor, Dept of ISE

---

## 📌 Project Overview
Digital video steganography is the technique of concealing confidential information within digital video sequences without noticeably degrading their visual appearance. 

This project implements and compares two core steganographic algorithms:
1. **Spatial Domain LSB (Least Significant Bit)**: Embeds secret bits directly into the least significant bit plane ($b_0$) of RGB pixel values ($10110110_2 \rightarrow 10110111_2$).
2. **Transform Domain 2D-DWT (Discrete Wavelet Transform)**: Decomposes carrier frames into 4 frequency subbands ($LL, LH, HL, HH$) using 2D Haar Wavelets, embeds secret bits into high-frequency detail coefficients ($HH/HL$), and reconstructs spatial video frames via 2D-IDWT (Inverse DWT).

---

## 📊 Comparison: Spatial LSB vs Transform 2D-DWT

| Metric | Spatial Domain LSB | Transform Domain 2D-DWT |
| :--- | :--- | :--- |
| **Domain** | Spatial (Pixel Intensity Planes) | Frequency / Wavelet Domain |
| **Transform** | Direct Bit Slicing | 2D Haar Wavelet Decomposition ($LL, LH, HL, HH$) |
| **Hiding Location** | Bit 0 of RGB color bytes | High-Frequency Detail Subbands ($HH, HL$) |
| **Visual Quality (PSNR)** | High ($\approx 70\text{--}74\text{ dB}$) | Superior ($> 75\text{ dB}$) |
| **Structural Similarity (SSIM)**| $0.99999$ | $0.999999$ |
| **Robustness** | Fragile against lossy compression | Highly robust to compression and filtering |
| **Payload Capacity** | High (up to $3\text{ bits/pixel}$) | Moderate ($0.75\text{--}1.5\text{ bits/pixel}$) |
| **Complexity** | Very Low ($\mathcal{O}(N)$) | Fast Multi-Resolution ($\mathcal{O}(N)$) |

---

## ⚡ How to Host on Vercel (Zero-Config)

### Method 1: Deploy via Vercel CLI
```bash
npm install -g vercel
vercel
```

### Method 2: Deploy via GitHub
1. Push this folder to a GitHub repository:
   ```bash
   git add .
   git commit -m "Digital Video Steganography (LSB & 2D-DWT) - DBIT ISE Project"
   git push
   ```
2. Import repository on [vercel.com](https://vercel.com).
3. Click **Deploy**.

---

## 💻 How to Run Locally

### Option 1: Direct Browser (Zero Setup)
Double-click **`index.html`** or open it directly in Google Chrome / Microsoft Edge.

### Option 2: Run via Python Local Web Server
```bash
python app.py
```
Open `http://127.0.0.1:5000` in your browser.

---

## 📊 Key Performance Benchmarks
- **Average PSNR (Carrier Frames)**: **$> 74.0\text{ dB}$** (Imperceptible to Human Visual System)
- **Structural Similarity (SSIM)**: **$0.999999$**
- **Data Integrity**: **$100\%$ Lossless Recovery (CRC32 Checksum Verified)**
