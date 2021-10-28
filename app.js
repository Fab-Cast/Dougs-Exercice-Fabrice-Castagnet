const express = require('express')

var movements = require('./routes/movements');

const app = express()
app.use(express.json());


// prefix api
app.use('/movements/', movements);

app.listen(8080, () => {
    console.log('Serveur démarré, port 8080')
})

