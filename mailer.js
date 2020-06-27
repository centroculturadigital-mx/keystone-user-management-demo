var nodemailer = require('nodemailer');

var env = require('./env')

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL || env.email,
    pass: process.env.EMAIL_PWD || env.emailPassword
  }
});

const sendMail = ({emailTo, subject, text}) => {

  console.log(process.env.EMAIL || env.email,)
  console.log(process.env.EMAIL_PWD || env.emailPassword)
  
  var mailOptions = {
    from: process.env.EMAIL || env.email,
    to: emailTo,
    subject,
    text
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  }); 
}

module.exports = {sendMail}