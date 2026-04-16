import passport from "passport";

<<<<<<< HEAD
// MOCK PASSPORT - no real Google auth needed for demo (signup/login with email/pass)
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));
=======
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const { id, displayName, emails, photos } = profile;
          const email = emails[0].value;

          let user = await User.findOne({
            $or: [{ googleId: id }, { email }],
          });

          if (!user) {
            user = await User.create({
              googleId: id,
              name: displayName,
              email,
              avatar: photos[0].value,
            });
          } else if (!user.googleId) {
            user.googleId = id;
            if (!user.avatar) user.avatar = photos[0].value;
            await user.save();
          }

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      },
    ),
  );
} else {
  console.log('Google OAuth disabled - missing env vars');
}
>>>>>>> updated frontend and backend files

export default passport;
