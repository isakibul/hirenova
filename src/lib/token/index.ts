import jwt, { Algorithm, JwtPayload, SignOptions } from "jsonwebtoken";
import { serverError } from "../../utils/error";

interface GenerateTokenOptions {
  payload: Record<string, any>;
  algorithm?: Algorithm;
  secret?: string;
  expiresIn?: SignOptions["expiresIn"];
}

interface DecodeTokenOptions {
  token: string;
}

interface VerifyTokenOptions {
  token: string;
  algorithm?: Algorithm;
  secret?: string;
}

const generateToken = ({
  payload,
  algorithm = "HS256",
  secret = process.env.ACCESS_TOKEN_SECRET,
  expiresIn = "300h",
}: GenerateTokenOptions): string => {
  try {
    return jwt.sign(payload, secret!, { algorithm, expiresIn });
  } catch (e) {
    throw serverError();
  }
};

const decodeToken = ({ token }: DecodeTokenOptions): JwtPayload | null => {
  try {
    return jwt.decode(token) as JwtPayload | null;
  } catch (e) {
    throw serverError();
  }
};

const verifyToken = ({
  token,
  algorithm = "HS256",
  secret = process.env.ACCESS_TOKEN_SECRET,
}: VerifyTokenOptions): JwtPayload => {
  try {
    return jwt.verify(token, secret!, {
      algorithms: [algorithm],
    }) as JwtPayload;
  } catch (e) {
    throw serverError();
  }
};

const generateEmailToken = (payload: Record<string, any>): string => {
  return jwt.sign(payload, process.env.EMAIL_SECRET!, { expiresIn: "1d" });
};

const verifyEmailToken = (token: string): JwtPayload => {
  return jwt.verify(token, process.env.EMAIL_SECRET!) as JwtPayload;
};

export {
  decodeToken,
  generateEmailToken,
  generateToken,
  verifyEmailToken,
  verifyToken,
};
