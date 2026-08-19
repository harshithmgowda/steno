/**
 * ==============================================================================
 * AES-256 CRYPTOGRAPHIC ENGINE (WebCrypto API)
 * Department of ISE, DBIT - Digital Video Steganography
 * ==============================================================================
 */

class CryptoEngine {
  /**
   * Derives a 256-bit AES key from a user password and salt using PBKDF2.
   */
  static async deriveKey(password, salt) {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      "raw",
      enc.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );

    return window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }

  /**
   * Encrypts plaintext using AES-256-GCM.
   * Returns { ciphertextHex, ivHex, saltHex, fullPacketHex, bitLength }
   */
  static async encryptAES256(plainText, password) {
    const enc = new TextEncoder();
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for GCM
    const key = await this.deriveKey(password, salt);

    const encryptedBuffer = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      key,
      enc.encode(plainText)
    );

    const ciphertext = new Uint8Array(encryptedBuffer);

    // Packet structure: [16 bytes Salt] + [12 bytes IV] + [4 bytes Length] + [Ciphertext]
    const lenBuffer = new Uint8Array(4);
    new DataView(lenBuffer.buffer).setUint32(0, ciphertext.length, false);

    const fullPacket = new Uint8Array(salt.length + iv.length + 4 + ciphertext.length);
    fullPacket.set(salt, 0);
    fullPacket.set(iv, salt.length);
    fullPacket.set(lenBuffer, salt.length + iv.length);
    fullPacket.set(ciphertext, salt.length + iv.length + 4);

    return {
      saltHex: this.bytesToHex(salt),
      ivHex: this.bytesToHex(iv),
      ciphertextHex: this.bytesToHex(ciphertext),
      fullPacket: fullPacket,
      packetHex: this.bytesToHex(fullPacket),
      totalBytes: fullPacket.length,
      totalBits: fullPacket.length * 8,
    };
  }

  /**
   * Decrypts an AES-256-GCM packet with password.
   */
  static async decryptAES256(fullPacket, password) {
    try {
      if (fullPacket.length < 32) {
        throw new Error("Invalid packet size: too short for AES-256 header.");
      }

      const salt = fullPacket.slice(0, 16);
      const iv = fullPacket.slice(16, 28);
      const dataLen = new DataView(fullPacket.buffer, fullPacket.byteOffset + 28, 4).getUint32(0, false);
      const ciphertext = fullPacket.slice(32, 32 + dataLen);

      const key = await this.deriveKey(password, salt);
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv: iv },
        key,
        ciphertext
      );

      const dec = new TextDecoder();
      return {
        success: true,
        plaintext: dec.decode(decryptedBuffer),
        error: null,
      };
    } catch (err) {
      return {
        success: false,
        plaintext: null,
        error: "AES-256 Decryption Failed: Invalid Secret Key or Corrupted Data.",
      };
    }
  }

  static bytesToHex(bytes) {
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  static hexToBytes(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return bytes;
  }

  static bytesToBits(bytes) {
    const bits = [];
    for (let i = 0; i < bytes.length; i++) {
      const byte = bytes[i];
      for (let j = 7; j >= 0; j--) {
        bits.push((byte >> j) & 1);
      }
    }
    return bits;
  }

  static bitsToBytes(bits) {
    const bytes = new Uint8Array(Math.floor(bits.length / 8));
    for (let i = 0; i < bytes.length; i++) {
      let byte = 0;
      for (let j = 0; j < 8; j++) {
        byte = (byte << 1) | bits[i * 8 + j];
      }
      bytes[i] = byte;
    }
    return bytes;
  }
}

// Export to global scope
window.CryptoEngine = CryptoEngine;
