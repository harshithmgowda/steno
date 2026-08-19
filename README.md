# 🛡️ Digital Video Steganography (LSB + Adaptive Frame Selection)

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
Digital video steganography is a technique used to hide secret information inside a video without noticeably changing its visual appearance. A video consists of a sequence of frames, which provides a larger medium for hiding information compared with a single image.

In this project, we propose an **LSB + Adaptive Frame Selection (AFS)** approach:
1. **Extract Video Frames**: Deconstructs the video into individual sequential frames.
2. **Adaptive Frame Selection (AFS)**: Analyzes the inter-frame difference score between the current and previous frames to classify and select high-difference candidate frames ($\text{Selected Frames} = \{4, 5, 7, 12, 17, \dots\}$).
3. **LSB Data Embedding**: Modifies the least significant bits of pixel RGB values in the selected frames ($10110110_2 \rightarrow 10110111_2$).
4. **Lossless Recovery**: Reconstructs the exact message by analyzing identical frame difference metrics on the receiver side.

---

## 📊 AFS Frame Classification Table

| Frame | Difference Score | Classification | Steganographic Action |
| :---: | :---: | :---: | :--- |
| **Frame 1** | — | Reference Frame | ❌ Skipped |
| **Frame 2** | 8 | Low Difference | ❌ **Don't Select** (Clean Frame) |
| **Frame 3** | 12 | Low Difference | ❌ **Don't Select** (Clean Frame) |
| **Frame 4** | 67 | High Difference | ✅ **Select** (Carrier Frame) |
| **Frame 5** | 74 | High Difference | ✅ **Select** (Carrier Frame) |
| **Frame 6** | 10 | Low Difference | ❌ **Don't Select** (Clean Frame) |
| **Frame 7** | 81 | High Difference | ✅ **Select** (Carrier Frame) |

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
   git commit -m "Digital Video Steganography - DBIT ISE Project"
   git push
   ```
2. Import repository on [vercel.com](https://vercel.com).
3. Click **Deploy**.

---

## 💻 How to Run Locally

### Option 1: Direct Browser
Double-click **`index.html`** or open it directly in Google Chrome / Microsoft Edge.

### Option 2: Run via Python Local Web Server
```bash
python app.py
```
Open `http://127.0.0.1:5000` in your browser.

---

## 📊 Key Performance Metrics
- **Average PSNR (Carrier Frames)**: **$> 74.0\text{ dB}$** (Imperceptible to Human Visual System)
- **Structural Similarity (SSIM)**: **$0.999999$**
- **Clean Frames Retained**: **$70\%\text{--}90\%$** of cover video intact
- **Payload Integrity**: **$100\%$ Lossless Recovery**
