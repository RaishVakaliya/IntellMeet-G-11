import passport from "passport";

// MOCK PASSPORT - no real Google auth needed for demo (signup/login with email/pass)
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

export default passport;
