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

function getBalance(statement) {
    const balance = statement.reduce((acc, operation) => {
        if (operation.type === 'deposit') return acc + operation.amount;
    }, 0)

    return balance;
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

//Endpoint para checar contas criadas
app.get('/account', verifyIfAccountCpfExists, (request, response) => {
    const { customer } = request
    return response.status(200).json(customer)
})

//Endpoint para registrar depósito
app.post('/withdraw', verifyIfAccountCpfExists, (request, response) => {
    const { customer } = request;
    const { description, amount } = request.body;

    const balance = getBalance(customer.statement)

    if (balance < amount) return response.status(400).json({ 'error': 'amount > balance' })

    const statementOperation = {
        description,
        amount,
        created_at: new Date(),
        type: "debit"
    }

    customer.statement.push(statementOperation);

    return response.status(200).send()
})

//Endpoint para checar statements de um determinado dia
app.get('/statement/date', verifyIfAccountCpfExists, (request, response) => {
    const { customer } = request;
    const { date } = request.query;

    const dateFormat = new Date(date + " 00:00");

    const statements = customer.statement.filter((statement) => {
        statement.created_at.toDateString == new Date(dateFormat).toDateString()
    })

    return response.status(200).json(statements)
})

//Endpoint para atualização do nome de uma conta
app.put('/account', verifyIfAccountCpfExists, (request, response) => {
    const { customer } = request;
    const { name } = request.body

    customer.name = name;

    return response.status(200).send()
})

//Endpoint para deletar conta
app.delete('/account', verifyIfAccountCpfExists, (request, response) => {
    const { customer } = request
    const { cpf } = request.headers;

    // const customerIndex = customers.indexOf(customers.cpf === cpf)

    customers.splice(customer, 1)

    return response.status(204).json(customers)

})

//Endpoint para receber o balance de um customer
app.get('/balance', verifyIfAccountCpfExists, (request, response) => {
    const { customer } = request;

    const balance = getBalance(customer.statement)
    return response.status(200).json({ balance })
})

//Porta em que está sendo ouvido
app.listen(3030, () => console.log('listening on port 3000'))