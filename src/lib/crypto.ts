// Helper function to convert ArrayBuffer to Hex string
function bufferToHex(buffer: ArrayBuffer | Uint8Array<ArrayBuffer>) {
  return [...new Uint8Array(buffer)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Helper function to convert Hex string to ArrayBuffer
function hexToBuffer(hex: string) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes.buffer;
}

// Use the Web Crypto API (native to Cloudflare Workers) for password hashing.
// This is secure, fast, and has no external dependencies.
export async function cryptoHash(password: string) {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16)); // 16-byte salt
  const iterations = 100000; // PBKDF2 iterations
  const keyAlgorithm = { name: "PBKDF2" };

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    keyAlgorithm,
    false,
    ["deriveBits"]
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: iterations,
      hash: "SHA-256",
    },
    keyMaterial,
    256 // 256-bit hash
  );

  const saltHex = bufferToHex(salt);
  const hashHex = bufferToHex(derivedBits);

  // Store all parameters needed for verification in a single string.
  return `pbkdf2-sha256:${iterations}:${saltHex}:${hashHex}`;
}

export async function cryptoVerify(password: string, storedHash: string) {
  const encoder = new TextEncoder();
  const [algorithm, iterationsStr, saltHex, originalHashHex] =
    storedHash.split(":");

  if (algorithm !== "pbkdf2-sha256") {
    throw new Error("Unsupported hash algorithm");
  }

  const iterations = parseInt(iterationsStr, 10);
  const salt = hexToBuffer(saltHex);
  const keyAlgorithm = { name: "PBKDF2" };

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    keyAlgorithm,
    false,
    ["deriveBits"]
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: iterations,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  );

  const newHashHex = bufferToHex(derivedBits);
  return newHashHex === originalHashHex;
}
