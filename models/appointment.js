'use strict';

const cfg = require('../config');
const Twilio = require('twilio');
const moment = require('moment');
require('moment-timezone');
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

Appointment.patientData = function(data) {
    const document = {};
    if (('name' in data) &&
        ('email' in data) &&
        ('medication' in data) &&
        ('phoneNumber' in data) &&
        ('notification' in data) &&
        ('timeZone' in data) &&
        ('time' in data)) {
        const submitTime = moment(data.time).format('HH:mm');
        console.log(`submitting time ${submitTime}`);
        document.DocList = ['not_implemented_in_backend'];
        document.Notifications = [{
            fromEmail: 'not_implemented_in_backend',
            fromName: 'not_implemented_in_backend',
            notificationId: 'not_implemented_in_backend',
            textMsg: 'not_implemented_in_backend',
            time: 'not_implemented_in_backend',
            typeMsg: 'not_implemented_in_backend',
        }];
        document.Prescriptions = [{
            complianceChart: 'not_implemented_in_backend',
            docName: 'not_implemented_in_backend',
            doctorId: 'not_implemented_in_backend',
            dosageTimes: [submitTime],
            drugDosage: 'not_implemented_in_backend',
            drugFreq: 0,
            drugId: 'not_implemented_in_backend',
            drugName: data.medication,
        }];
        document.email = data.email;
        document.name = data.name;
        document.phoneNumber = data.phoneNumber;
    }
    return document;
};
Appointment.parse = function(document) {
    const out = [];
    // Get the prescription array
    let drugList = document.data().Prescriptions;
    if (Array.isArray(drugList)) {
        // Patient info
        const patient = {};
        patient['id'] = document.id;
        patient['email'] = document.data().email;
        patient['name'] = document.data().name;
        patient['phoneNumber'] = document.data().phoneNumber
            .replace(/-/g, '');

        // Not implemented in database
        patient['notification'] = 5;
        patient['timeZone'] = 'America/New_York';

        // Loop through all prescription to get the dosageTime
        drugList.forEach(function(med) {
            patient['medication'] = med.drugName;
            // med.dosageTimes is an array holding HH:MM formatted times
            for (let i = 0; Array.isArray(med.dosageTimes) &&
                 i < med.dosageTimes.length; i++) {
                let myTime = med.dosageTimes[i].split(':');
                const output = {};
                const h = parseInt(myTime[0], 10);
                const m = parseInt(myTime[1], 10);
                patient['daytime'] = {
                    'hour': h,
                    'minute': m,
                };
                patient.time = moment(
                    moment()
                        .startOf('day')
                        .add(patient.daytime.hour, 'hours')
                        .add(patient.daytime.minute, 'minutes'))
                    .tz(patient.timeZone)
                    .utc();
                // copy all fields from patient to output
                // to have a new object instance
                output.id = patient.id;
                output.email = patient.email;
                output.name = patient.name;
                output.phoneNumber = patient.phoneNumber;
                output.notification = patient.notification;
                output.timeZone = patient.timeZone;
                output.medication = patient.medication;
                output.daytime = patient.daytime;
                output.time = patient.time;
                out.push(output);
            }
        });
    }
    return out;
};

Appointment.find = function() {
    const out = [];
    return Appointment.get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            this.parse(doc).forEach((reminder) => {
                out.push(reminder);
            });
        });
        return out;
    });
};

Appointment.requiresNotification = function(appointment, targetDate) {
    const diffminutes =moment.duration(
        appointment.time.diff(
            moment(targetDate).utc()
        )).asMinutes();
    const flag = Math.round(diffminutes) === appointment.notification;
    console.log(`appointment ${appointment.name} in ${diffminutes}`);
    console.log(`    requiresNotification now? ${flag.toString()}`);
    return flag;
};

Appointment.sendNotifications = function(callback) {
  // now
  const searchDate = new Date();
  Appointment.find().then((appointments) => {
      appointments = appointments.filter(function(appointment) {
          return Appointment.requiresNotification(appointment, searchDate);
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
                to: `+ 1${appointment.phoneNumber}`,
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
