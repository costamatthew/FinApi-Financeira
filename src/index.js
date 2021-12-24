const { request } = require('express')
const express = require('express')
const {v4: uuidv4} = require('uuid')

const app = express()

app.use(express.json())

const customers = []

// Middleware
function verifyExistsAccountCPF(resquest, response, next) {
    const { cpf } = resquest.headers

    const customer = customers.find(customer => customer.cpf === cpf)

    if(!customer) {
        return response.status(400).json({ error: 'Customer not found!'})
    }

    request.customer = customer

    return next()
}

/**
 * cpf - string
 * name - string
 * id - uuidv4
 * statement - []
 */

app.post('/account', (resquest, response) => {
    const { cpf, name } = resquest.body

    const customerAlreadyExists = customers.some(
        (customer) => customer.cpf === cpf
    )

    if(customerAlreadyExists) {
        return response.status(400).json({ error: 'Customer already exists!'})
    }

    customers.push({
        cpf,
        name,
        id: uuidv4(),
        statement: []
    })

    return response.status(201).send()
})

// app.use(verifyExistsAccountCPF)

app.get('/statement', verifyExistsAccountCPF, (resquest, response) => {
    const { customer } = resquest

    return response.status(200).json(customer.statement)
})

app.listen(3333)
