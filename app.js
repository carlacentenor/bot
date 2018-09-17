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

app.get('/webhook', function (req, response) {
  if (req.query['hub.verify_token'] === 'pugpizza_token') {
    response.send(req.query['hub.challenge']);
  } else {
    response.send('PapaBot no tienes permisos.');
  }
});

app.post('/webhook/', function (req, res) {
  const webhook_event = req.body.entry[0];
  if (webhook_event.messaging) {
    webhook_event.messaging.forEach(event => {
      handleEvent(event.sender.id, event);
    });
  }
  res.sendStatus(200);
});

// Manejador de Eventos
function handleEvent(senderId, event) {
  // Obteniendo el Usuario
  var url = `https://graph.facebook.com/v2.6/${senderId}?access_token=${access_token}`;
  request.get({
    url: url,
    json: true,
    headers: {
      'User-Agent': 'request'
    }
  }, (err, res, data) => {
    if (err) {
      console.log('Error:', err);
    } else if (res.statusCode !== 200) {
      console.log('Status:', res.statusCode);
    } else { 
      const dataUser = data;
      if (event.message) {
        handleMessage(senderId, event.message, dataUser)
      } else if (event.postback) {
        handlePostback(senderId, event.postback.payload, dataUser)
      }
    }
  });

}

function handleMessage(senderId, message,dataUser) {
  if (message.text) {
    defaultMessage(senderId,dataUser);
  }
}

function defaultMessage(senderId,dataUser) {
  const messageData = {
    "recipient": {
      "id": senderId
    },
    "message": {
      "text": `Disculpa 😥 ${dataUser.first_name}, aún estoy aprendiendo y no entiendo lo que me dices, pero estoy gustoso de ayudarte con alguna de estas opciones`
    }
  }
  callSendApi(messageData);
}

function messageWelcome(senderId,dataUser) {
  const messageData = {
    "recipient": {
      "id": senderId
    },
    "message": {
      "attachment":{
        "type":"template",
        "payload":{
          "template_type":"button",
          "text":`Hola 😁 ${dataUser.first_name}!, soy PapaBot y estoy aquí para ayudarte con estas opciones `,
          "buttons":[
            {
              "type":"postback",
              "title":"Quiero Pizza",
              "payload":"EAT_PIZZA"
            },
            {
              "type":"postback",
              "title":"Dónde esta mi pizza?",
              "payload":"STATUS_PIZZA"
            },
            {
              "type":"postback",
              "title":"Zona de Reparto",
              "payload":"UBICATION_LOCAL_PIZZA"
            }
           
          ]
        }
      }
    }
  }
  callSendApi(messageData);
}

function handlePostback(senderId, payload,dataUser) {
  switch (payload) {
    case "GET_STARTED_PUGPIZZA":
      messageWelcome(senderId,dataUser);
      break;
  }
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
  console.log('Nuestro servidor esta funcionando  en el puerto: ', app.get('port'));
});