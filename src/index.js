const express = require('express');
const { v4: uuidv4 } = require('uuid')
const app = express();

app.use(express.json())

const customers = []


//Conta -> cpf (string), name (string), id (uuid), statement []
//Endpoint para criação de conta
app.post('/account', (req, res) => {
    const { cpf, name } = req.body;
    const id = uuidv4();

    customers.push({
        cpf,
        name,
        id,
        statement: []
    })

    return res.status(201).send()
})

app.listen(3030, () => console.log('listening on port 3000'))