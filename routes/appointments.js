'use strict';

const express = require('express');
const moment = require('moment');
const momentTimeZone = require('moment-timezone');
const Appointment = require('../models/appointment');
const router = new express.Router();


const getTimeZones = function() {
  return momentTimeZone.tz.names();
};

// GET: /appointments
router.get('/', function(req, res, next) {
    Appointment.find().then((appointments) => {
        res.render('appointments/index', {appointments: appointments});
    });
});

// GET: /appointments/create
router.get('/create', function(req, res, next) {
    res.render('appointments/create', {
        timeZones: getTimeZones(),
        appointment: Appointment.patientData({
            name: '',
            email: '',
            medication: '',
            phoneNumber: '',
            notification: '',
            timeZone: '',
            time: '',
        }),
    });
});

// POST: /appointments
router.post('/', function(req, res, next) {
  const notificationTime = moment(
      req.body.time, 'MM-DD-YYYY hh:mma').format('HH:mm');
  console.log(`notification time received ${notificationTime}`);
  const patient = Appointment.patientData({
      name: req.body.name,
      email: req.body.email,
      medication: req.body.medication,
      phoneNumber: req.body.phoneNumber,
      time: [notificationTime],
      timeZone: req.body.timeZone,
      notification: req.body.notification,
  });
    console.log(`patient notification time ${patient.Prescriptions[0].dosageTimes[0]}`);
  Appointment.doc(patient.email).set(patient)
  .then(function() {
      res.redirect('/');
    });
});

module.exports = router;
