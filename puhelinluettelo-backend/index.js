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

app.get('/api/persons/:id', (req, res, next) => {
    Person.findById(req.params.id).then(person => {
        if (person) {
            res.json(person)
        } else {
            res.status(404).end()
        }
    }).catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
    Person.findByIdAndRemove(req.params.id)
        .then(result => {
            res.status(204).end()
        }).catch(error => next(error))
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

app.put('/api/persons/:id', (req, res, next) => {
    const body = req.body
    const person = {
        name: body.name,
        number: body.number
    }
    Person.findByIdAndUpdate(req.params.id, person, {new:true})
        .then(updatedPerson => {
            res.json(updatedPerson)
        }).catch(error => next(error))
})

const unknownEndpoint = (req, res) => {
    res.status(404).send({error: 'unknown endpoint'})
}
app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
    console.error(error.message)
    if (error.name === 'CastError') {
        return res.status(400).send({error: 'malformatted id'})
    }
    next(error) 
}
app.use(errorHandler)


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})