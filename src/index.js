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

function getBalance(statement) {
    const balance = statement.reduce((acc, operation) => {
        if(operation.type === 'credit') {
            return acc + operation.amount
        } else {
            return acc - operation.amount
        }
    }, 0)

    return balance
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

app.post('/deposit', verifyExistsAccountCPF, (resquest, response) => {
    const { description, amount } = resquest.body

    const { customer } = resquest

    const statementOperations = {
        description,
        amount,
        create_at: new Date(),
        type: 'credit'
    }

    customer.statement.push(statementOperations)

    return response.status(201).send()
})

app.post('/withdraw', verifyExistsAccountCPF, (resquest, response) => {
    const { amount } = resquest.body
    const { customer } = resquest

    const balance = getBalance(customer.statement)

    if (balance < amount) {
        return response.status(400).json({ error: 'Insufficient funds!'})
    }

    const statementOperations = {
        amount,
        create_at: new Date(),
        type: 'debit'
    }

    customer.statement.push(statementOperations)

    return response.status(201).send()
})

app.listen(3333)
