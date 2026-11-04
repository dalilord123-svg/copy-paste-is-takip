
import jwt, { type JwtPayload as JsonWebTokenPayload } from "jsonwebtoken";

export interface JwtPayload {
  id: string;
  username: string;
  role: string;
}

function getSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "JWT_SECRET eksik veya çok kısa. .env dosyasını kontrol edin."
    );
  }

  return secret;
}

export function signToken(payload: JwtPayload): string {
  if (!payload.id || !payload.username || !payload.role) {
    throw new Error("JWT için kullanıcı bilgileri eksik.");
  }

  return jwt.sign(payload, getSecret(), {
    expiresIn: "30d",
  });
}

export function verifyToken(token: string): JwtPayload {
  if (!token) {
    throw new Error("Token bulunamadı.");
  }

  const decoded = jwt.verify(token, getSecret());

  if (
    typeof decoded === "string" ||
    typeof decoded !== "object"
  ) {
    throw new Error("Geçersiz token.");
  }

  const payload = decoded as JsonWebTokenPayload & {
    id?: string;
    username?: string;
    role?: string;
  };

  if (
    typeof payload.id !== "string" ||
    typeof payload.username !== "string" ||
    typeof payload.role !== "string"
  ) {
    throw new Error("Token kullanıcı bilgileri geçersiz.");
  }

  return {
    id: payload.id,
    username: payload.username,
    role: payload.role,
  };
}
