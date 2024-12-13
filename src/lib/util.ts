import crypto from "crypto";

function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");

  return `${salt}$${hash}`;
}

function verifyPassword(password: string, storedValue: string) {
  const [salt, storedHash] = storedValue.split("$");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return hash === storedHash;
}

function generateUsername(baseString: string): string {
  const randomSuffix = Math.floor(Math.random() * 10000);
  const sanitizedBase = baseString.trim().toLowerCase().replace(/\s+/g, "_");
  return `${sanitizedBase}_${randomSuffix}`;
}

function generatePassword(length: number = 12): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_-+=<>"; // Character set for the password
  return Array.from(crypto.randomFillSync(new Uint8Array(length)))
    .map((byte) => chars[byte % chars.length])
    .join("");
}

export { hashPassword, verifyPassword, generatePassword, generateUsername };
