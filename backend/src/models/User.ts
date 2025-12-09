import mongoose, { Schema, Document} from "mongoose";

export interface IUser extends Document {
    email: string;
    name?: string;
    password?: string;
    provider: "google" | "passwordless" | "email-password";
    googleId?: string;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        name: {
            type: String,
        },
        password: {
            type: String,
        },
        provider: {
            type: String,
            enum: ["google", "passwordless", "email-password"],
            required: true,
        },
        googleId: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

export const User = mongoose.model<IUser>("User", UserSchema);