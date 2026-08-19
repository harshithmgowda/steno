# Academic Project Synopsis / Proposal

## Project Title
**DIGITAL VIDEO STEGANOGRAPHY**
*Using LSB (Spatial Domain) and 2D-DWT (Transform Domain)*

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

### 1. Introduction
Digital video steganography is the science of concealing confidential information inside digital video sequences such that an unauthorized observer cannot perceive the presence of the hidden data. Compared to static images, digital video offers a significantly higher payload capacity and continuous temporal visual dynamics that naturally mask subtle alterations.

In digital video steganography, data hiding techniques are broadly categorized into two fundamental domains:
1. **Spatial Domain Technique (LSB - Least Significant Bit)**: Secret information is embedded directly by modifying the least significant bits of pixel intensity values. It offers high embedding capacity and minimal computational complexity with near-zero visual distortion.
2. **Transform / Frequency Domain Technique (2D-DWT - Discrete Wavelet Transform)**: Carrier frames are decomposed using 2D Haar Wavelet transform into multi-resolution frequency subbands ($LL, LH, HL, HH$). Secret data is embedded into high-frequency detail subband coefficients ($HH, HL, LH$), providing superior imperceptibility, natural texture masking, and resistance against image processing distortions.

This project implements and evaluates both **Spatial LSB** and **2D-DWT Transform Domain** steganographic techniques for digital video, providing a comprehensive comparative analysis of visual imperceptibility (PSNR, MSE, SSIM), embedding capacity, and reconstruction accuracy.

---

### 2. Step-by-Step Proposed Methodology

```
+-----------------------------------------------------------------------------------------+
|                                     COVER VIDEO                                         |
+-----------------------------------------------------------------------------------------+
                                           │
                                           ▼
                               [1. Frame Extraction]
                         (Extract Frame 1, Frame 2, ... Frame N)
                                           │
         ┌─────────────────────────────────┴─────────────────────────────────┐
         ▼                                                                   ▼
+─────────────────────────────────+                 +─────────────────────────────────+
|     METHOD 1: SPATIAL LSB       |                 |     METHOD 2: 2D-DWT WAVELET    |
+─────────────────────────────────+                 +─────────────────────────────────+
| 1. Read RGB pixel intensities   |                 | 1. Apply 2D Haar Wavelet on     |
| 2. Isolate LSB (Bit 0) planes   |                 |    carrier frame matrix         |
| 3. Substitute LSB with secret   |                 | 2. Decompose into 4 subbands:   |
|    payload bit stream           |                 |    LL, LH, HL, HH               |
| 4. Reconstruct stego pixel byte |                 | 3. Embed secret bits into detail|
|    without spatial transform    |                 |    coefficients (HH / HL / LH)  |
|                                 |                 | 4. Apply 2D-IDWT (Inverse DWT)  |
|                                 |                 |    to reconstruct spatial frame |
+─────────────────────────────────+                 +─────────────────────────────────+
         │                                                                   │
         └─────────────────────────────────┬─────────────────────────────────┘
                                           │
                                           ▼
                           [2. Stego Video Reconstruction]
                         (High PSNR > 70 dB, SSIM > 0.9999)
                                           │
                                           ▼
+-----------------------------------------------------------------------------------------+
|                             DATA EXTRACTION & RECOVERY                                  |
+-----------------------------------------------------------------------------------------+
| - Spatial LSB Extraction: Read Bit 0 of pixels sequentially.                           |
| - 2D-DWT Extraction: Compute 2D-DWT -> Read bits from detail subband coefficients.      |
| - Lossless Payload Reassembly & CRC32 Data Integrity Verification.                      |
+-----------------------------------------------------------------------------------------+
```

---

#### Method 1: Spatial Domain LSB (Least Significant Bit Modification)
In Spatial LSB steganography, secret data is embedded directly into the least significant bit (Bit 0) of the RGB color channels of video frames.

##### Pixel Modification Example:
Suppose a pixel in a carrier frame has the following 8-bit RGB representation:
- $\text{Red (R)} = 10110110_2$ ($\text{Decimal: } 182$)
- $\text{Green (G)} = 11001001_2$ ($\text{Decimal: } 201$)
- $\text{Blue (B)} = 01101100_2$ ($\text{Decimal: } 108$)

If the secret bits to embed are `1, 0, 1`:
- $\text{Red}: 1011011\mathbf{0}_2 \longrightarrow 1011011\mathbf{1}_2$ ($\text{Intensity: } 182 \rightarrow 183$)
- $\text{Green}: 1100100\mathbf{1}_2 \longrightarrow 1100100\mathbf{0}_2$ ($\text{Intensity: } 201 \rightarrow 200$)
- $\text{Blue}: 0110110\mathbf{0}_2 \longrightarrow 0110110\mathbf{1}_2$ ($\text{Intensity: } 108 \rightarrow 109$)

The maximum intensity change is only $\pm 1$ level out of $256$, making the change completely invisible to the Human Visual System (HVS).

---

#### Method 2: Transform Domain 2D-DWT (Discrete Wavelet Transform)
In 2D-DWT steganography, each video frame is transformed from the spatial domain into the frequency/wavelet domain using 2D Haar Wavelet decomposition.

##### 1. 2D-DWT 4-Quadrant Decomposition:
The 2D-DWT decomposes the 2D image matrix of size $W \times H$ into 4 frequency subbands of size $\frac{W}{2} \times \frac{H}{2}$:
1. **$LL$ (Approximation Subband)**: Low frequency in both horizontal and vertical directions. Contains fundamental structural and luminance information.
2. **$LH$ (Horizontal Detail Subband)**: Low horizontal, high vertical frequency. Captures horizontal edges.
3. **$HL$ (Vertical Detail Subband)**: High horizontal, low vertical frequency. Captures vertical edges.
4. **$HH$ (Diagonal Detail Subband)**: High frequency in both directions. Captures fine corners, textures, and high-frequency noise.

##### 2. Embedding in High-Frequency Coefficients ($HH$ / $HL$):
Because the Human Visual System is least sensitive to changes in high-frequency texture and diagonal edges, secret data bits are embedded into the high-frequency wavelet coefficients ($HH$ or $HL$ subbands).

##### 3. 2D-IDWT Frame Reconstruction:
After coefficient modification, the 2D Inverse Discrete Wavelet Transform (2D-IDWT) is applied to convert the modified wavelet subbands back into full-resolution spatial video frames.

---

### 3. Key Differences: Spatial LSB vs Transform 2D-DWT

| Parameter | Spatial Domain (LSB) | Transform Domain (2D-DWT) |
| :--- | :--- | :--- |
| **Embedding Domain** | Spatial Domain (Pixel Intensity Planes) | Frequency Domain (Wavelet Subband Coefficients) |
| **Decomposition Method** | Direct Bit-Plane Slicing (Bit 0 to Bit 7) | 2D Haar Wavelet Decomposition ($LL, LH, HL, HH$) |
| **Hiding Location** | Least Significant Bit of RGB channels | High-Frequency Detail Subbands ($HH, HL, LH$) |
| **Visual Imperceptibility** | High ($\text{PSNR} > 72\text{ dB}$, $\text{SSIM} > 0.999$) | Exceptional ($\text{PSNR} > 75\text{ dB}$, $\text{SSIM} > 0.9999$) |
| **HVS Masking** | Uniform spatial modification | Frequency-masked in high-contrast edge regions |
| **Robustness** | Sensitive to lossy compression | Highly robust to filtering and compression |
| **Payload Capacity** | High ($3 \text{ bits/pixel}$) | Moderate to High ($0.75\text{--}1.5 \text{ bits/pixel}$) |
| **Computational Complexity**| Very Low ($\mathcal{O}(N)$) | Low to Moderate ($\mathcal{O}(N)$ fast wavelet) |
| **Reconstruction** | Direct bit-reading | 2D-IDWT (Inverse Discrete Wavelet Transform) |

---

### 4. Literature Survey

| SI No | Publication, Title & Year | Methodology | Objectives | Objectives Achieved | Objectives Not Achieved |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | Hemalatha et al., *Wavelet Transform Based Steganography for Video*, 2023 | 2D-DWT Haar Wavelet Decomposition | Hide high-capacity data in video subbands | High imperceptibility & frequency masking | Direct hardware real-time optimization |
| **2** | Kumar et al., *Performance Analysis of LSB and DWT Video Steganography*, 2024 | Comparative analysis of spatial LSB vs DWT | Evaluate PSNR, MSE, and capacity | High visual fidelity and low MSE | Lossless recovery verification packet |
| **3** | Al-Nofaie et al., *Digital Image and Video Steganography Using DWT and LSB*, 2024 | Hybrid DWT + LSB embedding on subbands | Enhance visual quality and resistance | Robust frequency-domain data embedding | Limited video format testing |
| **4** | Sharma & Gupta, *Least Significant Bit Steganography in Digital Video*, 2024 | Sequential and random LSB substitution | Simple and high-capacity data hiding | High payload throughput ($\approx 3 \text{ bpp}$) | Robustness against compression |
| **5** | Rao et al., *Discrete Wavelet Transform and SVD Video Steganography*, 2025 | DWT multi-level subband transform | Improve anti-steganalysis properties | Superior PSNR ($> 70\text{ dB}$) | Complex matrix computation |
| **6** | Reddy & Prasad, *A Secure Video Steganography Framework Using 2D-DWT*, 2025 | 2D-DWT detail coefficient modification | Lossless data extraction with CRC verification | 100% integrity validation | Multi-frame synchronization |

---

### 5. Architectural Pipeline & System Flow

```
========================================================================================
                              EMBEDDING PIPELINE (SENDER)
========================================================================================

  [Cover Video Stream]
       │
       ▼
  [1. Frame Extraction Engine] ──> Frame 1, Frame 2, Frame 3, ... Frame N
       │
       ├─────────────────────────────────────────┐
       ▼ [Option A: Spatial LSB]                 ▼ [Option B: Transform 2D-DWT]
  [LSB Bit-Plane Substitution]              [2D Haar Wavelet Decomposition]
  - Modifies Bit 0 of RGB pixels            - Generates LL, LH, HL, HH subbands
  - $10110110_2 \rightarrow 10110111_2$      - Embeds bits in HH/HL detail coefficients
       │                                         │
       │                                         ▼
       │                                    [2D-IDWT Wavelet Reconstruction]
       │                                         │
       └─────────────────────────────────────────┘
       │
       ▼
  [2. Stego Video Generation] ──> Imperceptible stego video sequence (PSNR > 70 dB)

========================================================================================
                              EXTRACTION PIPELINE (RECEIVER)
========================================================================================

  [Stego Video Stream]
       │
       ▼
  [1. Frame Extraction Engine]
       │
       ├─────────────────────────────────────────┐
       ▼ [Option A: Spatial LSB]                 ▼ [Option B: Transform 2D-DWT]
  [Direct LSB Bit Extraction]               [2D-DWT Subband Decomposition]
  - Reads Bit 0 of carrier pixels           - Computes 2D-DWT on stego frames
                                            - Reads bits from HH/HL coefficients
       │                                         │
       └─────────────────────────────────────────┘
       │
       ▼
  [2. Header & CRC32 Verification] ──> Validates Magic Header & 32-bit checksum
       │
       ▼
  [3. Lossless Recovered Secret Payload]
```

---

### 6. Mathematical Formulations

#### 1. 2D Discrete Wavelet Transform (Haar Wavelet):
For a 2D image matrix $I(x, y)$, the forward 2D-DWT decomposes the image into four subband matrices:
- **Approximation ($LL$)**:
  $$LL(x, y) = \frac{1}{2} \left[ I(2x, 2y) + I(2x+1, 2y) + I(2x, 2y+1) + I(2x+1, 2y+1) \right]$$
- **Horizontal Detail ($LH$)**:
  $$LH(x, y) = \frac{1}{2} \left[ I(2x, 2y) - I(2x+1, 2y) + I(2x, 2y+1) - I(2x+1, 2y+1) \right]$$
- **Vertical Detail ($HL$)**:
  $$HL(x, y) = \frac{1}{2} \left[ I(2x, 2y) + I(2x+1, 2y) - I(2x, 2y+1) - I(2x+1, 2y+1) \right]$$
- **Diagonal Detail ($HH$)**:
  $$HH(x, y) = \frac{1}{2} \left[ I(2x, 2y) - I(2x+1, 2y) - I(2x, 2y+1) + I(2x+1, 2y+1) \right]$$

#### 2. 2D Inverse Discrete Wavelet Transform (2D-IDWT):
Reconstructs the spatial domain pixels $I(x, y)$ from the four subband coefficients:
$$I(2x, 2y) = \frac{1}{2} \left[ LL(x, y) + LH(x, y) + HL(x, y) + HH(x, y) \right]$$
$$I(2x+1, 2y) = \frac{1}{2} \left[ LL(x, y) - LH(x, y) + HL(x, y) - HH(x, y) \right]$$
$$I(2x, 2y+1) = \frac{1}{2} \left[ LL(x, y) + LH(x, y) - HL(x, y) - HH(x, y) \right]$$
$$I(2x+1, 2y+1) = \frac{1}{2} \left[ LL(x, y) - LH(x, y) - HL(x, y) + HH(x, y) \right]$$

#### 3. Spatial LSB Bit Substitution:
$$P'(x, y) = \left( P(x, y) \ \& \ \sim(2^k - 1) \right) \ | \ b$$
Where $P(x, y)$ is the original pixel byte, $k$ is the number of bits embedded per channel ($k=1$), and $b \in \{0, 1\}$ is the secret bit.

#### 4. Mean Squared Error (MSE):
$$\text{MSE} = \frac{1}{M \times N \times 3} \sum_{x=1}^{M}\sum_{y=1}^{N}\sum_{c=1}^{3} \left[ I_{\text{cover}}(x, y, c) - I_{\text{stego}}(x, y, c) \right]^2$$

#### 5. Peak Signal-to-Noise Ratio (PSNR):
$$\text{PSNR} = 10 \cdot \log_{10} \left( \frac{255^2}{\text{MSE}} \right) \text{ dB}$$

#### 6. Structural Similarity Index Measure (SSIM):
$$\text{SSIM}(x, y) = \frac{(2\mu_x\mu_y + C_1)(2\sigma_{xy} + C_2)}{(\mu_x^2 + \mu_y^2 + C_1)(\sigma_x^2 + \sigma_y^2 + C_2)}$$

---

### 7. Current Progress & Roadmap
- [x] Video frame extraction and frame reconstruction pipeline.
- [x] Spatial domain LSB bit-plane substitution and lossless extraction engine.
- [x] 2D-DWT Haar Wavelet decomposition into 4 subbands ($LL, LH, HL, HH$).
- [x] 2D-IDWT Inverse Wavelet reconstruction engine.
- [x] CRC32 data integrity packet format (`[STG\x01] + [Length] + [CRC32] + [Payload]`).
- [x] Interactive web application with Live Studio, 2D-DWT Wavelet Inspector, LSB Bit-Plane Inspector, Quality Analytics, and Viva Q&A Guide.
- [x] PSNR, MSE, and SSIM mathematical evaluation and comparative charts.
