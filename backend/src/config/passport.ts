import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { ENV } from "./env.js";
import { User } from "../models/User.js";

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    // Configuration
    {
      clientID: ENV.GOOGLE_CLIENT_ID,
      clientSecret: ENV.GOOGLE_CLIENT_SECRET,
      callbackURL: ENV.GOOGLE_CALLBACK_URL,
    },
    // Verify callback
    async (accessToken, refreshToken, profile, done) => {
      try {

        const email = profile.emails?.[0]?.value;
        
        if (!email) {
          return done(new Error("No email found in Google profile"), undefined);
        }
        
        // Extract first name and last name from Google profile
        const firstName = profile.name?.givenName || profile.displayName.split(" ")[0] || "User";
        const lastName = profile.name?.familyName || profile.displayName.split(" ").slice(1).join(" ") || "";
        
        // Check if user exists
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          user = await User.findOne({ email });
        }
        
        if (user) {
          // Update existing user with Google provider
          await User.updateOne(
            { _id: user._id },
            {
              $addToSet: { provider: "google" },
              $set: { 
                googleId: profile.id,
                avatar: profile.photos?.[0]?.value || user.avatar
              }
            }
          );
        } else {
          // Create new user with first and last name from Google
          user = await User.create({
            googleId: profile.id,
            email: email,
            firstName: firstName,
            lastName: lastName,
            avatar: profile.photos?.[0]?.value,
            provider: ["google"],
            password: undefined, // No password for Google users
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  )
);

// Serialize and deserialize user
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;