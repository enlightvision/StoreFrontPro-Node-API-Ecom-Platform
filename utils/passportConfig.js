import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import FacebookStrategy from "passport-facebook";
import userModel from "../models/user.model.js";

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/v1/user/auth/google/callback",
      // callbackURL: "http://localhost:5000/api/v1/user/auth/google/callback",
      passReqToCallback: true,
    },
    async (req, token, _, profile, done) => {
      try {
        let user = await userModel.findOneAndUpdate(
          {
            email: profile._json.email,
          },
          {
            "googleProvider.id": profile.id,
            "googleProvider.token": token,
            email: profile._json.email,
            firstName: profile._json.given_name,
            lastName: profile._json.family_name,
            provider: profile.provider,
            avatar: profile._json.picture,
          },
          { new: true }
        );
        if (!user) {
          user = await new userModel({
            "googleProvider.id": profile.id,
            "googleProvider.token": token,
            email: profile._json.email,
            firstName: profile._json.given_name,
            lastName: profile._json.family_name,
            provider: profile.provider,
            avatar: profile._json.picture,
          }).save();
        }
        done(null, user);
      } catch (error) {
        console.error(error);
        done(error, null);
      }
    }
  )
);

// // Facebook Strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: "/api/v1/user/auth/facebook/callback",
      profileFields: ["id", "displayName", "photos", "email"],
    },
    async (token, _, req, profile, done) => {
      try {
        let user = await userModel.findOneAndUpdate(
          {
            email: profile._json.email,
          },
          {
            "facebookProvider.id": profile.id,
            "facebookProvider.token": token,
            email: profile._json.email,
            firstName: profile._json.name.split(" ")[0],
            lastName: profile._json.name.split(" ")[1],
            avatar: profile._json.picture.data.url,
            provider: profile.provider,
          },
          { new: true }
        );
        if (!user) {
          user = await new userModel({
            "facebookProvider.id": profile.id,
            "facebookProvider.token": token,
            email: profile._json.email,
            firstName: profile._json.name.split(" ")[0],
            lastName: profile._json.name.split(" ")[1],
            avatar: profile._json.picture.data.url,
            provider: profile.provider,
          }).save();
        }
        done(null, user);
      } catch (error) {
        console.error(error);
        done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await userModel.findById(id);
  done(null, user);
});
