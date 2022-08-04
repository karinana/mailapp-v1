const express = require('express')
const app = express()
const cors = require('cors')
const MongoClient = require('mongodb').MongoClient
const PORT = 8000
require('dotenv').config()

let db,
    dbConnectionString = process.env.DB_STRING,
    dbName = 'mailArt',
    collection

MongoClient.connect(dbConnectionString, { useUnifiedTopology: true })
    .then(client => {
        console.log(`Connected to ${dbName} Database`)
        db = client.db(dbName)
        collection = db.collection('artCalls')
    })

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors())

app.get('/', (request, response) => {
    db.collection('rappers').find().sort({ likes: -1 }).toArray()
        .then(data => {
            response.render('index.ejs', { info: data })
        })
        .catch(error => console.error(error))
})

app.post('/addRapper', (request, response) => {
    db.collection('rappers').insertOne({
        stageName: request.body.stageName,
        birthName: request.body.birthName, likes: 0
    })
        .then(result => {
            console.log('mailart call added')
            response.redirect('/')
        })
        .catch(error => console.error(error))
})

app.put('/addOneLike', (request, response) => {
    db.collection('rappers').updateOne({ stageName: request.body.stageNameS, birthName: request.body.birthNameS, likes: request.body.likesS }, {
        $set: {
            likes: request.body.likesS + 1
        }
    }, {
        sort: { _id: -1 },
        upsert: true
    })
        .then(result => {
            console.log('Added One Like')
            response.json('Like Added')
        })
        .catch(error => console.error(error))

})

app.delete('/deleteRapper', (request, response) => {
    db.collection('rappers').deleteOne({ stageName: request.body.stageNameS })
        .then(result => {
            console.log('Rapper Deleted')
            response.json('Rapper Deleted')
        })
        .catch(error => console.error(error))

})

app.listen(process.env.PORT || PORT, () => {
    console.log(`Server running on port ${PORT}`)
})    