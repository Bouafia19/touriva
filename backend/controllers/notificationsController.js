const admin = require("firebase-admin")

// POST
const sendToTopics = async (req, res) => {
    const { 
        topic,
        title,
        body
    } = req.body

    try {
        let message = {
            notification: {
                title: title,
                body: body
            },
            data: {
                source: 'admin'
            },
            android:{
                priority: "high"
            },
            // apns:{
            //     "headers":{
            //         "apns-priority":"5"
            //     }
            // },
            topic: topic
        };
        // console.log('message', message)

        // Send a message to the device corresponding to the provided topic
        admin.messaging().send(message)
        .then((response) => {
            // Response is a message ID string.
            console.log('Successfully sent message:', response);
        })
        .catch((error) => {
            console.log('Error sending message:', error);
        });
    } catch (error) {
        console.log(error)
    }
}

// POST
const sendToTokens = async (req, res) => {
    const { 
        registrationTokens,
        title,
        body
    } = req.body

    try {
        let message = {
            notification: {
                title: title,
                body: body
            },
            data: {
            },
            tokens: registrationTokens,
        };

        // Send a message to the device corresponding to the provided registration tokens.
        admin.messaging().sendMulticast(message)
        .then((response) => {
            // Response is a message ID string.
            console.log('Successfully sent message:', response);
        })
        .catch((error) => {
            console.log('Error sending message:', error);
        });
    } catch (error) {
        console.log(error)
    }
}

// POST
const sendToToken = async (req, res) => {
    const { 
        registrationToken,
        title,
        body,
        data
    } = req.body
    
    try {
        let message = {
            notification: {
                title: title,
                body: body,
                // sound: "default" 
            },
            
            data: {
                start: data.from,
                to: data.to,
                price: data.price,
                clientId: data.client.id,
                clientFirstName: data.client.firstName,
                clientLastName: data.client.lastName,
                clientPhone: data.client.phone,
                clientSocketIo: data.socketId,
                vehicleId: data.vehicleId,
                source: 'client'
            },
            token: registrationToken
        };

        console.log('msg', message)
       
        // Send a message to the device corresponding to the provided
        // registration token.
        
        admin.messaging().send(message)
        .then((response) => {
            // Response is a message ID string.
            console.log('Successfully sent message:', response)
            res.status(200)
        })
        .catch((error) => {
            console.log('Error sending message:', error);
        });
    } catch (error) {
        console.log(error)
    }
}

const subscribe = async (req, res) => {
    const { role, fcmToken } = req.body
    // if(user.role != 'administrator'){
        // Subscribe the devices corresponding to the registration tokens to the
        // topic.
        admin.messaging().subscribeToTopic(fcmToken, role)
        .then((response) => {
        // See the MessagingTopicManagementResponse reference documentation
        // for the contents of response.
        console.log('Successfully subscribed to topic:', response);
        })
        .catch((error) => {
        console.log('Error subscribing to topic:', error);
        })
    // }
}

module.exports = {
    sendToTopics,
    sendToTokens,
    sendToToken,
    subscribe
}