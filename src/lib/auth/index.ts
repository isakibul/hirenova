/**
 * Authentication service module
 * @module lib/auth
 */
import { badRequest } from "../../utils/error";
import { generateHash, hashMatched } from "../../utils/hashing";
import { generateToken } from "../token";
import { createUser, userExitsByEmail, userExitsByUsername } from "../user";

/**
 * Parameters for user registration
 * @interface RegisterParams
 */
interface RegisterParams {
  /** User's username */
  username: string;
  /** User's email address */
  email: string;
  /** User's password */
  password: string;
  /** User's role */
  role: string;
}

/**
 * Registers a new user
 * @async
 * @param {RegisterParams} params - Registration parameters
 * @returns {Promise<any>} Created user object
 * @throws {Error} If user already exists
 */
const register = async ({
  username,
  email,
  password,
  role,
}: RegisterParams): Promise<any> => {
  const hasUserByEmail = await userExitsByEmail(email);
  const hasUserByUsername = await userExitsByUsername(username);

  if (hasUserByEmail || hasUserByUsername) {
    throw badRequest("User already exists");
  }

  const hashedPassword = await generateHash(password);

  const user = await createUser({
    username,
    email,
    password: hashedPassword,
    role,
  });

  return user;
};

/**
 * Parameters for user login
 * @interface LoginParams
 */
interface LoginParams {
  /** User's email address */
  email: string;
  /** User's password */
  password: string;
}

/**
 * Authenticates a user and generates JWT token
 * @async
 * @param {LoginParams} params - Login credentials
 * @returns {Promise<string>} JWT access token
 * @throws {Error} If credentials are invalid
 */
const login = async ({ email, password }: LoginParams): Promise<string> => {
  const user = await userExitsByEmail(email);

  if (!user) {
    throw badRequest("Invalid credentials");
  }

  const matched = await hashMatched(password, user.password);
  if (!matched) {
    throw badRequest("Invalid credentials");
  }

  const payload = {
    id: user.id,
    name: (user as any).name,
    email: user.email,
    role: user.role,
  };

  return generateToken({ payload });
};

export { login, register };
