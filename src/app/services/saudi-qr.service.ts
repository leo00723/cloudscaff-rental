import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SaudiQrService {
  constructor() {}

  generateQrCode(
    sellerName: string,
    vatNumber: string,
    timestamp: string,
    totalAmount: number,
    vatAmount: number
  ): string {
    // Format the timestamp if it's a Date object
    const formattedTimestamp =
      typeof timestamp === 'object'
        ? this.formatTimestamp(timestamp as Date)
        : timestamp;

    // Format amounts to 2 decimal places
    const totalAmountStr = totalAmount.toFixed(2);
    const vatAmountStr = vatAmount.toFixed(2);

    // Create the TLV byte array
    const tlvData = this.createTLVArray([
      { tag: 1, value: sellerName },
      { tag: 2, value: vatNumber },
      { tag: 3, value: formattedTimestamp },
      { tag: 4, value: totalAmountStr },
      { tag: 5, value: vatAmountStr },
    ]);

    // Convert to base64
    return this.arrayBufferToBase64(tlvData);
  }

  private createTLVArray(fields: { tag: number; value: string }[]): Uint8Array {
    // Calculate the total length needed for the byte array
    let totalLength = 0;
    for (const field of fields) {
      // 1 byte for tag + 1 byte for length + bytes for UTF-8 encoded value
      const valueBytes = new TextEncoder().encode(field.value);
      totalLength += 2 + valueBytes.length;
    }

    // Create the byte array
    const result = new Uint8Array(totalLength);
    let offset = 0;

    // Add each field to the byte array
    for (const field of fields) {
      const valueBytes = new TextEncoder().encode(field.value);

      // Add tag (1 byte)
      result[offset++] = field.tag;

      // Add length (1 byte)
      result[offset++] = valueBytes.length;

      // Add value (variable length)
      result.set(valueBytes, offset);
      offset += valueBytes.length;
    }

    return result;
  }

  private formatTimestamp(date: Date): string {
    return date.toISOString().split('.')[0] + 'Z';
  }

  private arrayBufferToBase64(buffer: Uint8Array): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;

    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }

    return btoa(binary);
  }

  decodeQrCode(base64Data: string): any {
    try {
      const binaryData = atob(base64Data);
      const bytes = new Uint8Array(binaryData.length);

      for (let i = 0; i < binaryData.length; i++) {
        bytes[i] = binaryData.charCodeAt(i);
      }

      let offset = 0;
      const result: any = {};
      const textDecoder = new TextDecoder('utf-8');

      while (offset < bytes.length) {
        // Read tag
        const tag = bytes[offset++];

        // Read length
        const length = bytes[offset++];

        // Read value
        const valueBytes = bytes.slice(offset, offset + length);
        offset += length;

        const value = textDecoder.decode(valueBytes);

        // Map tag to field name
        switch (tag) {
          case 1:
            result.sellerName = value;
            break;
          case 2:
            result.vatNumber = value;
            break;
          case 3:
            result.timestamp = value;
            break;
          case 4:
            result.totalAmount = value;
            break;
          case 5:
            result.vatAmount = value;
            break;
          default:
            console.warn(`Unknown tag: ${tag}`);
        }
      }

      return result;
    } catch (error) {
      console.error('Error decoding QR code:', error);
      return null;
    }
  }
}
