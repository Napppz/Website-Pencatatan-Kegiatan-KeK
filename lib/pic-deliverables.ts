/**
 * Helper types and utilities for PIC Deliverables & Progress Tracking
 */

export interface PicDeliverableParsedData {
  notes?: string;
  linkUrl?: string;
  linkTitle?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  updatedAt?: string;
  updatedByName?: string;
}

/**
 * Helper to parse deliverable description safely.
 * Supports JSON structure, falls back to plain text / url extraction.
 */
export function parsePicDeliverableDescription(
  desc?: string | null
): PicDeliverableParsedData {
  if (!desc || !desc.trim()) {
    return { notes: '', linkUrl: '', linkTitle: '' };
  }

  const trimmed = desc.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed);
      return {
        notes: parsed.notes || '',
        linkUrl: parsed.linkUrl || '',
        linkTitle: parsed.linkTitle || '',
        fileUrl: parsed.fileUrl || '',
        fileName: parsed.fileName || '',
        fileSize: typeof parsed.fileSize === 'number' ? parsed.fileSize : undefined,
        fileType: parsed.fileType || '',
        updatedAt: parsed.updatedAt || '',
        updatedByName: parsed.updatedByName || '',
      };
    } catch {
      // Fall through to plain text parsing
    }
  }

  // Fallback: extract URL from raw string if present
  const urlMatch = desc.match(/(https?:\/\/[^\s]+)/g);
  return {
    notes: desc,
    linkUrl: urlMatch ? urlMatch[0] : '',
    linkTitle: '',
  };
}
