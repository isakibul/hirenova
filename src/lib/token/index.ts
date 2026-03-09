import jwt, { Algorithm, JwtPayload, SignOptions } from "jsonwebtoken";
import { serverError } from "../../utils/error";

/**
 * Options for generating JWT tokens
 * @interface GenerateTokenOptions
 */
interface GenerateTokenOptions {
  payload: Record<string, any>;
  algorithm?: Algorithm;
  secret?: string;
  expiresIn?: SignOptions["expiresIn"];
}

/**
 * Options for decoding JWT tokens
 * @interface DecodeTokenOptions
 */
interface DecodeTokenOptions {
  /** The JWT token to decode */
  token: string;
}

/**
 * Options for verifying JWT tokens
 * @interface VerifyTokenOptions
 */
interface VerifyTokenOptions {
  token: string;
  algorithm?: Algorithm;
  secret?: string;
}

/**
 * Generates a JWT token
 * @param {GenerateTokenOptions} options - Token generation options
 * @returns {string} Signed JWT token
 * @throws {Error} If token generation fails
 */
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

/**
 * Decodes a JWT token (without verification)
 * @param {DecodeTokenOptions} options - Token decode options
 * @returns {JwtPayload | null} Decoded token payload or null
 * @throws {Error} If decoding fails
 */
const decodeToken = ({ token }: DecodeTokenOptions): JwtPayload | null => {
  try {
    return jwt.decode(token) as JwtPayload | null;
  } catch (e) {
    throw serverError();
  }
};

/**
 * Verifies a JWT token
 * @param {VerifyTokenOptions} options - Token verification options
 * @returns {JwtPayload} Decoded and verified token payload
 * @throws {Error} If token verification fails
 */
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

/**
 * Generates an email verification token
 * @param {Record<string, any>} payload - Data to encode
 * @returns {string} Signed JWT token (expires in 1 day)
 */
const generateEmailToken = (payload: Record<string, any>): string => {
  return jwt.sign(payload, process.env.EMAIL_SECRET!, { expiresIn: "1d" });
};

/**
 * Verifies an email verification token
 * @param {string} token - The email verification token
 * @returns {JwtPayload} Decoded token payload
 * @throws {Error} If token verification fails
 */
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
