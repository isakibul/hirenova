/**
 * User service module for database operations
 * @module lib/user
 */
import { IUser, User } from "../../model";
import { notFound } from "../../utils/error";

/**
 * Finds a user by email address
 * @async
 * @param {string} email - User's email address
 * @returns {Promise<IUser | false>} User document or false if not found
 */
const findUserByEmail = async (email: string): Promise<IUser | false> => {
  const user = await User.findOne({ email });
  return user ? user : false;
};

/**
 * Finds a user by username
 * @async
 * @param {string} username - User's username
 * @returns {Promise<IUser | false>} User document or false if not found
 */
const findUserByUsername = async (username: string): Promise<IUser | false> => {
  const user = await User.findOne({ username });
  return user ? user : false;
};

/**
 * Finds a user by ID
 * @async
 * @param {string} id - User's unique identifier
 * @returns {Promise<IUser | null>} User document or null if not found
 */
const findUserById = async (id: string): Promise<IUser | null> => {
  return await User.findById(id);
};

/**
 * Checks if a user exists by email
 * @async
 * @param {string} email - User's email address
 * @returns {Promise<IUser | false>} User document or false if not found
 */
const userExitsByEmail = async (email: string): Promise<IUser | false> => {
  const user = await findUserByEmail(email);
  return user ? user : false;
};

/**
 * Checks if a user exists by username
 * @async
 * @param {string} username - User's username
 * @returns {Promise<IUser | false>} User document or false if not found
 */
const userExitsByUsername = async (
  username: string,
): Promise<IUser | false> => {
  const user = await findUserByUsername(username);
  return user ? user : false;
};

/**
 * Parameters for creating a new user
 * @interface CreateUserParams
 */
interface CreateUserParams {
  /** User's username */
  username: string;
  /** User's email address */
  email: string;
  /** User's password (hashed) */
  password: string;
  /** User's role */
  role: string;
}

/**
 * Creates a new user in the database
 * @async
 * @param {CreateUserParams} params - User creation parameters
 * @returns {Promise<any>} Created user document with ID
 */
const createUser = async ({
  username,
  email,
  password,
  role,
}: CreateUserParams): Promise<any> => {
  const user = new User({ username, email, password, role });
  await user.save();
  return { ...(user as any)._doc, id: user.id };
};

/**
 * Parameters for getting all users
 * @interface GetAllUserParams
 */
interface GetAllUserParams {
  /** Page number for pagination */
  page: number;
  /** Number of items per page */
  limit: number;
  /** Sort type (asc or dsc) */
  sortType: string;
  /** Field to sort by */
  sortBy: string;
  /** Search query string */
  search: string;
}

/**
 * Retrieves all users with pagination and search
 * @async
 * @param {GetAllUserParams} params - Query parameters
 * @returns {Promise<any[]>} Array of user documents
 */
const getAllUser = async ({
  page,
  limit,
  sortType,
  sortBy,
  search,
}: GetAllUserParams): Promise<any[]> => {
  const sortStr = `${sortType === "dsc" ? "-" : ""}${sortBy}`;
  const filter = search
    ? {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(filter)
    .sort(sortStr)
    .skip((page - 1) * limit)
    .limit(limit);

  return users.map((user: any) => ({
    ...user._doc,
    id: user.id,
  }));
};

/**
 * Counts total number of users matching search criteria
 * @async
 * @param {{ search?: string }} params - Count parameters
 * @returns {Promise<number>} Total count of users
 */
const count = async ({ search = "" }: { search?: string }): Promise<number> => {
  const filter = search
    ? {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      }
    : {};

  return User.countDocuments(filter);
};

/**
 * Retrieves a single user by ID
 * @async
 * @param {string} id - User's unique identifier
 * @returns {Promise<any>} User document
 * @throws {Error} If user not found
 */
const getSingleUser = async (id: string): Promise<any> => {
  const user = await User.findById(id);
  if (!user) {
    throw notFound("User not found");
  }
  return { ...(user as any)._doc, id: (user as any)._id.toString() };
};

/**
 * Removes a user from the database
 * @async
 * @param {string} id - User's unique identifier
 * @returns {Promise<IUser | null>} Deleted user document
 * @throws {Error} If user not found
 */
const removeUser = async (id: string): Promise<IUser | null> => {
  const user = await User.findByIdAndDelete(id);
  if (!user) {
    throw notFound("User not found");
  }
  return User.findByIdAndDelete(id);
};

export {
  count,
  createUser,
  findUserByEmail,
  findUserById,
  getAllUser,
  getSingleUser,
  removeUser,
  userExitsByEmail,
  userExitsByUsername,
};
