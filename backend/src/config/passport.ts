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
        // Check if user exists
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          user = await User.findOne({ email });
        }
        if (user) {
          user.googleId = profile.id;
          user.provider = "google";
          user.avatar = profile.photos?.[0]?.value;
          await user.save();
        } else {
          // Create new user
          user = await User.create({
            googleId: profile.id,
            email: profile.emails?.[0]?.value || "",
            name: profile.displayName,
            avatar: profile.photos?.[0]?.value,
            provider: "google",
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