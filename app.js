'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const access_token = "EAAIM30ZBXoioBAA0fZCXx2ydHZB4y0KmINNQsijzu1TVic8dIaRrSOqDFP990KRRBIZBfYIKthCPntUdWyXga06bHZAFzawZC07V0v6AOiLA17snxwnIjIH8lQIabO6vTy7ZCJveBV7OV7lFsHCDTCWGkdxcGcA9w7sG3kW5iJ6JwZDZD"

const app = express();

app.set('port', 5000);
app.use(bodyParser.json());

app.get('/', function (req, response) {
    response.send('Hola Mundo!');
})

// Creando WebHook con especificaciones de facebook Messenger
app.get('/webhook', function (req, response) {
    if (req.query['hub.verify_token'] === 'pugpizza_token') { // Token que sera ingresado en la plataforma
        response.send(req.query['hub.challenge']);
    } else {
        response.send('Pug Pizza no tienes permisos.');
    }
});

app.post('/webhook/', function (req, res) { // Eneviando mensajes
    const webhook_event = req.body.entry[0];
    if (webhook_event.messaging) {
        webhook_event.messaging.forEach(event => {
            handleMessage(event);
        });
    }
    res.sendStatus(200);
});

function handleMessage(event) {
    const senderId = event.sender.id;
    const messageText = event.message.text;
    // const response;
    console.log(messageText)
    // if (messageText == 'hola') {
    //     response = 'hola, como estas'
    // }else{
    //     response ='sigueme hablando'
    // }
    const messageData = {
        recipient: {
            id: senderId
        },
        message: {
            text: messageText
        }
    }
    callSendApi(messageData);
}

function callSendApi(response) {
    request({
            "uri": "https://graph.facebook.com/me/messages",
            "qs": {
                "access_token": access_token
            },
            "method": "POST",
            "json": response
        },
        function (err) {
            if (err) {
                console.log('Ha ocurrido un error')
            } else {
                console.log('Mensaje enviado')
            }
        }
    )
}

app.listen(app.get('port'), function () {
    console.log('Nuestro servidor esta funcionando con el barto en el puerto: ', app.get('port'));
});