'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const requestPromise = require('request-promise');
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

function handleMessage(senderId, message, dataUser) {
  if (message.text) {
    defaultMessage(senderId, dataUser);
  }
}

function defaultMessage(senderId, dataUser) {
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

function messageWelcome(senderId, dataUser) {
  const messageData = {
    "recipient": {
      "id": senderId
    },
    "message": {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "button",
          "text": `Hola 😁 ${dataUser.first_name}!, soy PapaBot y estoy aquí para ayudarte con estas opciones `,
          "buttons": [{
              "type": "postback",
              "title": "Quiero Pizza",
              "payload": "EAT_PIZZA"
            },
            {
              "type": "postback",
              "title": "Dónde esta mi pizza?",
              "payload": "STATUS_PIZZA"
            },
            {
              "type": "postback",
              "title": "Zona de Reparto",
              "payload": "UBICATION_LOCAL_PIZZA"
            }

          ]
        }
      }
    }
  }
  callSendApi(messageData);
}


function messageEatPizza(senderId, dataUser) {
  const messageData = {
    "recipient": {
      "id": senderId
    },
    "message": {
      "attachment": {
        "type": "template",
        "payload":{
          "template_type":"generic",
          //"image_aspect_ratio": "square",
          "elements":[
            {
              "title":`Carta`,
              "image_url":"https://user-images.githubusercontent.com/32285482/44165073-60394900-a08d-11e8-8714-2dd16e0d08d2.png",
              "buttons":[
                {
                  "type":"web_url",
                  "url":'https://literate-gum.glitch.me/dynamic-webview',
                  "title":"Pizzas",
                  // "messenger_extensions": true,
                  "webview_height_ratio" : 'full'
                },
                {
                  "type":"web_url",
                  "url":'https://literate-gum.glitch.me/dynamic-webview',
                  "title":"Complementos",
                  // "messenger_extensions": true,
                  "webview_height_ratio" : 'full'
                }
                
              ]
            },
              {
              "title":`Promociones `,
              "image_url":"https://user-images.githubusercontent.com/32285482/44165070-5fa0b280-a08d-11e8-82b5-8c586c8ecbb0.png",
              "buttons":[
                {
                  "type":"web_url",
                  "url":'https://literate-gum.glitch.me/dynamic-webview',
                  "title":"La Favorita",
                  // "messenger_extensions": true,
                  "webview_height_ratio" : 'full'
                },
                {
                  "type":"web_url",
                  "url":'https://literate-gum.glitch.me/dynamic-webview',
                  "title":"La 2da a 1 sol",
                  // "messenger_extensions": true,
                  "webview_height_ratio" : 'full'
                }
              
                
              ]
            }
            
            
          ]
        }
      }
    }
  }
  callSendApi(messageData);
}




function handlePostback(senderId, payload, dataUser) {
  switch (payload) {
    case "GET_STARTED_PUGPIZZA":
      messageWelcome(senderId, dataUser);
      break;
    case "EAT_PIZZA":
      messageEatPizza(senderId, dataUser);
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