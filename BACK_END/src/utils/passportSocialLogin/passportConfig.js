import passport from "passport";

import { Strategy as GoogleStrategy } from "passport-google-oauth20";

const BELive="http://jobsearchbasemmouner.eu-4.evennode.com";

// const BELOCAO= "http://localhost:3000"

export const setupPassportStrategies = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${BELive}/auth/google/callback`,
        scope: ["profile", "email", "openid"], // Request ID token
        passReqToCallback: true, // Allows us to access the request object
      },
      async (req, accessToken, refreshToken, params, profile, done) => {
        try {
          const idToken = params.id_token; // Extract id_token from params

          if (!idToken) {
            console.error("ID Token is missing from Google's response");
            return done(null, false);
          }

          // console.log("ID Token:", idToken);
          // console.log("Access Token:", accessToken);
          // console.log("User Profile:", profile);

          return done(null, { profile, idToken });
        } catch (error) {
          console.error("Error extracting id_token:", error);
          return done(error, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });
};


