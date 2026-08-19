# Academic Project Synopsis / Proposal

## Project Title
**DIGITAL VIDEO STEGANOGRAPHY**
*Multi-Layer Secure Information Hiding using AES-256 Encryption, 2D-Discrete Wavelet Transform (DWT), Adaptive Frame Selection (AFS), and Least Significant Bit (LSB) Technique*

---

### Institutional Metadata
- **Institution**: Don Bosco Institute of Technology (DBIT), Bengaluru
- **Department**: Department of Information Science & Engineering (ISE)
- **Academic Year**: 2025–26
- **Under The Guidance Of**: **Dr. Ramya K V**, Associate Professor, Dept of ISE
- **Project Team Members**:
  1. **Abhishek C** — `1DB23IS002`
  2. **Abhishek G** — `1DB23IS003`
  3. **Harshith Gowda B S** — `1DB23IS060`
  4. **Anjaneya S H** — `1DB23IS018`

---

### 1. Abstract & Introduction
Digital Video Steganography is a specialized technique used to hide secret information inside a digital video stream without noticeably changing its visual appearance or playback quality. A video consists of a continuous sequence of image frames, providing a vastly larger medium for information concealment compared to static single images.

In this project, we develop a multi-layered, highly secure steganography system combining:
1. **AES-256 Cryptography**: Pre-encrypts the confidential payload so that even if intercepted, it remains unreadable without the secret key.
2. **Adaptive Frame Selection (AFS)**: Analyzes video frames based on spatial texture variance, Shannon entropy, and inter-frame motion dynamics to avoid unnecessary modification of every frame and reduce steganalytic detectability.
3. **2D-Discrete Wavelet Transform (DWT)**: Decomposes carrier frames into 4 frequency subbands ($LL, LH, HL, HH$) to mask hidden bits in high-frequency detail components, minimizing visual distortion and maintaining video fidelity.
4. **LSB Substitution**: Injects encrypted bits into the least significant bit planes of the chosen transform coefficients.

The authorized receiver applies the identical deterministic frame-selection and DWT transformation process to recover and decrypt the hidden payload losslessly with CRC32/SHA verification.

---

### 2. Problem Statement & Motivation
- **Data Interception Vulnerability**: Sensitive information transmitted across digital communication networks is susceptible to unauthorized interception, eavesdropping, and tampering.
- **Limitation of Standalone Encryption**: Traditional encryption transforms data into obvious ciphertext, which alerts eavesdroppers to the existence of secret communications.
- **Shortcomings of Naive LSB Steganography**: Modifying 100% of video frames indiscriminately introduces detectable statistical anomalies ($\chi^2$ attacks) and degrades overall video quality.
- **Need for Hybrid Synergy**: Combining AES-256 encryption, 2D-DWT frequency decomposition, AFS intelligent frame filtering, and LSB embedding provides dual-layer security (cryptographic + steganographic) while retaining near-perfect visual imperceptibility.

---

### 3. Literature Survey (Slides 5 & 6)

| SI No | Publication, Title & Year | Methodology | Objectives | Objectives Achieved | Objectives Not Achieved |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | Kumar et al., *Adaptive Video Steganography*, 2024 | Chaotic map + adaptive frame selection | Improve security & capacity | High security & capacity | Full attack resistance |
| **2** | Mohamed et al., *Motion Estimation Video Steganography*, 2025 | H.264 motion-vector method | Real-time secure hiding | Low distortion & overhead | Limited to H.264 |
| **3** | Zhang et al., *HEVC Video Steganography*, 2026 | HEVC CU structure method | Improve capacity & security | Better quality & anti-steganalysis | Limited codec evaluation |
| **4** | *Development of LSB Based Steganography Method for Video and Image Hiding*, 2024 | LSB-based embedding | Hide image/data in video | Simple and effective hiding | Limited robustness |
| **5** | *Large-Capacity and Flexible Video Steganography via Invertible Neural Network*, 2023 | Invertible Neural Network (INN) | Increase hiding capacity and flexibility | Multiple secret videos can be hidden | High computational complexity |
| **6** | *Deep Learning Based Coverless Video Steganography for Secret Audio*, 2025 | Deep learning + coverless steganography | Hide secret audio in video securely | Improved security and hiding capability | Further real-world robustness needed |

---

### 4. System Objectives
1. **Secure Data Hiding**: Hide secret information inside video frames without being easily detected by human perception or statistical steganalysis.
2. **Data Protection (Defense-in-Depth)**: Encrypt secret payload using AES-256 before embedding to prevent unauthorized access.
3. **Preserve Video Quality**: Maintain high video fidelity with $\text{PSNR} > 70\text{ dB}$ and $\text{SSIM} > 0.999$.
4. **Selective Frame Modification**: Confine modifications to a subset of carrier frames (e.g. 4%–35%), keeping 65%–96% of video frames untouched.
5. **Lossless Data Extraction**: Enable authorized receivers to safely recover and decrypt the hidden message with 100% integrity validation.

---

### 5. Architectural Modules & Methodology

```
+-----------------------------------------------------------------------------------------+
|                                 SENDER (EMBEDDING PIPELINE)                             |
+-----------------------------------------------------------------------------------------+
|                                                                                         |
|  [Cover Video] ----> [1. Frame Extraction] ----> [2. AFS Frame Selection]               |
|                                                               |                         |
|                                                               v                         |
|  [Secret Data] ---> [AES-256 Encryption] ----> [3. 2D-DWT Transformation (LL/LH/HL/HH)] |
|                                                               |                         |
|                                                               v                         |
|                                                [4. LSB Embedding on DWT]                |
|                                                               |                         |
|                                                               v                         |
|                                                [5. Stego Video Reconstruction]          |
+-----------------------------------------------------------------------------------------+
                                                |
                                                v
+-----------------------------------------------------------------------------------------+
|                                RECEIVER (EXTRACTION PIPELINE)                           |
+-----------------------------------------------------------------------------------------+
|                                                                                         |
|  [Stego Video] ----> [1. Frame Extraction] ----> [2. Deterministic AFS Selection]       |
|                                                               |                         |
|                                                               v                         |
|                                                [3. 2D-DWT Transformation]               |
|                                                               |                         |
|                                                               v                         |
|                                                [4. LSB Data Extraction]                 |
|                                                               |                         |
|                                                               v                         |
|                                                [5. AES-256 Decryption + CRC]            |
|                                                               |                         |
|                                                               v                         |
|                                                [Recovered Secret Data (Lossless)]       |
+-----------------------------------------------------------------------------------------+
```

---

### 6. Mathematical Formulations

1. **AES-256 Encryption**:
   $$C = \text{AES-GCM}_{K}(\text{Plaintext}, \text{IV})$$
2. **2D Discrete Wavelet Transform (Haar Wavelet)**:
   $$LL(x, y) = \frac{1}{2}\left(I(2x, 2y) + I(2x+1, 2y) + I(2x, 2y+1) + I(2x+1, 2y+1)\right)$$
   $$HH(x, y) = \frac{1}{2}\left(I(2x, 2y) - I(2x+1, 2y) - I(2x, 2y+1) + I(2x+1, 2y+1)\right)$$
3. **Adaptive Frame Selection Composite Score**:
   $$S(F_t) = w_1 \cdot \text{Var}\left(\nabla^2 F_t\right) + w_2 \cdot H(F_t) + w_3 \cdot \Delta M_t$$
4. **Peak Signal-to-Noise Ratio (PSNR)**:
   $$\text{PSNR} = 10 \cdot \log_{10}\left(\frac{255^2}{\text{MSE}}\right)\text{ dB}$$

---

### 7. Work to be Done & Roadmap (Slide 15)
- [x] Develop the video steganography core engine for hiding secret data inside video sequences.
- [x] Implement AES-256 pre-encryption before data embedding.
- [x] Implement 2D-DWT wavelet decomposition ($LL, LH, HL, HH$) on carrier frames.
- [x] Implement Adaptive Frame Selection (AFS) scoring and selective frame modification.
- [x] Build interactive web application for live demonstration, frame inspection, and diagrams.
- [x] Configure zero-config Vercel hosting setup (`vercel.json`).
- [ ] Conduct extended codec testing across lossy H.264 and HEVC video containers.
- [ ] Complete final performance analysis, benchmark documentation, and university project report.
