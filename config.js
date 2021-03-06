'use strict';

require('dotenv-safe').config();

const cfg = {};

// HTTP Port to run our web application
cfg.port = process.env.PORT || 3000;

// A random string that will help generate secure one-time passwords and
// HTTP sessions
cfg.secret = process.env.APP_SECRET || 'keyboard cat';

// Your Twilio account SID and auth token, both found at:
// https://www.twilio.com/user/account
//
// A good practice is to store these string values as system environment
// variables, and load them from there as we are doing below. Alternately,
// you could hard code these values here as strings.
cfg.twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
cfg.twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;

// A Twilio number you control - choose one from:
// Specify in E.164 format, e.g. "+16519998877"
cfg.twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// MongoDB connection string - MONGO_URL is for local dev,
// MONGOLAB_URI is for the MongoLab add-on for Heroku deployment
// cfg.mongoUrl = process.env.MONGOLAB_URI || process.env.MONGO_URL;
// cfg.mongoUrlTest = process.env.MONGO_URL_TEST;

cfg.FirebaseApiKey = process.env.FIREBASE_API_KEY;
cfg.FirebaseAuthDomain = process.env.FIREBASE_AUTHDOMAIN;
cfg.FirebaseProjectID = process.env.FIREBASE_PROJECTID;
cfg.FirebaseStorageBucket = process.env.FIREBASE_STORAGEBUCKET;
cfg.FirebaseMessagingSenderID = process.env.FIREBASE_MESSAGING_SENDER_ID;
cfg.FirebaseAppID = process.env.FIREBASE_APPID;

cfg.GoogleApplicationType = process.env.GOOGLE_APPLICATION_TYPE;
cfg.GoogleApplicationProjectID = process.env.GOOGLE_APPLICATION_PROJECT_ID;
cfg.GoogleApplicationKeyID = process.env.GOOGLE_APPLICATION_PRIVATE_KEY_ID;
cfg.GoogleApplicationPrivateKey = process.env.GOOGLE_APPLICATION_PRIVATE_KEY;
cfg.GoogleApplicationClientEmail = process.env.GOOGLE_APPLICATION_CLIENT_EMAIL;
cfg.GoogleApplicationClientID = process.env.GOOGLE_APPLICATION_CLIENT_ID;
cfg.GoogleApplicationAuthURI = process.env.GOOGLE_APPLICATION_AUTH_URI;
cfg.GoogleApplicationTokenURI = process.env.GOOGLE_APPLICATION_TOKEN_URI;
// eslint-disable-next-line max-len
cfg.GoogleApplicationAuthProviderX509CertUrl = process.env.GOOGLE_APPLICATION_AUTH_PROVIDER_X509_CERT_URL;
// eslint-disable-next-line max-len
cfg.GoogleApplicationClientX509CertUrl = process.env.GOOGLE_APPLICATION_CLIENT_X509_CERT_URL;

cfg.GoogleApplicationJSON = process.env.GOOGLE_APPLICATION_JSON;

cfg.FirebaseDBUrl = process.env.FIREBASE_DB_URL;

// Export configuration object
module.exports = cfg;
