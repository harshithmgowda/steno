"""
Least Significant Bit (LSB) Steganography Core Module
Provides secure embedding and lossless extraction of secret data
across chosen video frames.
"""

import zlib
import struct
from typing import List, Tuple, Optional
import numpy as np


class LSBStegoEngine:
    """
    LSB Steganography Engine for Video Frames.
    Applies 1-bit or 2-bit LSB substitution across RGB color channels
    of selected frames with header integrity verification (CRC32).
    """

    MAGIC_HEADER = b"AFS\x01"  # 4-byte identifier

    def __init__(self, bits_per_channel: int = 1):
        """
        :param bits_per_channel: Number of LSBs to modify per color channel (default: 1)
        """
        if bits_per_channel not in (1, 2):
            raise ValueError("bits_per_channel must be either 1 or 2.")
        self.bits_per_channel = bits_per_channel

    @staticmethod
    def bytes_to_bits(data_bytes: bytes) -> List[int]:
        """Convert bytes sequence to a list of integer bits (0 or 1)."""
        bits = []
        for byte in data_bytes:
            for i in range(7, -1, -1):
                bits.append((byte >> i) & 1)
        return bits

    @staticmethod
    def bits_to_bytes(bits: List[int]) -> bytes:
        """Convert a list of integer bits (0 or 1) back into bytes."""
        byte_list = bytearray()
        for i in range(0, len(bits) - (len(bits) % 8), 8):
            byte_val = 0
            for bit in bits[i : i + 8]:
                byte_val = (byte_val << 1) | bit
            byte_list.append(byte_val)
        return bytes(byte_list)

    def calculate_capacity(self, frames: List[np.ndarray], selected_indices: List[int]) -> dict:
        """
        Calculates the maximum embedding capacity for the selected frames in bytes.
        """
        total_pixels = sum(
            frames[idx].size for idx in selected_indices if idx < len(frames)
        )
        total_bits = total_pixels * self.bits_per_channel
        max_bytes = (total_bits // 8) - 16  # Reserve 16 bytes for header + CRC
        return {
            "selected_frames": len(selected_indices),
            "total_available_bits": total_bits,
            "max_payload_bytes": max(0, max_bytes),
            "max_payload_kb": round(max(0, max_bytes) / 1024, 2),
        }

    def _prepare_packet(self, payload: bytes) -> bytes:
        """
        Prepares a framed stego packet:
        [4 bytes MAGIC] + [4 bytes length (uint32)] + [4 bytes CRC32] + [Payload]
        """
        length = len(payload)
        crc = zlib.crc32(payload) & 0xFFFFFFFF
        header = self.MAGIC_HEADER + struct.pack(">II", length, crc)
        return header + payload

    def embed(
        self,
        frames: List[np.ndarray],
        selected_indices: List[int],
        secret_data: str | bytes
    ) -> Tuple[List[np.ndarray], dict]:
        """
        Embeds secret data into the LSBs of the designated frame indices.

        :param frames: List of original video frames (numpy arrays)
        :param selected_indices: Frame indices chosen by AFS
        :param secret_data: String or bytes containing the secret payload
        :return: (modified_stego_frames, embedding_summary)
        """
        if isinstance(secret_data, str):
            payload_bytes = secret_data.encode("utf-8")
        else:
            payload_bytes = secret_data

        packet = self._prepare_packet(payload_bytes)
        packet_bits = self.bytes_to_bits(packet)
        total_packet_bits = len(packet_bits)

        # Clone frames so we don't modify originals in-place
        stego_frames = [f.copy() for f in frames]

        capacity_info = self.calculate_capacity(frames, selected_indices)
        if total_packet_bits > capacity_info["total_available_bits"]:
            raise ValueError(
                f"Payload too large! Need {total_packet_bits} bits, but selected frames "
                f"only accommodate {capacity_info['total_available_bits']} bits."
            )

        bit_cursor = 0
        frames_altered = 0

        # LSB bitmask: for 1 bit -> ~1 (0xFE), mask = 1
        mask = (1 << self.bits_per_channel) - 1
        inv_mask = 255 - mask

        for idx in selected_indices:
            if bit_cursor >= total_packet_bits:
                break

            frame = stego_frames[idx]
            flat_view = frame.reshape(-1)
            frames_altered += 1

            for i in range(len(flat_view)):
                if bit_cursor >= total_packet_bits:
                    break

                if self.bits_per_channel == 1:
                    bit = packet_bits[bit_cursor]
                    flat_view[i] = (flat_view[i] & 0xFE) | bit
                    bit_cursor += 1
                elif self.bits_per_channel == 2:
                    if bit_cursor + 1 < total_packet_bits:
                        two_bits = (packet_bits[bit_cursor] << 1) | packet_bits[bit_cursor + 1]
                        bit_cursor += 2
                    else:
                        two_bits = packet_bits[bit_cursor] << 1
                        bit_cursor += 1
                    flat_view[i] = (flat_view[i] & inv_mask) | two_bits

        summary = {
            "payload_bytes": len(payload_bytes),
            "total_bits_embedded": total_packet_bits,
            "selected_frames_count": len(selected_indices),
            "frames_utilized": frames_altered,
            "bits_per_channel": self.bits_per_channel,
        }

        return stego_frames, summary

    def extract(
        self,
        stego_frames: List[np.ndarray],
        selected_indices: List[int]
    ) -> Tuple[Optional[bytes], dict]:
        """
        Extracts secret data from the LSBs of the designated frame indices.

        :param stego_frames: Stego video frames
        :param selected_indices: Same AFS selected indices used during embedding
        :return: (extracted_bytes_or_none, extraction_metadata)
        """
        # Header size in bits: 4 (Magic) + 4 (Len) + 4 (CRC) = 12 bytes = 96 bits
        HEADER_BITS_COUNT = 96

        extracted_bits = []
        payload_bytes = None
        expected_len = None
        expected_crc = None
        is_valid = False
        status_msg = ""

        # Step 1: Stream bits from selected frames
        for idx in selected_indices:
            if idx >= len(stego_frames):
                continue

            frame = stego_frames[idx]
            flat_view = frame.reshape(-1)

            for val in flat_view:
                if self.bits_per_channel == 1:
                    extracted_bits.append(int(val & 1))
                elif self.bits_per_channel == 2:
                    extracted_bits.append(int((val >> 1) & 1))
                    extracted_bits.append(int(val & 1))

                # Check if we have gathered the full packet
                if len(extracted_bits) == HEADER_BITS_COUNT and expected_len is None:
                    header_bytes = self.bits_to_bytes(extracted_bits[:HEADER_BITS_COUNT])
                    magic = header_bytes[0:4]
                    if magic != self.MAGIC_HEADER:
                        status_msg = "Invalid Magic Header - Stego signature not found."
                        return None, {"status": "error", "message": status_msg}

                    expected_len, expected_crc = struct.unpack(">II", header_bytes[4:12])

                if expected_len is not None:
                    total_required_bits = HEADER_BITS_COUNT + (expected_len * 8)
                    if len(extracted_bits) >= total_required_bits:
                        break

            if expected_len is not None and len(extracted_bits) >= (HEADER_BITS_COUNT + expected_len * 8):
                break

        if expected_len is None:
            return None, {"status": "error", "message": "Failed to read full packet header."}

        total_required_bits = HEADER_BITS_COUNT + (expected_len * 8)
        if len(extracted_bits) < total_required_bits:
            return None, {
                "status": "error",
                "message": f"Incomplete packet: expected {total_required_bits} bits, read {len(extracted_bits)}."
            }

        payload_bits = extracted_bits[HEADER_BITS_COUNT : total_required_bits]
        payload_bytes = self.bits_to_bytes(payload_bits)

        actual_crc = zlib.crc32(payload_bytes) & 0xFFFFFFFF
        if actual_crc == expected_crc:
            is_valid = True
            status_msg = "Integrity check PASSED (CRC32 Match)."
        else:
            status_msg = f"Integrity check FAILED: CRC mismatch (Expected {expected_crc}, got {actual_crc})."

        meta = {
            "status": "success" if is_valid else "corrupted",
            "message": status_msg,
            "payload_length_bytes": len(payload_bytes) if payload_bytes else 0,
            "crc_verified": is_valid,
        }

        return payload_bytes, meta
