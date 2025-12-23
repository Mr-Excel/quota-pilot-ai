import { User, IUser } from "@/lib/db/models/User";
import { connectDB } from "@/lib/db/connection";

export class UsersRepo {
  static async findByEmail(email: string): Promise<IUser | null> {
    await connectDB();
    return User.findOne({ email: email.toLowerCase() }).lean();
  }

  static async findById(id: string): Promise<IUser | null> {
    await connectDB();
    return User.findById(id).lean();
  }

  static async create(data: {
    email: string;
    name: string;
    passwordHash: string;
    role?: "manager" | "admin";
  }): Promise<IUser> {
    await connectDB();
    const user = new User(data);
    await user.save();
    return user.toObject();
  }

  static async update(id: string, data: Partial<IUser>): Promise<IUser | null> {
    await connectDB();
    return User.findByIdAndUpdate(id, data, { new: true }).lean();
  }
}

