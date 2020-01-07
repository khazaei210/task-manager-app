const sgmail = require('@sendgrid/mail')

sgmail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcome = (email, name) =>{
    sgmail.send({
        to:email,
        from: 'iust.ecommerce90@gmail.com',
        subject: 'hello',
        text: `hi ${name} and welcome to my web app`
    })
}

const sayBy = (email, name) =>{
    sgmail.send({
        to:email,
        from: 'iust.ecommerce90@gmail.com',
        subject: 'by',
        text: `hi ${name} why did you leave my web app?`
    })
}
module.exports = {
    sendWelcome,
    sayBy
}