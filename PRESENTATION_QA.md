# Teacher Presentation & Viva Q&A Guide
**Project: Digital Video Steganography using LSB and 2D-DWT**
*Department of Information Science & Engineering (ISE), Don Bosco Institute of Technology (DBIT)*

---

### Q1: What is Video Steganography and why is it preferred over Image Steganography?
> **Answer**:
> Steganography is the science of concealing secret information within an innocent-looking cover medium such that the very existence of the secret communication is hidden from unauthorized observers.
> 
> While image steganography embeds data within a single static image, **video steganography** embeds data within a temporal sequence of continuous video frames. Video steganography is preferred because:
> 1. **Massive Payload Capacity**: A 10-second video at 24 FPS contains 240 frames, providing hundreds of times more embedding capacity than a single static picture.
> 2. **Temporal Dynamics**: High frame rate motion and continuous frame transitions naturally disguise minute bit modifications from human perception.

---

### Q2: What are the two primary domains used in Video Steganography?
> **Answer**:
> 1. **Spatial Domain (e.g., LSB - Least Significant Bit)**: Secret data is inserted directly into the spatial pixel intensity values. It offers high embedding capacity and fast computation with minimal visual degradation.
> 2. **Transform / Frequency Domain (e.g., 2D-DWT - Discrete Wavelet Transform)**: Carrier frames are transformed into frequency subbands ($LL, LH, HL, HH$), and secret bits are embedded into transform coefficients. This provides superior imperceptibility, natural edge-masking, and enhanced robustness against compression.

---

### Q3: How does Spatial Domain LSB (Least Significant Bit) Steganography work?
> **Answer**:
> In 8-bit digital imaging, each pixel color channel (Red, Green, Blue) has a value between $0$ and $255$ represented by 8 binary bits:
> $$\text{Byte} = [b_7, b_6, b_5, b_4, b_3, b_2, b_1, b_0]$$
> - **$b_7$ is the Most Significant Bit (MSB)**, contributing $128$ to the pixel's luminance.
> - **$b_0$ is the Least Significant Bit (LSB)**, contributing only $1$ to the pixel's luminance.
> 
> In LSB steganography, the secret data bit replaces $b_0$. Modifying the LSB changes the color intensity by at most $\pm 1$, which is completely undetectable to the Human Visual System (HVS).

---

### Q4: What is 2D Discrete Wavelet Transform (2D-DWT) and how does it decompose video frames?
> **Answer**:
> The 2D-DWT decomposes a 2D image matrix into four frequency subbands at half the original spatial dimensions using low-pass ($L$) and high-pass ($H$) filters:
> 1. **$LL$ (Approximation Subband)**: Low-frequency horizontal and vertical components. Contains almost all structural information and visual energy.
> 2. **$LH$ (Horizontal Detail Subband)**: Low horizontal, high vertical frequency. Highlights horizontal edge transitions.
> 3. **$HL$ (Vertical Detail Subband)**: High horizontal, low vertical frequency. Highlights vertical edge transitions.
> 4. **$HH$ (Diagonal Detail Subband)**: High-frequency horizontal and vertical components. Captures fine textures, diagonal edges, and fine details.

---

### Q5: Why do we embed secret data in high-frequency detail subbands ($HH, HL, LH$) instead of $LL$?
> **Answer**:
> - The **$LL$ subband** holds the vast majority of visual energy and fundamental image structure. Any modification to $LL$ coefficients causes noticeable blurring, color shifting, or visual artifacts in the reconstructed frame.
> - The **$HH$, $HL$, and $LH$ subbands** represent high-frequency textures, corners, and edges. The Human Visual System (HVS) has low contrast sensitivity to high-frequency noise in complex texture regions. Thus, embedding secret data in $HH$ and $HL$ coefficients ensures superior visual imperceptibility ($\text{PSNR} > 75\text{ dB}$).

---

### Q6: How does 2D Inverse DWT (2D-IDWT) reconstruct the stego video frame?
> **Answer**:
> After secret data bits are embedded into the high-frequency wavelet coefficients ($HH/HL$), the four subbands ($LL, LH, HL_{\text{stego}}, HH_{\text{stego}}$) are passed to the 2D Inverse Discrete Wavelet Transform (2D-IDWT) synthesis filter. 
> 
> The IDWT performs column-wise and row-wise upsampling and synthesis to mathematically reconstruct the spatial domain RGB pixel matrix losslessly.

---

### Q7: What is the difference between LSB and 2D-DWT steganography?
> **Answer**:
> 
> | Comparison Metric | Spatial LSB | Transform 2D-DWT |
> | :--- | :--- | :--- |
> | **Domain** | Spatial (Pixel intensity values) | Frequency / Wavelet Domain |
> | **Embedding Target** | Bit 0 of RGB color bytes | High-frequency detail coefficients ($HH, HL$) |
> | **Capacity** | Very High (up to 3 bits/pixel) | Moderate ($0.75\text{--}1.5$ bits/pixel) |
> | **Visual Quality (PSNR)** | High ($\approx 70\text{--}74\text{ dB}$) | Extremely High ($> 75\text{ dB}$) |
> | **Robustness** | Fragile against lossy compression | Highly robust to filtering and compression |
> | **Complexity** | Extremely simple ($\mathcal{O}(N)$) | Fast multi-resolution ($\mathcal{O}(N)$) |

---

### Q8: How do you verify the integrity of the extracted secret data?
> **Answer**:
> Our system packages the secret payload in a structured packet:
> $$\left[ \text{4-Byte Magic Header "STG\x01"} \right] + \left[ \text{4-Byte Payload Length} \right] + \left[ \text{4-Byte CRC32 Checksum} \right] + \left[ \text{Secret Data Bits} \right]$$
> 
> During extraction:
> 1. The engine checks the Magic Header to verify valid stego data presence.
> 2. It reads the payload length to extract the exact bit count.
> 3. It computes a 32-bit CRC32 checksum over the recovered payload and matches it against the embedded checksum to ensure 100% corruption-free data recovery.

---

### Q9: What are PSNR, MSE, and SSIM, and what benchmark values does our system achieve?
> **Answer**:
> - **MSE (Mean Squared Error)**: Measures the average squared difference between original and stego pixels (lower is better; our system achieves $\text{MSE} \approx 0.002$).
> - **PSNR (Peak Signal-to-Noise Ratio)**: Ratio between maximum possible signal power and corrupting distortion noise in decibels (dB). In image/video processing, $\text{PSNR} > 40\text{ dB}$ is considered completely imperceptible. Our system achieves **$\text{PSNR} > 72\text{ dB}$**.
> - **SSIM (Structural Similarity Index)**: Measures structural, luminance, and contrast similarity on a scale of $-1.0$ to $1.0$. Our system achieves **$\text{SSIM} = 0.999999$** (practically identical).

---

### Q10: How can LSB and DWT be combined in a Hybrid approach?
> **Answer**:
> In a **Hybrid DWT + LSB** approach, the cover frame is first transformed into wavelet subbands via 2D-DWT. Then, LSB substitution is performed directly on the integer/quantized high-frequency coefficients ($HH$ or $HL$) of the wavelet domain before applying 2D-IDWT. This combines the high embedding efficiency of LSB with the frequency-domain imperceptibility and edge-masking benefits of 2D-DWT.
