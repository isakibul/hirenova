import { IUser, User } from "../../model";
import { notFound } from "../../utils/error";

const findUserByEmail = async (email: string): Promise<IUser | false> => {
  const user = await User.findOne({ email });
  return user ? user : false;
};

const findUserByUsername = async (username: string): Promise<IUser | false> => {
  const user = await User.findOne({ username });
  return user ? user : false;
};

const findUserById = async (id: string): Promise<IUser | null> => {
  return await User.findById(id);
};

const userExitsByEmail = async (email: string): Promise<IUser | false> => {
  const user = await findUserByEmail(email);
  return user ? user : false;
};

const userExitsByUsername = async (
  username: string,
): Promise<IUser | false> => {
  const user = await findUserByUsername(username);
  return user ? user : false;
};

interface CreateUserParams {
  username: string;
  email: string;
  password: string;
  role: string;
}

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

interface GetAllUserParams {
  page: number;
  limit: number;
  sortType: string;
  sortBy: string;
  search: string;
}

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

const getSingleUser = async (id: string): Promise<any> => {
  const user = await User.findById(id);
  if (!user) {
    throw notFound("User not found");
  }
  return { ...(user as any)._doc, id: (user as any)._id.toString() };
};

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
