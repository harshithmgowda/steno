# Academic Project Synopsis / Proposal

## Project Title
**DIGITAL VIDEO STEGANOGRAPHY**
*Using LSB + Adaptive Frame Selection (AFS)*

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
Digital video steganography is a technique used to hide secret information inside a video without noticeably changing its visual appearance. A video consists of a sequence of frames, which provides a larger medium for hiding information compared with a single image.

In this project, we propose an **LSB + Adaptive Frame Selection (AFS)** approach. The traditional LSB technique hides secret data by modifying the least significant bits of pixel values. However, embedding data in every frame is unnecessary and can increase the chance of detection. Therefore, AFS is used to identify suitable frames for data embedding.

The proposed method first analyzes the video frames and selects frames that are suitable for hiding information. The secret data is then embedded into the selected frames using the LSB technique.

---

### 2. Step-by-Step Proposed Methodology

#### Step 1: Extract Video Frames
Suppose your video contains:
$$\text{Frame 1, Frame 2, Frame 3, Frame 4, Frame 5, } \dots, \text{ Frame 100}$$

You don't necessarily want to hide information in all 100 frames. Indiscriminately modifying every frame increases visual distortion and steganalysis risk.

---

#### Step 2: Select Suitable Frames (Adaptive Frame Selection - AFS)
AFS calculates the difference score between the current frame and the previous frame:
$$\Delta(F_t, F_{t-1}) = \frac{1}{M \times N} \sum_{x=1}^{M}\sum_{y=1}^{N} |F_t(x,y) - F_{t-1}(x,y)|$$

Then classify the frames based on the difference score:
- **Low difference** $\rightarrow$ ❌ **Don't select** (Static or flat background, high detection risk)
- **Medium difference** $\rightarrow$ ⚠️ **Candidate** (Evaluated further)
- **High difference** $\rightarrow$ ✅ **Select** (Dynamic motion & texture masks alterations)

##### Frame Difference & Selection Table:
| Frame | Difference score | Selection | Description |
| :---: | :---: | :---: | :--- |
| **1** | — | — | Reference Frame |
| **2** | 8 | ❌ | Low difference (Skipped) |
| **3** | 12 | ❌ | Low difference (Skipped) |
| **4** | 67 | ✅ | High difference (Selected) |
| **5** | 74 | ✅ | High difference (Selected) |
| **6** | 10 | ❌ | Low difference (Skipped) |
| **7** | 81 | ✅ | High difference (Selected) |

AFS creates a list of suitable frames, such as:
$$\text{Selected Frames} = \{4, 5, 7, 12, 17, 21, \dots\}$$

You then embed your secret message **only in these selected frames**.

> **Key Difference**: This selective frame targeting is the main advantage over traditional mini-project plain LSB approaches where every frame is modified sequentially.

---

#### Step 3: Apply LSB (Least Significant Bit Modification)
Suppose a pixel in a selected frame has an RGB value:
- $\text{Red (R)} = 10110110_2$
- $\text{Green (G)} = 11001001_2$
- $\text{Blue (B)} = 01101100_2$

If the secret bit to embed is **`1`**, we modify the least significant bit of the channel:
$$10110110_2 \longrightarrow 1011011\mathbf{1}_2$$

The change is extremely small ($\pm 1$ in pixel intensity) and generally impossible to notice visually.

The process is repeated across suitable pixels in the selected carrier frames until the secret payload is fully embedded.

---

#### Step 4: Data Extraction Pipeline
1. The receiver receives the stego video.
2. The receiver extracts the video frames.
3. Using the exact same deterministic AFS difference scoring, the receiver computes the difference between consecutive frames and identifies the identical list of $\text{Selected Frames} = \{4, 5, 7, 12, 17, 21, \dots\}$.
4. The receiver reads the LSBs from the pixels of the selected frames in order to reconstruct the secret message.

---

### 3. Key Differences & Advantages

| Feature | Traditional Plain LSB | Proposed AFS + LSB Approach |
| :--- | :--- | :--- |
| **Frame Coverage** | Modifies 100% of video frames | Modifies only high-difference frames ($\approx 10\% - 30\%$) |
| **Unmodified Frames** | 0% clean frames | 70% – 90% of frames remain 100% untouched |
| **Steganalysis Risk** | High (static frames show statistical anomalies) | Low (motion & texture naturally mask bit changes) |
| **Visual Quality (PSNR)**| Lower overall video PSNR | High video fidelity ($\text{PSNR} > 70\text{ dB}$, $\text{SSIM} > 0.999$) |
| **Frame Detection** | Fixed sequential embedding | Dynamic threshold-based motion selection |

---

### 4. Literature Survey

| SI No | Publication, Title & Year | Methodology | Objectives | Objectives Achieved | Objectives Not Achieved |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | Kumar et al., *Adaptive Video Steganography*, 2024 | Chaotic map + adaptive frame selection | Improve security & capacity | High security & capacity | Full attack resistance |
| **2** | Mohamed et al., *Motion Estimation Video Steganography*, 2025 | H.264 motion-vector method | Real-time secure hiding | Low distortion & overhead | Limited to H.264 |
| **3** | Zhang et al., *HEVC Video Steganography*, 2026 | HEVC CU structure method | Improve capacity & security | Better quality & anti-steganalysis | Limited codec evaluation |
| **4** | *Development of LSB Based Steganography Method for Video and Image Hiding*, 2024 | LSB-based embedding | Hide image/data in video | Simple and effective hiding | Limited robustness |
| **5** | *Large-Capacity and Flexible Video Steganography via Invertible Neural Network*, 2023 | Invertible Neural Network (INN) | Increase hiding capacity and flexibility | Multiple secret videos can be hidden | High computational complexity |
| **6** | *Deep Learning Based Coverless Video Steganography for Secret Audio*, 2025 | Deep learning + coverless steganography | Hide secret audio in video securely | Improved security and hiding capability | Further real-world robustness needed |

---

### 5. Architectural Pipeline & System Flow

```
========================================================================================
                               EMBEDDING (SENDER)
========================================================================================

  [Cover Video]
       │
       ▼
  [1. Frame Extraction] ──> Frame 1, Frame 2, Frame 3, Frame 4, Frame 5...
       │
       ▼
  [2. AFS Frame Difference Analysis]
       │  - Frame 2: Diff = 8   ❌ (Skip)
       │  - Frame 3: Diff = 12  ❌ (Skip)
       │  - Frame 4: Diff = 67  ✅ (Selected)
       │  - Frame 5: Diff = 74  ✅ (Selected)
       │  - Frame 7: Diff = 81  ✅ (Selected)
       │
       ▼
  [Selected Frames List] ──> {4, 5, 7, 12, 17, 21...}
       │
       ▼
  [3. LSB Pixel Embedding] ──> Modifies LSB of RGB channels (10110110 -> 10110111)
       │
       ▼
  [4. Stego Video Generation] ──> Clean untouched frames + LSB modified frames

========================================================================================
                               EXTRACTION (RECEIVER)
========================================================================================

  [Stego Video]
       │
       ▼
  [1. Frame Extraction]
       │
       ▼
  [2. AFS Frame Difference Analysis] ──> Identifies Selected Frames: {4, 5, 7, 12, 17...}
       │
       ▼
  [3. LSB Bit Extraction] ──> Reads LSBs from pixels of selected frames
       │
       ▼
  [4. Reconstructed Secret Message]
```

---

### 6. Mathematical Evaluation Metrics

1. **Mean Squared Error (MSE)**:
   $$\text{MSE} = \frac{1}{M \times N} \sum_{i=1}^{M} \sum_{j=1}^{N} \left[ I(i, j) - K(i, j) \right]^2$$

2. **Peak Signal-to-Noise Ratio (PSNR)**:
   $$\text{PSNR} = 10 \cdot \log_{10} \left( \frac{255^2}{\text{MSE}} \right) \text{ dB}$$

3. **Structural Similarity Index (SSIM)**:
   $$\text{SSIM}(x, y) = \frac{(2\mu_x\mu_y + c_1)(2\sigma_{xy} + c_2)}{(\mu_x^2 + \mu_y^2 + c_1)(\sigma_x^2 + \sigma_y^2 + c_2)}$$

---

### 7. Current Progress & Roadmap
- [x] Frame extraction and video processing pipeline.
- [x] Adaptive Frame Selection (AFS) inter-frame difference computation.
- [x] Threshold-based frame classification (Low $\rightarrow$ Skip, High $\rightarrow$ Select).
- [x] LSB bit-level embedding and lossless bit extraction.
- [x] Interactive web demonstration and visual comparison UI.
- [x] Frame difference table, statistics, and metric calculation (PSNR/MSE).
