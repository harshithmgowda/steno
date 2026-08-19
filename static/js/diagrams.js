/**
 * ==============================================================================
 * SYSTEM DIAGRAMS RENDERER (LSB & 2D-DWT Wavelet Video Steganography)
 * Department of ISE, DBIT - Digital Video Steganography
 * ==============================================================================
 */

class DiagramsRenderer {
  static renderAllDiagrams() {
    this.renderSystemArchitecture('diagram-architecture');
    this.renderDFD('diagram-dfd');
    this.renderControlFlow('diagram-cfd');
    this.renderSystemFlow('diagram-sfd');
    this.renderStateTransition('diagram-std');
  }

  static renderSystemArchitecture(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;

    el.innerHTML = `
      <div class="diagram-canvas">
        <svg viewBox="0 0 950 560" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="gradCyan" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#00f2fe"/>
              <stop offset="100%" stop-color="#4facfe"/>
            </linearGradient>
            <linearGradient id="gradGreen" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#10b981"/>
              <stop offset="100%" stop-color="#059669"/>
            </linearGradient>
            <linearGradient id="gradPurple" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#a855f7"/>
              <stop offset="100%" stop-color="#7c3aed"/>
            </linearGradient>
            <linearGradient id="gradPink" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#f43f5e"/>
              <stop offset="100%" stop-color="#e11d48"/>
            </linearGradient>
            <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#00f2fe"/>
            </marker>
            <marker id="arrowGreen" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981"/>
            </marker>
          </defs>

          <!-- Outer Box: Embedding Process (Sender) -->
          <rect x="20" y="20" width="910" height="230" rx="12" fill="rgba(14, 20, 32, 0.8)" stroke="rgba(0, 242, 254, 0.4)" stroke-width="2"/>
          <rect x="350" y="8" width="250" height="26" rx="6" fill="#00f2fe"/>
          <text x="475" y="25" fill="#07090e" font-size="12" font-weight="bold" font-family="Space Grotesk" text-anchor="middle">EMBEDDING PIPELINE (SENDER)</text>

          <!-- Input Video -->
          <rect x="40" y="55" width="105" height="60" rx="8" fill="#1e293b" stroke="#64748b" stroke-width="1.5"/>
          <text x="92" y="82" fill="#f8fafc" font-size="11" font-weight="bold" text-anchor="middle">INPUT</text>
          <text x="92" y="98" fill="#94a3b8" font-size="10" text-anchor="middle">COVER VIDEO</text>

          <line x1="145" y1="85" x2="190" y2="85" stroke="#00f2fe" stroke-width="2" marker-end="url(#arrow)"/>

          <!-- 1. Frame Extraction -->
          <rect x="195" y="55" width="135" height="60" rx="8" fill="#101726" stroke="#00f2fe" stroke-width="1.5"/>
          <text x="262" y="80" fill="#00f2fe" font-size="11" font-weight="bold" text-anchor="middle">1. FRAME</text>
          <text x="262" y="96" fill="#f8fafc" font-size="10" text-anchor="middle">EXTRACTION</text>

          <line x1="330" y1="85" x2="385" y2="85" stroke="#00f2fe" stroke-width="2" marker-end="url(#arrow)"/>

          <!-- 2. 2D-DWT Decomposition -->
          <rect x="390" y="50" width="165" height="70" rx="8" fill="#101726" stroke="#a855f7" stroke-width="1.5"/>
          <text x="472" y="72" fill="#c084fc" font-size="11" font-weight="bold" text-anchor="middle">2. 2D-DWT WAVELET</text>
          <text x="472" y="88" fill="#f8fafc" font-size="10" text-anchor="middle">DECOMPOSITION</text>
          <text x="472" y="105" fill="#94a3b8" font-size="9" text-anchor="middle">[LL, LH, HL, HH]</text>

          <line x1="555" y1="85" x2="610" y2="85" stroke="#00f2fe" stroke-width="2" marker-end="url(#arrow)"/>

          <!-- 3. LSB / Detail Coefficient Embedding -->
          <rect x="615" y="50" width="155" height="70" rx="8" fill="#101726" stroke="#10b981" stroke-width="1.5"/>
          <text x="692" y="72" fill="#34d399" font-size="11" font-weight="bold" text-anchor="middle">3. EMBEDDING</text>
          <text x="692" y="88" fill="#f8fafc" font-size="10" text-anchor="middle">LSB / DWT Subbands</text>
          <text x="692" y="105" fill="#94a3b8" font-size="9" text-anchor="middle">+ 2D-IDWT Reconstruct</text>

          <line x1="770" y1="85" x2="815" y2="85" stroke="#00f2fe" stroke-width="2" marker-end="url(#arrow)"/>

          <!-- Stego Video Output -->
          <rect x="820" y="55" width="95" height="60" rx="8" fill="#1e293b" stroke="#10b981" stroke-width="2"/>
          <text x="867" y="82" fill="#34d399" font-size="11" font-weight="bold" text-anchor="middle">STEGO VIDEO</text>
          <text x="867" y="98" fill="#94a3b8" font-size="10" text-anchor="middle">(PSNR > 72dB)</text>

          <!-- Secret Data Packet -->
          <rect x="195" y="155" width="135" height="60" rx="8" fill="#1e293b" stroke="#f43f5e" stroke-width="1.5"/>
          <text x="262" y="180" fill="#fb7185" font-size="11" font-weight="bold" text-anchor="middle">SECRET PAYLOAD</text>
          <text x="262" y="196" fill="#94a3b8" font-size="10" text-anchor="middle">Confidential Text</text>

          <line x1="330" y1="185" x2="385" y2="185" stroke="#fb7185" stroke-width="2" marker-end="url(#arrow)"/>

          <!-- Packetizer / CRC32 -->
          <rect x="390" y="155" width="165" height="60" rx="8" fill="#101726" stroke="#fb7185" stroke-width="1.5"/>
          <text x="472" y="180" fill="#fb7185" font-size="11" font-weight="bold" text-anchor="middle">CRC32 PACKETIZER</text>
          <text x="472" y="196" fill="#f8fafc" font-size="10" text-anchor="middle">[Magic] + [Len] + [CRC]</text>

          <!-- Connection from CRC packetizer to Embedding -->
          <path d="M 555 185 L 692 185 L 692 125" fill="none" stroke="#fb7185" stroke-width="2" marker-end="url(#arrow)"/>

          <!-- Communication Channel -->
          <line x1="475" y1="250" x2="475" y2="280" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/>
          <text x="475" y="270" fill="#94a3b8" font-size="10" text-anchor="middle" background="#07090e">Transmission Channel (Uncompressed / Lossless Video Stream)</text>

          <!-- Outer Box: Extraction Process (Receiver) -->
          <rect x="20" y="290" width="910" height="230" rx="12" fill="rgba(14, 20, 32, 0.8)" stroke="rgba(16, 185, 129, 0.4)" stroke-width="2"/>
          <rect x="350" y="278" width="250" height="26" rx="6" fill="#10b981"/>
          <text x="475" y="295" fill="#07090e" font-size="12" font-weight="bold" font-family="Space Grotesk" text-anchor="middle">EXTRACTION PIPELINE (RECEIVER)</text>

          <!-- Stego Video Ingestion -->
          <rect x="40" y="325" width="105" height="60" rx="8" fill="#1e293b" stroke="#10b981" stroke-width="1.5"/>
          <text x="92" y="352" fill="#34d399" font-size="11" font-weight="bold" text-anchor="middle">STEGO VIDEO</text>
          <text x="92" y="368" fill="#94a3b8" font-size="10" text-anchor="middle">CARRIER STREAM</text>

          <line x1="145" y1="355" x2="190" y2="355" stroke="#10b981" stroke-width="2" marker-end="url(#arrowGreen)"/>

          <!-- 1. Frame Extraction -->
          <rect x="195" y="325" width="135" height="60" rx="8" fill="#101726" stroke="#00f2fe" stroke-width="1.5"/>
          <text x="262" y="350" fill="#00f2fe" font-size="11" font-weight="bold" text-anchor="middle">1. FRAME</text>
          <text x="262" y="366" fill="#f8fafc" font-size="10" text-anchor="middle">EXTRACTION</text>

          <line x1="330" y1="355" x2="385" y2="355" stroke="#10b981" stroke-width="2" marker-end="url(#arrowGreen)"/>

          <!-- 2. 2D-DWT Decomposition / LSB Extraction -->
          <rect x="390" y="320" width="165" height="70" rx="8" fill="#101726" stroke="#a855f7" stroke-width="1.5"/>
          <text x="472" y="342" fill="#c084fc" font-size="11" font-weight="bold" text-anchor="middle">2. 2D-DWT TRANSFORM</text>
          <text x="472" y="358" fill="#f8fafc" font-size="10" text-anchor="middle">SUBBAND EXTRACTION</text>
          <text x="472" y="375" fill="#94a3b8" font-size="9" text-anchor="middle">Read LSB from HH/HL</text>

          <line x1="555" y1="355" x2="610" y2="355" stroke="#10b981" stroke-width="2" marker-end="url(#arrowGreen)"/>

          <!-- 3. Bit Stream Reassembly -->
          <rect x="615" y="325" width="155" height="60" rx="8" fill="#101726" stroke="#00f2fe" stroke-width="1.5"/>
          <text x="692" y="350" fill="#00f2fe" font-size="11" font-weight="bold" text-anchor="middle">3. BIT STREAM</text>
          <text x="692" y="366" fill="#f8fafc" font-size="10" text-anchor="middle">REASSEMBLY</text>

          <!-- Line down to CRC32 Check -->
          <path d="M 692 385 L 692 455 L 560 455" fill="none" stroke="#10b981" stroke-width="2" marker-end="url(#arrowGreen)"/>

          <!-- 4. CRC32 Check & Verification -->
          <rect x="390" y="425" width="165" height="60" rx="8" fill="#101726" stroke="#10b981" stroke-width="1.5"/>
          <text x="472" y="450" fill="#34d399" font-size="11" font-weight="bold" text-anchor="middle">4. CRC32 VERIFICATION</text>
          <text x="472" y="466" fill="#f8fafc" font-size="10" text-anchor="middle">100% Lossless Check</text>

          <line x1="390" y1="455" x2="335" y2="455" stroke="#10b981" stroke-width="2" marker-end="url(#arrowGreen)"/>

          <!-- 5. Recovered Message -->
          <rect x="195" y="425" width="135" height="60" rx="8" fill="#1e293b" stroke="#10b981" stroke-width="2"/>
          <text x="262" y="450" fill="#34d399" font-size="11" font-weight="bold" text-anchor="middle">RECOVERED</text>
          <text x="262" y="466" fill="#f8fafc" font-size="10" text-anchor="middle">SECRET MESSAGE</text>
        </svg>
      </div>
    `;
  }

  static renderDFD(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;

    el.innerHTML = `
      <div class="diagram-canvas">
        <svg viewBox="0 0 950 480" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <marker id="dfdArrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#00f2fe"/>
            </marker>
          </defs>

          <!-- Entities -->
          <rect x="40" y="80" width="130" height="70" rx="6" fill="#1e293b" stroke="#64748b" stroke-width="2"/>
          <text x="105" y="112" fill="#f8fafc" font-size="12" font-weight="bold" text-anchor="middle">SENDER</text>
          <text x="105" y="128" fill="#94a3b8" font-size="10" text-anchor="middle">(User / Source)</text>

          <line x1="170" y1="115" x2="245" y2="115" stroke="#00f2fe" stroke-width="2" marker-end="url(#dfdArrow)"/>
          <text x="207" y="105" fill="#94a3b8" font-size="9" text-anchor="middle">Video + Text</text>

          <!-- Process 1.0: Embedding Pipeline -->
          <circle cx="310" cy="115" r="55" fill="#101726" stroke="#00f2fe" stroke-width="2"/>
          <text x="310" y="105" fill="#00f2fe" font-size="11" font-weight="bold" text-anchor="middle">1.0</text>
          <text x="310" y="120" fill="#f8fafc" font-size="10" text-anchor="middle">LSB / 2D-DWT</text>
          <text x="310" y="133" fill="#94a3b8" font-size="9" text-anchor="middle">Embedding</text>

          <!-- Stego Video Flow -->
          <line x1="365" y1="115" x2="465" y2="115" stroke="#00f2fe" stroke-width="2" marker-end="url(#dfdArrow)"/>
          <text x="415" y="105" fill="#94a3b8" font-size="9" text-anchor="middle">Stego Video</text>

          <!-- Process 2.0: Extraction Pipeline -->
          <circle cx="530" cy="115" r="55" fill="#101726" stroke="#10b981" stroke-width="2"/>
          <text x="530" y="105" fill="#10b981" font-size="11" font-weight="bold" text-anchor="middle">2.0</text>
          <text x="530" y="120" fill="#f8fafc" font-size="10" text-anchor="middle">LSB / 2D-DWT</text>
          <text x="530" y="133" fill="#94a3b8" font-size="9" text-anchor="middle">Extraction</text>

          <line x1="585" y1="115" x2="685" y2="115" stroke="#00f2fe" stroke-width="2" marker-end="url(#dfdArrow)"/>
          <text x="635" y="105" fill="#94a3b8" font-size="9" text-anchor="middle">Secret Text</text>

          <!-- Receiver -->
          <rect x="690" y="80" width="130" height="70" rx="6" fill="#1e293b" stroke="#10b981" stroke-width="2"/>
          <text x="755" y="112" fill="#f8fafc" font-size="12" font-weight="bold" text-anchor="middle">RECEIVER</text>
          <text x="755" y="128" fill="#34d399" font-size="10" text-anchor="middle">(Authorized Dest)</text>

          <!-- Data Store -->
          <line x1="260" y1="280" x2="600" y2="280" stroke="#a855f7" stroke-width="2"/>
          <line x1="260" y1="325" x2="600" y2="325" stroke="#a855f7" stroke-width="2"/>
          <text x="430" y="307" fill="#c084fc" font-size="12" font-weight="bold" text-anchor="middle">D1: Stego Video Buffer & Frame Store</text>

          <!-- Connections to Data Store -->
          <path d="M 310 170 L 310 275" fill="none" stroke="#a855f7" stroke-width="2" marker-end="url(#dfdArrow)"/>
          <path d="M 530 275 L 530 175" fill="none" stroke="#a855f7" stroke-width="2" marker-end="url(#dfdArrow)"/>
        </svg>
      </div>
    `;
  }

  static renderControlFlow(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;

    el.innerHTML = `
      <div class="diagram-canvas">
        <svg viewBox="0 0 950 500" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <marker id="cfdArrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#00f2fe"/>
            </marker>
          </defs>

          <!-- Start -->
          <ellipse cx="100" cy="80" rx="55" ry="25" fill="#10b981"/>
          <text x="100" y="84" fill="#07090e" font-size="11" font-weight="bold" text-anchor="middle">START</text>

          <line x1="155" y1="80" x2="205" y2="80" stroke="#00f2fe" stroke-width="2" marker-end="url(#cfdArrow)"/>

          <!-- 1. Load Video -->
          <rect x="210" y="55" width="140" height="50" rx="6" fill="#1e293b" stroke="#00f2fe" stroke-width="1.5"/>
          <text x="280" y="78" fill="#f8fafc" font-size="11" text-anchor="middle">1. Load Video &</text>
          <text x="280" y="93" fill="#00f2fe" font-size="10" text-anchor="middle">Extract Frames</text>

          <line x1="350" y1="80" x2="410" y2="80" stroke="#00f2fe" stroke-width="2" marker-end="url(#cfdArrow)"/>

          <!-- Decision: Mode Selection -->
          <polygon points="480,50 550,80 480,110 410,80" fill="#101726" stroke="#a855f7" stroke-width="2"/>
          <text x="480" y="77" fill="#c084fc" font-size="10" font-weight="bold" text-anchor="middle">Select</text>
          <text x="480" y="90" fill="#f8fafc" font-size="9" text-anchor="middle">Mode?</text>

          <!-- Branch 1: 2D-DWT -->
          <line x1="550" y1="80" x2="620" y2="80" stroke="#00f2fe" stroke-width="2" marker-end="url(#cfdArrow)"/>
          <text x="580" y="72" fill="#00f2fe" font-size="9" text-anchor="middle">DWT</text>

          <rect x="625" y="55" width="160" height="50" rx="6" fill="#101726" stroke="#a855f7" stroke-width="1.5"/>
          <text x="705" y="76" fill="#c084fc" font-size="10" font-weight="bold" text-anchor="middle">2D-DWT Wavelet (Haar)</text>
          <text x="705" y="92" fill="#94a3b8" font-size="9" text-anchor="middle">Embed in HH/HL Subbands</text>

          <!-- Branch 2: Spatial LSB -->
          <line x1="480" y1="110" x2="480" y2="180" stroke="#00f2fe" stroke-width="2" marker-end="url(#cfdArrow)"/>
          <text x="495" y="145" fill="#00f2fe" font-size="9" text-anchor="start">LSB</text>

          <rect x="400" y="185" width="160" height="50" rx="6" fill="#101726" stroke="#00f2fe" stroke-width="1.5"/>
          <text x="480" y="206" fill="#00f2fe" font-size="10" font-weight="bold" text-anchor="middle">Spatial LSB Substitution</text>
          <text x="480" y="222" fill="#94a3b8" font-size="9" text-anchor="middle">Modify Bit 0 of RGB Pixels</text>

          <!-- Convergence: Stego Video Generation -->
          <path d="M 705 105 L 705 270 L 570 270" fill="none" stroke="#00f2fe" stroke-width="2" marker-end="url(#cfdArrow)"/>
          <path d="M 480 235 L 480 270 L 410 270" fill="none" stroke="#00f2fe" stroke-width="2" marker-end="url(#cfdArrow)"/>

          <rect x="415" y="250" width="150" height="45" rx="6" fill="#1e293b" stroke="#10b981" stroke-width="1.5"/>
          <text x="490" y="272" fill="#34d399" font-size="10" font-weight="bold" text-anchor="middle">Reconstruct Stego Video</text>
          <text x="490" y="286" fill="#94a3b8" font-size="9" text-anchor="middle">PSNR > 72 dB</text>

          <line x1="490" y1="295" x2="490" y2="340" stroke="#00f2fe" stroke-width="2" marker-end="url(#cfdArrow)"/>

          <!-- Extraction Process -->
          <rect x="400" y="345" width="180" height="50" rx="6" fill="#101726" stroke="#10b981" stroke-width="1.5"/>
          <text x="490" y="366" fill="#10b981" font-size="10" font-weight="bold" text-anchor="middle">Receiver Extraction & CRC32</text>
          <text x="490" y="382" fill="#94a3b8" font-size="9" text-anchor="middle">100% Lossless Verification</text>

          <line x1="490" y1="395" x2="490" y2="435" stroke="#10b981" stroke-width="2" marker-end="url(#cfdArrow)"/>

          <ellipse cx="490" cy="455" rx="55" ry="20" fill="#10b981"/>
          <text x="490" y="459" fill="#07090e" font-size="11" font-weight="bold" text-anchor="middle">END</text>
        </svg>
      </div>
    `;
  }

  static renderSystemFlow(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;

    el.innerHTML = `
      <div class="diagram-canvas">
        <svg viewBox="0 0 950 400" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <marker id="sfdArrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#00f2fe"/>
            </marker>
          </defs>

          <!-- Step 1 -->
          <rect x="40" y="140" width="140" height="70" rx="8" fill="#101726" stroke="#00f2fe" stroke-width="1.5"/>
          <text x="110" y="167" fill="#00f2fe" font-size="11" font-weight="bold" text-anchor="middle">1. INPUT VIDEO</text>
          <text x="110" y="185" fill="#94a3b8" font-size="10" text-anchor="middle">Sequential Frames</text>

          <line x1="180" y1="175" x2="230" y2="175" stroke="#00f2fe" stroke-width="2" marker-end="url(#sfdArrow)"/>

          <!-- Step 2 -->
          <rect x="235" y="140" width="160" height="70" rx="8" fill="#101726" stroke="#a855f7" stroke-width="1.5"/>
          <text x="315" y="167" fill="#c084fc" font-size="11" font-weight="bold" text-anchor="middle">2. 2D-DWT TRANSFORM</text>
          <text x="315" y="185" fill="#94a3b8" font-size="10" text-anchor="middle">LL, LH, HL, HH Subbands</text>

          <line x1="395" y1="175" x2="445" y2="175" stroke="#00f2fe" stroke-width="2" marker-end="url(#sfdArrow)"/>

          <!-- Step 3 -->
          <rect x="450" y="140" width="160" height="70" rx="8" fill="#101726" stroke="#10b981" stroke-width="1.5"/>
          <text x="530" y="167" fill="#34d399" font-size="11" font-weight="bold" text-anchor="middle">3. DETAIL EMBEDDING</text>
          <text x="530" y="185" fill="#94a3b8" font-size="10" text-anchor="middle">LSB / Wavelet Coeffs</text>

          <line x1="610" y1="175" x2="660" y2="175" stroke="#00f2fe" stroke-width="2" marker-end="url(#sfdArrow)"/>

          <!-- Step 4 -->
          <rect x="665" y="140" width="160" height="70" rx="8" fill="#101726" stroke="#00f2fe" stroke-width="1.5"/>
          <text x="745" y="167" fill="#00f2fe" font-size="11" font-weight="bold" text-anchor="middle">4. 2D-IDWT SYNTHESIS</text>
          <text x="745" y="185" fill="#94a3b8" font-size="10" text-anchor="middle">Stego Video Assembly</text>
        </svg>
      </div>
    `;
  }

  static renderStateTransition(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;

    el.innerHTML = `
      <div class="diagram-canvas">
        <svg viewBox="0 0 950 400" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <marker id="stdArrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#00f2fe"/>
            </marker>
          </defs>

          <!-- State 1: IDLE -->
          <rect x="50" y="150" width="120" height="60" rx="10" fill="#1e293b" stroke="#64748b" stroke-width="2"/>
          <text x="110" y="177" fill="#f8fafc" font-size="12" font-weight="bold" text-anchor="middle">IDLE</text>
          <text x="110" y="195" fill="#94a3b8" font-size="9" text-anchor="middle">Awaiting Input</text>

          <line x1="170" y1="180" x2="230" y2="180" stroke="#00f2fe" stroke-width="2" marker-end="url(#stdArrow)"/>
          <text x="200" y="170" fill="#94a3b8" font-size="8" text-anchor="middle">Video Ingestion</text>

          <!-- State 2: READY -->
          <rect x="235" y="150" width="140" height="60" rx="10" fill="#101726" stroke="#00f2fe" stroke-width="2"/>
          <text x="305" y="177" fill="#00f2fe" font-size="12" font-weight="bold" text-anchor="middle">FRAMES READY</text>
          <text x="305" y="195" fill="#94a3b8" font-size="9" text-anchor="middle">Extracted & Decomposed</text>

          <line x1="375" y1="180" x2="440" y2="180" stroke="#00f2fe" stroke-width="2" marker-end="url(#stdArrow)"/>
          <text x="408" y="170" fill="#94a3b8" font-size="8" text-anchor="middle">Embed Clicked</text>

          <!-- State 3: EMBEDDING -->
          <rect x="445" y="150" width="160" height="60" rx="10" fill="#101726" stroke="#a855f7" stroke-width="2"/>
          <text x="525" y="177" fill="#c084fc" font-size="12" font-weight="bold" text-anchor="middle">EMBEDDING ACTIVE</text>
          <text x="525" y="195" fill="#94a3b8" font-size="9" text-anchor="middle">LSB / 2D-DWT Encoding</text>

          <line x1="605" y1="180" x2="670" y2="180" stroke="#00f2fe" stroke-width="2" marker-end="url(#stdArrow)"/>
          <text x="638" y="170" fill="#94a3b8" font-size="8" text-anchor="middle">Complete</text>

          <!-- State 4: STEGO READY -->
          <rect x="675" y="150" width="160" height="60" rx="10" fill="#101726" stroke="#10b981" stroke-width="2"/>
          <text x="755" y="177" fill="#34d399" font-size="12" font-weight="bold" text-anchor="middle">STEGO READY</text>
          <text x="755" y="195" fill="#94a3b8" font-size="9" text-anchor="middle">Ready for Extraction</text>
        </svg>
      </div>
    `;
  }
}

window.DiagramsRenderer = DiagramsRenderer;
