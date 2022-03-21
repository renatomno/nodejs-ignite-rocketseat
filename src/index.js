const express = require('express');
const { v4: uuidv4 } = require('uuid')
const app = express();

app.use(express.json())

const customers = []

//Middleware que checa se existe uma conta com determinado CPF
function verifyIfAccountCpfExists(request, response, next) {
    const { cpf } = request.headers;

    const customer = customers.find(customer => customer.cpf === cpf)

    if (!customer) return response.status(400).json({ error: "customer doesn't exists" })

    request.customer = customer
    return next()
}

//Endpoint para criação de conta
app.post('/account', (request, response) => {
    const { cpf, name } = request.headers;

    const customerAlreadyExists = customers.some((customer) => customer.cpf === cpf)

    if (customerAlreadyExists) return response.status(400).json({ error: "customer already exists!" })

    customers.push({
        cpf,
        name,
        id: uuidv4(),
        statement: []
    })

    return response.status(201).send()
})

//Endpoint para checar extrato
app.get('/statement/:cpf', verifyIfAccountCpfExists, (request, response) => {
    const { customer } = request

    return response.status(200).json(customer.statement)
})

//Endpoint para registrar depósito
app.post('/deposit', verifyIfAccountCpfExists, (request, response) => {
    const { description, amount } = request.body

    const customer = request.customer

    const statementOperation = {
        description,
        amount,
        created_at: new Date(),
        type: "deposit"
    }
    customer.statement.push(statementOperation)

    return response.status(200).send()
})

//Porta em que está sendo ouvido
app.listen(3030, () => console.log('listening on port 3000'))