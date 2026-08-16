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
      "demosalt12345678:4d29b189c68097adf09960101bf4cbb75fcc541f20457497f2f1d878a0cf06862d25ba45fdcf7c354160d782c38d2ce84e489500b5f2e67dd32eca440ad44bc3",
  },
  {
    id: "2",
    email: "suporte.n1@vertis.com.local",
    name: "Suporte N1",
    passwordHash:
      "demosalt12345678:4d29b189c68097adf09960101bf4cbb75fcc541f20457497f2f1d878a0cf06862d25ba45fdcf7c354160d782c38d2ce84e489500b5f2e67dd32eca440ad44bc3",
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
