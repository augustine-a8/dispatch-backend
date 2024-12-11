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

export { hashPassword, verifyPassword };
