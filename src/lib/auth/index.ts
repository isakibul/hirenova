import { badRequest } from "../../utils/error";
import { generateHash, hashMatched } from "../../utils/hashing";
import { generateToken } from "../token";
import { createUser, userExitsByEmail, userExitsByUsername } from "../user";

interface RegisterParams {
  username: string;
  email: string;
  password: string;
  role: string;
}

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

interface LoginParams {
  email: string;
  password: string;
}

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
