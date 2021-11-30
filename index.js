const express = require('express')
const app = express()
const path = require('path')
const PORT = process.env.PORT || 5000
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twiliophonenumber = process.env.TWILIO_PHONE_NUMBER;
const testphonnenumber = process.env.TEST_PHONE_NUMBER;
const client = require('twilio')(accountSid, authToken);

app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    res.render('pages/index')
})

app.listen(PORT, () => {
    console.log(`Listening on ${ PORT }`)
})
