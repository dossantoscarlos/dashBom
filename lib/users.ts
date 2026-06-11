// Hash de senha com scrypt nativo (sem bcryptjs — npm SSL indisponível).
import { scryptSync, timingSafeEqual } from "node:crypto";

export type User = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
};

const users: User[] = [
  {
    id: "1",
    email: "admin@example.com",
    name: "Administrador",
    passwordHash:
      "demosalt12345678:2ae3e4e6506a89212beb986d0428e8b0a942db794e9dfba2859eee9111f49d0a5237eb20101d16d8192793d7976009770e7981324701109df82299a2a205ae7d",
  },
];

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;

  const derived = scryptSync(password, salt, 64);
  const storedBuffer = Buffer.from(hash, "hex");
  if (derived.length !== storedBuffer.length) return false;

  return timingSafeEqual(derived, storedBuffer);
}

export function findUserByEmail(email: string): User | undefined {
  return users.find((user) => user.email === email.toLowerCase().trim());
}

export function validateCredentials(
  email: string,
  password: string,
): Omit<User, "passwordHash"> | null {
  const user = findUserByEmail(email);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return null;
  }

  const { passwordHash: _, ...safeUser } = user;
  return safeUser;
}
