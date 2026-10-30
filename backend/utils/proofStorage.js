const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const STORAGE_DIR = path.resolve(__dirname, '../uploads/payment_proofs')
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

// Ensure destination directory exists
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true })
}

/**
 * Sniffs binary magic numbers from buffer to identify true file type
 * Prevents disguised files, executable binaries, HTML, or SVG execution
 * 
 * @param {Buffer} buffer 
 * @returns {{ mimeType: string, ext: string } | null}
 */
const sniffFileType = (buffer) => {
  if (!buffer || buffer.length < 8) return null

  // JPEG: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return { mimeType: 'image/jpeg', ext: 'jpg' }
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4E &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0D &&
    buffer[5] === 0x0A &&
    buffer[6] === 0x1A &&
    buffer[7] === 0x0A
  ) {
    return { mimeType: 'image/png', ext: 'png' }
  }

  // WebP: RIFF .... WEBP
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 && // 'RIFF'
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50    // 'WEBP'
  ) {
    return { mimeType: 'image/webp', ext: 'webp' }
  }

  // PDF: %PDF (25 50 44 46)
  if (
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46
  ) {
    return { mimeType: 'application/pdf', ext: 'pdf' }
  }

  return null
}

/**
 * Parses and decodes a base64 string or data URL into a binary Buffer
 * 
 * @param {string} dataString 
 * @returns {Buffer}
 */
const parseBase64Data = (dataString) => {
  if (!dataString || typeof dataString !== 'string') {
    throw new Error('Invalid proof data format. Expected base64 string.')
  }

  // Strip Data URL prefix if present: data:image/png;base64,...
  const match = dataString.match(/^data:([a-zA-Z0-9/+-]+);base64,(.+)$/)
  const cleanBase64 = match ? match[2] : dataString.replace(/\s/g, '')

  const buffer = Buffer.from(cleanBase64, 'base64')
  if (buffer.length === 0) {
    throw new Error('Payment proof document payload is empty.')
  }
  return buffer
}

/**
 * Saves a payment proof document securely to disk outside web root.
 * Validates size, magic numbers, and returns metadata.
 * 
 * @param {Object} params
 * @param {string} params.paymentId
 * @param {string} params.base64Data
 * @param {string} [params.originalName]
 * @returns {Promise<{ filename: string, originalName: string, mimeType: string, sizeBytes: number, uploadedAt: Date }>}
 */
const saveProofDocument = async ({ paymentId, base64Data, originalName = 'proof' }) => {
  const buffer = parseBase64Data(base64Data)

  if (buffer.length > MAX_FILE_SIZE) {
    const error = new Error(`Payment proof file exceeds maximum allowed size of 5MB (size: ${(buffer.length / (1024 * 1024)).toFixed(2)}MB)`)
    error.statusCode = 413
    throw error
  }

  const fileInfo = sniffFileType(buffer)
  if (!fileInfo) {
    const error = new Error('Unsupported file format. Payment proof must be an authentic JPEG, PNG, WebP image, or PDF document.')
    error.statusCode = 415
    throw error
  }

  // Clean originalName to prevent path traversal or special chars
  const sanitizedOriginalName = path.basename(originalName).replace(/[^a-zA-Z0-9._-]/g, '_')
  const uniqueToken = crypto.randomBytes(8).toString('hex')
  const filename = `proof_${paymentId || 'doc'}_${uniqueToken}.${fileInfo.ext}`
  const targetPath = path.join(STORAGE_DIR, filename)

  await fs.promises.writeFile(targetPath, buffer)

  return {
    filename,
    originalName: sanitizedOriginalName,
    mimeType: fileInfo.mimeType,
    sizeBytes: buffer.length,
    uploadedAt: new Date()
  }
}

/**
 * Resolves and validates proof file path on disk.
 * Defends against directory traversal attacks.
 * 
 * @param {string} filename 
 * @returns {string} Absolute file path
 */
const getProofFilePath = (filename) => {
  if (!filename || typeof filename !== 'string') {
    throw new Error('Invalid filename')
  }

  // Strictly use basename to eliminate any '../' attempts
  const safeName = path.basename(filename)
  const fullPath = path.resolve(STORAGE_DIR, safeName)

  // Ensure resolved path is strictly inside STORAGE_DIR
  if (!fullPath.startsWith(STORAGE_DIR)) {
    throw new Error('Access to requested file path is forbidden')
  }

  if (!fs.existsSync(fullPath)) {
    const error = new Error('Payment proof file not found on disk')
    error.statusCode = 404
    throw error
  }

  return fullPath
}

/**
 * Deletes a proof file from disk
 * 
 * @param {string} filename 
 */
const deleteProofDocument = async (filename) => {
  try {
    const filePath = getProofFilePath(filename)
    await fs.promises.unlink(filePath)
  } catch (err) {
    // If not found or already deleted, ignore
  }
}

module.exports = {
  saveProofDocument,
  getProofFilePath,
  deleteProofDocument,
  STORAGE_DIR,
  MAX_FILE_SIZE
}
