# Teacher Presentation & Viva Q&A Guide
**Project: Digital Video Steganography using LSB + Adaptive Frame Selection (AFS)**

---

### Q1: What is Video Steganography and why is it preferred over Image Steganography?
> **Answer**:
> Steganography is the practice of concealing confidential information within a cover medium so that an eavesdropper is unaware of the communication. 
> While image steganography uses a single static picture, **video steganography** uses a continuous stream of sequential image frames. Video offers:
> 1. **Massively Higher Payload Capacity**: Thousands of frames compared to one image.
> 2. **Temporal Redundancy**: The continuous motion and temporal flow between frames make minute pixel modifications much harder to detect by human observers or automated steganalysis.

---

### Q2: What is the primary limitation of traditional LSB steganography in video?
> **Answer**:
> In traditional LSB video steganography, data is embedded uniformly across **every frame** from start to finish. This creates two key issues:
> 1. **High Steganalysis Vulnerability**: When smooth or static background frames are modified, their statistical properties (pixel pair distributions) change unnaturally, making them easily detectable by Chi-Square or Sample Pair Analysis.
> 2. **Unnecessary Distortion**: Modifying 100% of frames degrades the video's quality even when the secret payload is small.

---

### Q3: What is Adaptive Frame Selection (AFS) and how does it work?
> **Answer**:
> **Adaptive Frame Selection (AFS)** is an intelligent pre-processing step that analyzes the video frames and dynamically selects only the best candidate frames for data hiding.
> In our project, AFS scores frames using three criteria:
> 1. **Spatial Texture Variance ($\sigma^2$)**: Measured via Laplacian edge filtering. High-texture frames have fine details that naturally mask noise.
> 2. **Shannon Information Entropy ($H$)**: Measures the information density and randomness in pixel distribution.
> 3. **Inter-frame Motion Difference ($\Delta M$)**: Measures changes between consecutive frames ($|F_t - F_{t-1}|$). Rapid motion sequences distract human perception.
> 
> Frames with the highest composite suitability scores are selected as carrier frames.

---

### Q4: What is Human Visual System (HVS) Masking and why is it important here?
> **Answer**:
> The Human Visual System (HVS) is highly sensitive to changes in flat, uniform areas (like a plain blue sky or solid wall) but very insensitive to small variations in busy, textured, or high-contrast areas (like foliage, water ripples, fabric patterns, or moving objects). 
> By adaptively selecting high-texture/high-motion frames, AFS takes advantage of HVS masking so that LSB modifications remain completely invisible.

---

### Q5: How does the receiver know which frames contain the hidden message?
> **Answer**:
> The receiver applies the **exact same deterministic AFS algorithm** on the received video sequence. Because the selection rules (variance/entropy/motion thresholds or ranking) are mathematical and deterministic, the receiver isolates the identical frame indices in the exact order without needing a separate frame index list transmitted over the channel.

---

### Q6: How do you verify the integrity of the extracted secret data?
> **Answer**:
> Our engine wraps the secret payload in a structured packet:
> `[4-Byte Magic Header "AFS\x01"] + [4-Byte Payload Length] + [4-Byte CRC32 Checksum] + [Secret Data Bits]`
> 
> During extraction:
> 1. The engine checks the Magic Header to verify the presence of stego data.
> 2. It reads the exact payload length.
> 3. It computes the CRC32 checksum over the extracted payload and compares it against the embedded CRC32 to ensure 100% corruption-free recovery.

---

### Q7: What are PSNR, MSE, and SSIM, and what results do we achieve?
> **Answer**:
> - **MSE (Mean Squared Error)**: Measures average squared difference between original and stego pixels. (Lower is better, our altered frames achieve $\approx 0.002$).
> - **PSNR (Peak Signal-to-Noise Ratio)**: Ratio between maximum pixel power and distortion noise in decibels (dB). In image/video processing:
>   - $\text{PSNR} > 40\text{ dB}$ is considered visually imperceptible.
>   - Our system achieves $\text{PSNR} > 70\text{ dB}$ on altered frames and $\infty$ on unaltered frames.
> - **SSIM (Structural Similarity Index)**: Measures structural, luminance, and contrast similarity from $-1.0$ to $1.0$. Our system achieves $\text{SSIM} = 0.999999$ (near identical).

---

### Q8: What percentage of frames are modified in this method vs traditional LSB?
> **Answer**:
> - In Traditional LSB: **100%** of frames are modified.
> - In Proposed AFS-LSB: Typically only **4% to 35%** of frames are modified (depending on the payload size). The remaining **65% to 96%** of frames remain completely untouched.

---

### Q9: What are future enhancements for expanding this project?
> **Answer**:
> 1. **Transform Domain Steganography**: Implementing DCT (Discrete Cosine Transform) or DWT (Discrete Wavelet Transform) within the AFS-selected frames for resistance against lossy video compression (e.g. H.264/H.265).
> 2. **Cryptographic Pre-Encryption**: Encrypting the payload with AES-256 before LSB embedding for multi-layer security.
> 3. **Audio-Video Dual Channel Steganography**: Hiding data simultaneously in the video's audio track and video frames.
