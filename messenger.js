// Download the helper library from https://www.twilio.com/docs/node/install
// Find your Account SID and Auth Token at twilio.com/console
// and set the environment variables. See http://twil.io/secure
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromphone = process.env.TWILIO_PHONE_NUMBER;
const client = require('twilio')(accountSid, authToken);

const messenger = {
    sendmessege: function (tophone){
        client.messages
            .create({
                body: 'This is the ship that made the Kessel Run in fourteen parsecs?',
                from: fromphone,
                to: tophone
            })
            .then(message => console.log(message.sid));
    }
};

module.exports = messenger