require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')
const { response } = require('express')


app.use(express.static('build'))
app.use(express.json())

morgan.token('data', (req, res) => JSON.stringify(req.body))

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))
app.use(cors())


app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.get('/info', (req, res) => {
    const time = new Date
    Person.find({}).then(persons => {
        res.send(`<div>Phonebook has info for ${persons.length} people</div>
        <div>${time}</div>`)
    }) 
})

app.get('/api/persons/:id', (req, res) => {
    Person.findById(req.params.id).then(person => {
        res.json(person)
    })
})

app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    persons = persons.filter(person => person.id !== id)
    res.status(204).end()
})

app.post('/api/persons', (req, res) => {
    const person = req.body
    if (!person.name) {
        return res.status(400).json({
            error: 'Person to be added must have a name'
        })
    }
    if (!person.number) {
        return res.status(400).json({
            error: 'Person to be added must have a number'
        })
    }
    Person.find({}).then(persons => {
        if (persons.find(p => p.name === person.name)) {
            return res.status(400).json({
                error: "Name must be unique"
            })
        }
    })
    const newPerson = new Person({
        name: person.name,
        number: person.number
    })
    newPerson.save().then(savedPerson => {
        res.json(savedPerson)
    })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})