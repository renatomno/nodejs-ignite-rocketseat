const express = require('express');
const { v4: uuidv4 } = require('uuid')
const app = express();

app.use(express.json())

const customers = []

function verifyIfAccountCpfExists(request, response, next) {
    const { cpf } = request.headers;

    const customer = customers.find(customer => customer.cpf === cpf)

    if (!customer) return response.status(400).json({ error: "customer doesn't exists" })

    request.customer = customer

    return next()
}


//Conta -> cpf (string), name (string), id (uuid), statement []
//Endpoint para criação de conta
app.post('/account', (request, response) => {
    const { cpf, name } = request.body;

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


app.use(verifyIfAccountCpfExists)

//Endpoint para checar extrato
app.get('/statement/:cpf', (request, response) => {
    const { customer } = request

    return response.status(200).json(customer.statement)
})

//Porta em que está sendo ouvido
app.listen(3030, () => console.log('listening on port 3000'))