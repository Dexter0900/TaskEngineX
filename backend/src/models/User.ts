import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  email: string;
  firstName: string;
  lastName: string;
  password?: string; // Optional for google users
  avatar?: string;
  googleId?: string;
  provider: ("google" | "magic-link")[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    password: { type: String }, // hashed password
    avatar: {
      type: String,
    },
    googleId: {
      type: String,
      sparse: true,
    },
    provider: {
      type: [String],
      enum: ["google", "magic-link"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>("User", userSchema);
