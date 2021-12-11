'use strict';

const cfg = require('../config');
const Twilio = require('twilio');
const debug = require('debug')('appointment-reminders-node:models:appointment');
const firebase = require('firebase-admin/app');
const {credential} = require('firebase-admin');
const firestore = require('firebase-admin/firestore');

// eslint-disable-next-line no-unused-vars
firebase.initializeApp({
    credential: credential.cert(
        JSON.parse(
            Buffer.from(
                cfg.GoogleApplicationJSON, 'base64'
            ).toString('ascii'))),
    databaseURL: cfg.FirebaseDBUrl,
});

const FireDB = firestore.getFirestore();

const Appointment = FireDB.collection('PatientCollection');

Appointment.find = function() {
    let out = [];
    Appointment.get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            // Get the prescription array
            let drugList = doc.data().Prescriptions;
            if (Array.isArray(drugList)) {
                // Patient info
                const patient = {};
                patient['name'] = doc.data().name;
                patient['phoneNumber'] = doc.data().phoneNumber;

                patient['notification'] = 5;
                patient['timeZone'] = 'America/New_York';

                // Loop through all prescription to get the dosageTime
                drugList.forEach(function(med) {
                    // med.dosageTimes is an array holding HH:MM formatted times
                    for (let i = 0; i < med.dosageTimes.length; i++) {
                        let myTime = med.dosageTimes[i].split(':');
                        patient['daytime'] = {
                            'hour': myTime[0],
                            'minute': myTime[1],
                        };
                        out.push(patient);
                    }
                });
            }
            debug(`doc ${JSON.stringify(doc.data())}`);
        });
    });
    debug(`appointments ${out}`);
    return out;
};

Appointment.requiresNotification = function(date) {
  return Math.round(moment.duration(moment(moment()
            .startOf('day')
            .add(this.daytime.hour, 'hours')
            .add(this.daytime.minute, 'minutes'))
          .tz(this.timeZone)
          .utc()
          .diff(moment(date).utc())
  ).asMinutes()) === this.notification;
};

Appointment.sendNotifications = function(callback) {
  // now
  const searchDate = new Date();
  this.find().forEach(function(appointments) {
      appointments = appointments.filter(function(appointment) {
              return appointment.requiresNotification(searchDate);
      });
      if (appointments.length > 0) {
        sendNotifications(appointments);
      }
    });

    /**
    * Send messages to all appointment owners via Twilio
    * @param {array} appointments List of appointments.
    */
    function sendNotifications(appointments) {
        const client = new Twilio(cfg.twilioAccountSid, cfg.twilioAuthToken);
        appointments.forEach(function(appointment) {
            // Create options to send the message
            const options = {
                to: `+ ${appointment.phoneNumber}`,
                from: cfg.twilioPhoneNumber,
                /* eslint-disable max-len */
                body: `Hi ${appointment.name}. Just a reminder that you need to take your ${appointment.medication}.`,
                /* eslint-enable max-len */
            };

            // Send the message!
            client.messages.create(options, function(err, response) {
                if (err) {
                    // Just log it for now
                    console.error(err);
                } else {
                    // Log the last few digits of a phone number
                    let masked = appointment.phoneNumber.substr(0,
                        appointment.phoneNumber.length - 5);
                    masked += '*****';
                    console.log(`Message sent to ${masked}`);
                }
            });
        });

        // Don't wait on success/failure, just indicate all messages have been
        // queued for delivery
        if (callback) {
          callback.call();
        }
    }
};

module.exports = Appointment;
