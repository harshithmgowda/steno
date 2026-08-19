/**
 * ==============================================================================
 * SYSTEM DIAGRAMS RENDERER (Slides 10 - 14)
 * Department of ISE, DBIT - Digital Video Steganography
 * ==============================================================================
 */

class DiagramsRenderer {
  /**
   * Renders SVG diagrams dynamically into container elements.
   */
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
            <linearGradient id="gradRed" x1="0%" y1="0%" x2="100%" y2="100%">
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
          <text x="475" y="25" fill="#07090e" font-size="12" font-weight="bold" font-family="Space Grotesk" text-anchor="middle">EMBEDDING PROCESS (SENDER)</text>

          <!-- Input Video -->
          <rect x="40" y="55" width="90" height="60" rx="8" fill="#1e293b" stroke="#64748b" stroke-width="1.5"/>
          <text x="85" y="82" fill="#f8fafc" font-size="11" font-weight="bold" text-anchor="middle">INPUT</text>
          <text x="85" y="98" fill="#94a3b8" font-size="10" text-anchor="middle">COVER VIDEO</text>

          <line x1="130" y1="85" x2="165" y2="85" stroke="#00f2fe" stroke-width="2" marker-end="url(#arrow)"/>

          <!-- 1. Frame Extraction -->
          <rect x="170" y="55" width="115" height="60" rx="8" fill="#101726" stroke="#00f2fe" stroke-width="1.5"/>
          <text x="227" y="80" fill="#00f2fe" font-size="11" font-weight="bold" text-anchor="middle">1. FRAME</text>
          <text x="227" y="96" fill="#f8fafc" font-size="10" text-anchor="middle">EXTRACTION</text>

          <line x1="285" y1="85" x2="320" y2="85" stroke="#00f2fe" stroke-width="2" marker-end="url(#arrow)"/>

          <!-- 2. AFS Frame Selection -->
          <rect x="325" y="55" width="125" height="60" rx="8" fill="#101726" stroke="#a855f7" stroke-width="1.5"/>
          <text x="387" y="80" fill="#c084fc" font-size="11" font-weight="bold" text-anchor="middle">2. FRAME</text>
          <text x="387" y="96" fill="#f8fafc" font-size="10" text-anchor="middle">SELECTION (AFS)</text>

          <line x1="450" y1="85" x2="485" y2="85" stroke="#00f2fe" stroke-width="2" marker-end="url(#arrow)"/>

          <!-- 3. DWT Transformation -->
          <rect x="490" y="50" width="130" height="70" rx="8" fill="#101726" stroke="#00f2fe" stroke-width="1.5"/>
          <text x="555" y="72" fill="#00f2fe" font-size="11" font-weight="bold" text-anchor="middle">3. 2D-DWT</text>
          <text x="555" y="88" fill="#f8fafc" font-size="10" text-anchor="middle">TRANSFORM</text>
          <text x="555" y="105" fill="#94a3b8" font-size="9" text-anchor="middle">[LL, LH, HL, HH]</text>

          <line x1="620" y1="85" x2="655" y2="85" stroke="#00f2fe" stroke-width="2" marker-end="url(#arrow)"/>

          <!-- 4. Data Embedding (LSB) -->
          <rect x="660" y="55" width="120" height="60" rx="8" fill="#101726" stroke="#10b981" stroke-width="1.5"/>
          <text x="720" y="80" fill="#34d399" font-size="11" font-weight="bold" text-anchor="middle">4. EMBEDDING</text>
          <text x="720" y="96" fill="#f8fafc" font-size="10" text-anchor="middle">(LSB on DWT)</text>

          <line x1="780" y1="85" x2="815" y2="85" stroke="#00f2fe" stroke-width="2" marker-end="url(#arrow)"/>

          <!-- Stego Video Output -->
          <rect x="820" y="55" width="90" height="60" rx="8" fill="#1e293b" stroke="#10b981" stroke-width="2"/>
          <text x="865" y="82" fill="#34d399" font-size="11" font-weight="bold" text-anchor="middle">STEGO VIDEO</text>
          <text x="865" y="98" fill="#94a3b8" font-size="10" text-anchor="middle">(OUTPUT)</text>

          <!-- Secret Data & AES-256 Box -->
          <rect x="170" y="160" width="115" height="55" rx="8" fill="#1e293b" stroke="#f43f5e" stroke-width="1.5"/>
          <text x="227" y="185" fill="#fb7185" font-size="11" font-weight="bold" text-anchor="middle">SECRET DATA</text>
          <text x="227" y="200" fill="#94a3b8" font-size="10" text-anchor="middle">(Plaintext / File)</text>

          <line x1="285" y1="187" x2="385" y2="187" stroke="#f43f5e" stroke-width="2" marker-end="url(#arrow)"/>

          <!-- AES-256 Encryption -->
          <rect x="390" y="160" width="160" height="55" rx="8" fill="#101726" stroke="#f43f5e" stroke-width="2"/>
          <text x="470" y="185" fill="#fb7185" font-size="11" font-weight="bold" text-anchor="middle">AES-256 ENCRYPTION</text>
          <text x="470" y="200" fill="#94a3b8" font-size="10" text-anchor="middle">Password Key Protection</text>

          <!-- Link AES-256 to LSB Embedding -->
          <path d="M 550 187 L 720 187 L 720 120" fill="none" stroke="#f43f5e" stroke-width="2" stroke-dasharray="4" marker-end="url(#arrow)"/>

          <!-- ================================================================= -->
          <!-- Outer Box: Extraction Process (Receiver) -->
          <!-- ================================================================= -->
          <rect x="20" y="280" width="910" height="250" rx="12" fill="rgba(14, 20, 32, 0.8)" stroke="rgba(16, 185, 129, 0.4)" stroke-width="2"/>
          <rect x="350" y="268" width="250" height="26" rx="6" fill="#10b981"/>
          <text x="475" y="285" fill="#07090e" font-size="12" font-weight="bold" font-family="Space Grotesk" text-anchor="middle">EXTRACTION PROCESS (RECEIVER)</text>

          <!-- Stego Video Input -->
          <rect x="40" y="320" width="90" height="60" rx="8" fill="#1e293b" stroke="#10b981" stroke-width="2"/>
          <text x="85" y="347" fill="#34d399" font-size="11" font-weight="bold" text-anchor="middle">STEGO VIDEO</text>
          <text x="85" y="363" fill="#94a3b8" font-size="10" text-anchor="middle">(INPUT)</text>

          <line x1="130" y1="350" x2="165" y2="350" stroke="#10b981" stroke-width="2" marker-end="url(#arrowGreen)"/>

          <!-- 1. Frame Extraction -->
          <rect x="170" y="320" width="115" height="60" rx="8" fill="#101726" stroke="#00f2fe" stroke-width="1.5"/>
          <text x="227" y="347" fill="#00f2fe" font-size="11" font-weight="bold" text-anchor="middle">1. FRAME</text>
          <text x="227" y="363" fill="#f8fafc" font-size="10" text-anchor="middle">EXTRACTION</text>

          <line x1="285" y1="350" x2="320" y2="350" stroke="#10b981" stroke-width="2" marker-end="url(#arrowGreen)"/>

          <!-- 2. AFS Frame Selection -->
          <rect x="325" y="320" width="125" height="60" rx="8" fill="#101726" stroke="#a855f7" stroke-width="1.5"/>
          <text x="387" y="347" fill="#c084fc" font-size="11" font-weight="bold" text-anchor="middle">2. FRAME</text>
          <text x="387" y="363" fill="#f8fafc" font-size="10" text-anchor="middle">SELECTION (AFS)</text>

          <line x1="450" y1="350" x2="485" y2="350" stroke="#10b981" stroke-width="2" marker-end="url(#arrowGreen)"/>

          <!-- 3. DWT Transformation -->
          <rect x="490" y="315" width="130" height="70" rx="8" fill="#101726" stroke="#00f2fe" stroke-width="1.5"/>
          <text x="555" y="337" fill="#00f2fe" font-size="11" font-weight="bold" text-anchor="middle">3. 2D-DWT</text>
          <text x="555" y="353" fill="#f8fafc" font-size="10" text-anchor="middle">TRANSFORM</text>
          <text x="555" y="370" fill="#94a3b8" font-size="9" text-anchor="middle">[LL, LH, HL, HH]</text>

          <line x1="620" y1="350" x2="655" y2="350" stroke="#10b981" stroke-width="2" marker-end="url(#arrowGreen)"/>

          <!-- 4. Data Extraction (LSB) -->
          <rect x="660" y="320" width="120" height="60" rx="8" fill="#101726" stroke="#10b981" stroke-width="1.5"/>
          <text x="720" y="347" fill="#34d399" font-size="11" font-weight="bold" text-anchor="middle">4. EXTRACTION</text>
          <text x="720" y="363" fill="#f8fafc" font-size="10" text-anchor="middle">(LSB on DWT)</text>

          <path d="M 720 380 L 720 440 L 615 440" fill="none" stroke="#10b981" stroke-width="2" marker-end="url(#arrowGreen)"/>

          <!-- AES-256 Decryption -->
          <rect x="450" y="415" width="160" height="55" rx="8" fill="#101726" stroke="#10b981" stroke-width="2"/>
          <text x="530" y="440" fill="#34d399" font-size="11" font-weight="bold" text-anchor="middle">AES-256 DECRYPTION</text>
          <text x="530" y="456" fill="#94a3b8" font-size="10" text-anchor="middle">CRC32 / Key Verification</text>

          <line x1="450" y1="442" x2="355" y2="442" stroke="#10b981" stroke-width="2" marker-end="url(#arrowGreen)"/>

          <!-- Recovered Secret Data -->
          <rect x="210" y="415" width="140" height="55" rx="8" fill="#1e293b" stroke="#10b981" stroke-width="2"/>
          <text x="280" y="440" fill="#34d399" font-size="11" font-weight="bold" text-anchor="middle">ORIGINAL SECRET DATA</text>
          <text x="280" y="456" fill="#94a3b8" font-size="10" text-anchor="middle">(Lossless Retrieved)</text>
        </svg>
      </div>
    `;
  }

  static renderDFD(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;

    el.innerHTML = `
      <div class="diagram-canvas">
        <svg viewBox="0 0 900 420" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <!-- Embedding DFD Box -->
          <rect x="30" y="30" width="840" height="160" rx="10" fill="rgba(14, 20, 32, 0.8)" stroke="rgba(0, 242, 254, 0.3)" stroke-width="1.5"/>
          <text x="50" y="55" fill="#00f2fe" font-size="13" font-weight="bold">1. EMBEDDING PROCESS (SENDER SIDE)</text>

          <rect x="50" y="80" width="110" height="55" rx="6" fill="#1e293b" stroke="#64748b"/>
          <text x="105" y="105" fill="#ffffff" font-size="11" text-anchor="middle">Input Video</text>
          <text x="105" y="120" fill="#94a3b8" font-size="10" text-anchor="middle">(Cover Video)</text>

          <line x1="160" y1="107" x2="220" y2="107" stroke="#00f2fe" stroke-width="2"/>

          <rect x="225" y="80" width="130" height="55" rx="6" fill="#101726" stroke="#00f2fe"/>
          <text x="290" y="105" fill="#00f2fe" font-size="11" text-anchor="middle">Preprocessing</text>
          <text x="290" y="120" fill="#94a3b8" font-size="10" text-anchor="middle">(Frame Extraction)</text>

          <line x1="355" y1="107" x2="415" y2="107" stroke="#00f2fe" stroke-width="2"/>

          <rect x="420" y="80" width="150" height="55" rx="6" fill="#101726" stroke="#a855f7"/>
          <text x="495" y="105" fill="#c084fc" font-size="11" text-anchor="middle">Data Hiding</text>
          <text x="495" y="120" fill="#94a3b8" font-size="10" text-anchor="middle">(AES + DWT + LSB)</text>

          <!-- Secret data link -->
          <rect x="440" y="145" width="110" height="35" rx="4" fill="#1e293b" stroke="#f43f5e"/>
          <text x="495" y="167" fill="#fb7185" font-size="10" text-anchor="middle">Secret Data</text>
          <line x1="495" y1="145" x2="495" y2="135" stroke="#f43f5e" stroke-width="1.5"/>

          <line x1="570" y1="107" x2="630" y2="107" stroke="#00f2fe" stroke-width="2"/>

          <rect x="635" y="80" width="110" height="55" rx="6" fill="#101726" stroke="#00f2fe"/>
          <text x="690" y="105" fill="#00f2fe" font-size="11" text-anchor="middle">Reconstruct</text>
          <text x="690" y="120" fill="#94a3b8" font-size="10" text-anchor="middle">Video</text>

          <line x1="745" y1="107" x2="795" y2="107" stroke="#10b981" stroke-width="2"/>

          <rect x="800" y="80" width="60" height="55" rx="6" fill="#1e293b" stroke="#10b981"/>
          <text x="830" y="105" fill="#34d399" font-size="10" text-anchor="middle">Stego</text>
          <text x="830" y="120" fill="#34d399" font-size="10" text-anchor="middle">Video</text>

          <!-- Extraction DFD Box -->
          <rect x="30" y="220" width="840" height="160" rx="10" fill="rgba(14, 20, 32, 0.8)" stroke="rgba(16, 185, 129, 0.3)" stroke-width="1.5"/>
          <text x="50" y="245" fill="#10b981" font-size="13" font-weight="bold">2. EXTRACTION PROCESS (RECEIVER SIDE)</text>

          <rect x="50" y="270" width="110" height="55" rx="6" fill="#1e293b" stroke="#10b981"/>
          <text x="105" y="295" fill="#34d399" font-size="11" text-anchor="middle">Stego Video</text>
          <text x="105" y="310" fill="#94a3b8" font-size="10" text-anchor="middle">(Input)</text>

          <line x1="160" y1="297" x2="220" y2="297" stroke="#10b981" stroke-width="2"/>

          <rect x="225" y="270" width="130" height="55" rx="6" fill="#101726" stroke="#00f2fe"/>
          <text x="290" y="295" fill="#00f2fe" font-size="11" text-anchor="middle">Preprocessing</text>
          <text x="290" y="310" fill="#94a3b8" font-size="10" text-anchor="middle">(Frame Extraction)</text>

          <line x1="355" y1="297" x2="415" y2="297" stroke="#10b981" stroke-width="2"/>

          <rect x="420" y="270" width="150" height="55" rx="6" fill="#101726" stroke="#10b981"/>
          <text x="495" y="295" fill="#34d399" font-size="11" text-anchor="middle">Data Extraction</text>
          <text x="495" y="310" fill="#94a3b8" font-size="10" text-anchor="middle">(DWT LSB + AES)</text>

          <line x1="495" y1="325" x2="495" y2="345" stroke="#10b981" stroke-width="2"/>

          <rect x="425" y="345" width="140" height="30" rx="4" fill="#1e293b" stroke="#10b981"/>
          <text x="495" y="365" fill="#34d399" font-size="10" text-anchor="middle">Extracted Secret Data</text>

          <line x1="570" y1="297" x2="630" y2="297" stroke="#10b981" stroke-width="2"/>

          <rect x="635" y="270" width="110" height="55" rx="6" fill="#101726" stroke="#00f2fe"/>
          <text x="690" y="295" fill="#00f2fe" font-size="11" text-anchor="middle">Reconstruct</text>
          <text x="690" y="310" fill="#94a3b8" font-size="10" text-anchor="middle">Original Video</text>

          <line x1="745" y1="297" x2="795" y2="297" stroke="#00f2fe" stroke-width="2"/>

          <rect x="800" y="270" width="60" height="55" rx="6" fill="#1e293b" stroke="#64748b"/>
          <text x="830" y="295" fill="#ffffff" font-size="10" text-anchor="middle">Original</text>
          <text x="830" y="310" fill="#94a3b8" font-size="10" text-anchor="middle">Video</text>
        </svg>
      </div>
    `;
  }

  static renderControlFlow(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;

    el.innerHTML = `
      <div class="diagram-canvas">
        <svg viewBox="0 0 900 480" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <!-- Embedding Column -->
          <rect x="50" y="20" width="370" height="440" rx="8" fill="rgba(14, 20, 32, 0.8)" stroke="rgba(0, 242, 254, 0.3)"/>
          <rect x="135" y="10" width="200" height="24" rx="4" fill="#00f2fe"/>
          <text x="235" y="26" fill="#07090e" font-size="11" font-weight="bold" text-anchor="middle">EMBEDDING (SENDER)</text>

          <!-- Sender Steps -->
          <rect x="80" y="45" width="310" height="40" rx="6" fill="#101726" stroke="#64748b"/>
          <text x="235" y="69" fill="#f8fafc" font-size="11" text-anchor="middle">1. Input Cover Video (Read file)</text>

          <line x1="235" y1="85" x2="235" y2="105" stroke="#00f2fe" stroke-width="2"/>

          <rect x="80" y="105" width="310" height="40" rx="6" fill="#101726" stroke="#f43f5e"/>
          <text x="235" y="129" fill="#fb7185" font-size="11" text-anchor="middle">2. Input Secret Data + AES-256 Key</text>

          <line x1="235" y1="145" x2="235" y2="165" stroke="#00f2fe" stroke-width="2"/>

          <rect x="80" y="165" width="310" height="40" rx="6" fill="#101726" stroke="#00f2fe"/>
          <text x="235" y="189" fill="#00f2fe" font-size="11" text-anchor="middle">3. Preprocessing (Extract Frames)</text>

          <line x1="235" y1="205" x2="235" y2="225" stroke="#00f2fe" stroke-width="2"/>

          <rect x="80" y="225" width="310" height="50" rx="6" fill="#101726" stroke="#a855f7"/>
          <text x="235" y="247" fill="#c084fc" font-size="11" text-anchor="middle">4. Embedding Process (AFS + DWT + LSB)</text>
          <text x="235" y="263" fill="#94a3b8" font-size="10" text-anchor="middle">Hide encrypted bits in 2D-DWT sub-bands</text>

          <line x1="235" y1="275" x2="235" y2="295" stroke="#00f2fe" stroke-width="2"/>

          <rect x="80" y="295" width="310" height="40" rx="6" fill="#101726" stroke="#10b981"/>
          <text x="235" y="319" fill="#34d399" font-size="11" text-anchor="middle">5. Generate Stego Video (Combine frames)</text>

          <line x1="235" y1="335" x2="235" y2="355" stroke="#00f2fe" stroke-width="2"/>

          <rect x="80" y="355" width="310" height="40" rx="6" fill="#1e293b" stroke="#10b981"/>
          <text x="235" y="379" fill="#34d399" font-size="11" text-anchor="middle">6. Save / Transmit Stego Video</text>

          <!-- Extraction Column -->
          <rect x="480" y="20" width="370" height="440" rx="8" fill="rgba(14, 20, 32, 0.8)" stroke="rgba(16, 185, 129, 0.3)"/>
          <rect x="565" y="10" width="200" height="24" rx="4" fill="#10b981"/>
          <text x="665" y="26" fill="#07090e" font-size="11" font-weight="bold" text-anchor="middle">EXTRACTION (RECEIVER)</text>

          <!-- Receiver Steps -->
          <rect x="510" y="45" width="310" height="40" rx="6" fill="#1e293b" stroke="#10b981"/>
          <text x="665" y="69" fill="#34d399" font-size="11" text-anchor="middle">1. Input Stego Video</text>

          <line x1="665" y1="85" x2="665" y2="105" stroke="#10b981" stroke-width="2"/>

          <rect x="510" y="105" width="310" height="40" rx="6" fill="#101726" stroke="#00f2fe"/>
          <text x="665" y="129" fill="#00f2fe" font-size="11" text-anchor="middle">2. Preprocessing (Extract Frames)</text>

          <line x1="665" y1="145" x2="665" y2="165" stroke="#10b981" stroke-width="2"/>

          <rect x="510" y="165" width="310" height="40" rx="6" fill="#101726" stroke="#a855f7"/>
          <text x="665" y="189" fill="#c084fc" font-size="11" text-anchor="middle">3. Data Extraction (AFS + DWT + LSB)</text>

          <line x1="665" y1="205" x2="665" y2="225" stroke="#10b981" stroke-width="2"/>

          <rect x="510" y="225" width="310" height="40" rx="6" fill="#101726" stroke="#f43f5e"/>
          <text x="665" y="249" fill="#fb7185" font-size="11" text-anchor="middle">4. Reconstruct & AES-256 Decrypt</text>

          <line x1="665" y1="265" x2="665" y2="285" stroke="#10b981" stroke-width="2"/>

          <!-- Decision Diamond: Data Valid? -->
          <polygon points="665,285 735,315 665,345 595,315" fill="#101726" stroke="#fbbf24" stroke-width="1.5"/>
          <text x="665" y="318" fill="#fbbf24" font-size="10" font-weight="bold" text-anchor="middle">Data Valid?</text>

          <!-- Yes Path -->
          <line x1="665" y1="345" x2="665" y2="385" stroke="#10b981" stroke-width="2"/>
          <text x="675" y="365" fill="#10b981" font-size="10">Yes</text>

          <rect x="510" y="385" width="310" height="40" rx="6" fill="#101726" stroke="#10b981"/>
          <text x="665" y="409" fill="#34d399" font-size="11" text-anchor="middle">Output Recovered Secret Data</text>

          <!-- No Path -->
          <line x1="735" y1="315" x2="800" y2="315" stroke="#f43f5e" stroke-width="1.5"/>
          <text x="750" y="308" fill="#f43f5e" font-size="10">No</text>
          <rect x="800" y="295" width="90" height="40" rx="4" fill="#1e293b" stroke="#f43f5e"/>
          <text x="845" y="318" fill="#fb7185" font-size="9" text-anchor="middle">Error/Corrupted</text>
        </svg>
      </div>
    `;
  }

  static renderSystemFlow(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;

    el.innerHTML = `
      <div class="diagram-canvas">
        <svg viewBox="0 0 900 360" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <rect x="20" y="20" width="860" height="320" rx="10" fill="rgba(14, 20, 32, 0.8)" stroke="rgba(0, 242, 254, 0.3)"/>
          <text x="450" y="45" fill="#00f2fe" font-size="13" font-weight="bold" text-anchor="middle">END-TO-END SYSTEM FLOW (SENDER TO RECEIVER)</text>

          <!-- Flow Row 1: Sender -->
          <rect x="50" y="70" width="120" height="50" rx="6" fill="#1e293b" stroke="#64748b"/>
          <text x="110" y="99" fill="#f8fafc" font-size="10" text-anchor="middle">Cover Video</text>

          <line x1="170" y1="95" x2="210" y2="95" stroke="#00f2fe" stroke-width="2"/>

          <rect x="210" y="70" width="120" height="50" rx="6" fill="#101726" stroke="#00f2fe"/>
          <text x="270" y="92" fill="#00f2fe" font-size="10" text-anchor="middle">Preprocessing</text>
          <text x="270" y="106" fill="#94a3b8" font-size="9" text-anchor="middle">(AFS Selection)</text>

          <line x1="330" y1="95" x2="370" y2="95" stroke="#00f2fe" stroke-width="2"/>

          <rect x="370" y="70" width="150" height="50" rx="6" fill="#101726" stroke="#a855f7"/>
          <text x="445" y="92" fill="#c084fc" font-size="10" text-anchor="middle">2D-DWT + LSB Engine</text>
          <text x="445" y="106" fill="#94a3b8" font-size="9" text-anchor="middle">(AES-256 Encrypted)</text>

          <line x1="520" y1="95" x2="560" y2="95" stroke="#00f2fe" stroke-width="2"/>

          <rect x="560" y="70" width="120" height="50" rx="6" fill="#1e293b" stroke="#10b981"/>
          <text x="620" y="99" fill="#34d399" font-size="10" text-anchor="middle">Stego Video</text>

          <line x1="680" y1="95" x2="720" y2="95" stroke="#10b981" stroke-width="2"/>

          <rect x="720" y="70" width="130" height="50" rx="6" fill="#101726" stroke="#10b981"/>
          <text x="785" y="99" fill="#34d399" font-size="10" text-anchor="middle">Store / Transmit</text>

          <!-- Communication Channel Bridge -->
          <path d="M 785 120 L 785 180 L 110 180 L 110 230" fill="none" stroke="rgba(0, 242, 254, 0.4)" stroke-width="2" stroke-dasharray="6"/>
          <text x="450" y="174" fill="#00f2fe" font-size="10" font-weight="bold" text-anchor="middle">SECURE TRANSMISSION OVER NETWORK / STORAGE</text>

          <!-- Flow Row 2: Receiver -->
          <rect x="50" y="230" width="120" height="50" rx="6" fill="#1e293b" stroke="#10b981"/>
          <text x="110" y="259" fill="#34d399" font-size="10" text-anchor="middle">Received Stego</text>

          <line x1="170" y1="255" x2="210" y2="255" stroke="#10b981" stroke-width="2"/>

          <rect x="210" y="230" width="120" height="50" rx="6" fill="#101726" stroke="#00f2fe"/>
          <text x="270" y="252" fill="#00f2fe" font-size="10" text-anchor="middle">Preprocessing</text>
          <text x="270" y="266" fill="#94a3b8" font-size="9" text-anchor="middle">(AFS Filter)</text>

          <line x1="330" y1="255" x2="370" y2="255" stroke="#10b981" stroke-width="2"/>

          <rect x="370" y="230" width="150" height="50" rx="6" fill="#101726" stroke="#a855f7"/>
          <text x="445" y="252" fill="#c084fc" font-size="10" text-anchor="middle">2D-DWT LSB Extraction</text>
          <text x="445" y="266" fill="#94a3b8" font-size="9" text-anchor="middle">(Extract bits)</text>

          <line x1="520" y1="255" x2="560" y2="255" stroke="#10b981" stroke-width="2"/>

          <rect x="560" y="230" width="120" height="50" rx="6" fill="#101726" stroke="#f43f5e"/>
          <text x="620" y="252" fill="#fb7185" font-size="10" text-anchor="middle">AES-256 Decrypt</text>
          <text x="620" y="266" fill="#94a3b8" font-size="9" text-anchor="middle">(Validate Key)</text>

          <line x1="680" y1="255" x2="720" y2="255" stroke="#10b981" stroke-width="2"/>

          <rect x="720" y="230" width="130" height="50" rx="6" fill="#1e293b" stroke="#10b981"/>
          <text x="785" y="259" fill="#34d399" font-size="10" text-anchor="middle">Secret Plaintext</text>
        </svg>
      </div>
    `;
  }

  static renderStateTransition(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;

    el.innerHTML = `
      <div class="diagram-canvas">
        <svg viewBox="0 0 900 380" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <!-- Embedding States -->
          <text x="50" y="35" fill="#00f2fe" font-size="12" font-weight="bold">EMBEDDING STATES (S0 - S5)</text>

          <!-- S0 -->
          <circle cx="90" cy="80" r="26" fill="#101726" stroke="#00f2fe" stroke-width="2"/>
          <text x="90" y="80" fill="#00f2fe" font-size="11" font-weight="bold" text-anchor="middle">S0</text>
          <text x="90" y="93" fill="#94a3b8" font-size="8" text-anchor="middle">Idle</text>

          <line x1="116" y1="80" x2="164" y2="80" stroke="#00f2fe" stroke-width="2"/>

          <!-- S1 -->
          <circle cx="190" cy="80" r="26" fill="#101726" stroke="#00f2fe" stroke-width="2"/>
          <text x="190" y="80" fill="#00f2fe" font-size="11" font-weight="bold" text-anchor="middle">S1</text>
          <text x="190" y="93" fill="#94a3b8" font-size="8" text-anchor="middle">Acquire</text>

          <line x1="216" y1="80" x2="264" y2="80" stroke="#00f2fe" stroke-width="2"/>

          <!-- S2 -->
          <circle cx="290" cy="80" r="26" fill="#101726" stroke="#00f2fe" stroke-width="2"/>
          <text x="290" y="80" fill="#00f2fe" font-size="11" font-weight="bold" text-anchor="middle">S2</text>
          <text x="290" y="93" fill="#94a3b8" font-size="8" text-anchor="middle">Preprocess</text>

          <line x1="316" y1="80" x2="364" y2="80" stroke="#00f2fe" stroke-width="2"/>

          <!-- S3 -->
          <circle cx="390" cy="80" r="26" fill="#101726" stroke="#a855f7" stroke-width="2"/>
          <text x="390" y="80" fill="#c084fc" font-size="11" font-weight="bold" text-anchor="middle">S3</text>
          <text x="390" y="93" fill="#94a3b8" font-size="8" text-anchor="middle">Embed</text>

          <line x1="416" y1="80" x2="464" y2="80" stroke="#00f2fe" stroke-width="2"/>

          <!-- S4 -->
          <circle cx="490" cy="80" r="26" fill="#101726" stroke="#10b981" stroke-width="2"/>
          <text x="490" y="80" fill="#34d399" font-size="11" font-weight="bold" text-anchor="middle">S4</text>
          <text x="490" y="93" fill="#94a3b8" font-size="8" text-anchor="middle">Reconstruct</text>

          <line x1="516" y1="80" x2="564" y2="80" stroke="#00f2fe" stroke-width="2"/>

          <!-- S5 -->
          <circle cx="590" cy="80" r="26" fill="#101726" stroke="#10b981" stroke-width="2"/>
          <text x="590" y="80" fill="#34d399" font-size="11" font-weight="bold" text-anchor="middle">S5</text>
          <text x="590" y="93" fill="#94a3b8" font-size="8" text-anchor="middle">Transmit</text>

          <!-- Extraction States -->
          <text x="50" y="210" fill="#10b981" font-size="12" font-weight="bold">EXTRACTION STATES (R0 - R5)</text>

          <!-- R0 -->
          <circle cx="90" cy="260" r="26" fill="#101726" stroke="#10b981" stroke-width="2"/>
          <text x="90" y="260" fill="#34d399" font-size="11" font-weight="bold" text-anchor="middle">R0</text>
          <text x="90" y="273" fill="#94a3b8" font-size="8" text-anchor="middle">Receive</text>

          <line x1="116" y1="260" x2="164" y2="260" stroke="#10b981" stroke-width="2"/>

          <!-- R1 -->
          <circle cx="190" cy="260" r="26" fill="#101726" stroke="#00f2fe" stroke-width="2"/>
          <text x="190" y="260" fill="#00f2fe" font-size="11" font-weight="bold" text-anchor="middle">R1</text>
          <text x="190" y="273" fill="#94a3b8" font-size="8" text-anchor="middle">Preprocess</text>

          <line x1="216" y1="260" x2="264" y2="260" stroke="#10b981" stroke-width="2"/>

          <!-- R2 -->
          <circle cx="290" cy="260" r="26" fill="#101726" stroke="#a855f7" stroke-width="2"/>
          <text x="290" y="260" fill="#c084fc" font-size="11" font-weight="bold" text-anchor="middle">R2</text>
          <text x="290" y="273" fill="#94a3b8" font-size="8" text-anchor="middle">Extract</text>

          <line x1="316" y1="260" x2="364" y2="260" stroke="#10b981" stroke-width="2"/>

          <!-- R3 -->
          <circle cx="390" cy="260" r="26" fill="#101726" stroke="#f43f5e" stroke-width="2"/>
          <text x="390" y="260" fill="#fb7185" font-size="11" font-weight="bold" text-anchor="middle">R3</text>
          <text x="390" y="273" fill="#94a3b8" font-size="8" text-anchor="middle">Decrypt</text>

          <line x1="416" y1="260" x2="464" y2="260" stroke="#10b981" stroke-width="2"/>

          <!-- R4 -->
          <circle cx="490" cy="260" r="26" fill="#101726" stroke="#fbbf24" stroke-width="2"/>
          <text x="490" y="260" fill="#fbbf24" font-size="11" font-weight="bold" text-anchor="middle">R4</text>
          <text x="490" y="273" fill="#94a3b8" font-size="8" text-anchor="middle">Validate</text>

          <line x1="516" y1="260" x2="564" y2="260" stroke="#10b981" stroke-width="2"/>

          <!-- R5 -->
          <circle cx="590" cy="260" r="26" fill="#101726" stroke="#10b981" stroke-width="2"/>
          <text x="590" y="260" fill="#34d399" font-size="11" font-weight="bold" text-anchor="middle">R5</text>
          <text x="590" y="273" fill="#94a3b8" font-size="8" text-anchor="middle">Output</text>
        </svg>
      </div>
    `;
  }
}

window.DiagramsRenderer = DiagramsRenderer;
