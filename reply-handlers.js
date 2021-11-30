const express = require('express');
const bodyParser = require('body-parser');
const MessagingResponse = require('twilio').twiml.MessagingResponse;

const app = express();

app.post('/sms', (req, res) => {
    const twiml = new MessagingResponse();

    console.log(req.body)
    twiml.message('<Response></Response>');

    res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(twiml.toString());
});