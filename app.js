require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jws = require('jsonwebtoken')

const app = express()

//Configuração Json. Converte req.body para json.
app.use(express.json())

//Models.
const User = require('./Models/User')

// Rota Púlica.
app.get('/',(req, res) => {
    res.status(200).json({msg: "Bem vindo!"})
})

//Rota privada

app.get("/user/:id", async (req,res) => {
    const id = req.params.id

    // checar existência usuário
    const user = await User.findByID(id, '-password')

    if(!user) {
        return res.status(404),json({msg:'usuário não encontrado!'})
    }
})
//Registro.
app.post('/autorizar/registro', async (req, res) => {

    const {name, email, password, confirmpassword} = req.body

    //Validações.

    if(!name) {
        return res.status(422).json({msg: 'o nome é obrigatório!'})
    }
    if(!email) {
        return res.status(422).json({msg: 'o email é obrigatório!'})
    }
    if(!password) {
        return res.status(422).json({msg: 'a senha é obrigatório!'})
    }
    if(!confirmpassword) {
        return res.status(422).json({msg: 'a confirmação é obrigatório!'})
    }
    if(confirmpassword !== password) {
        return res.status(422).json({msg: 'Não coicidem!'})
    }

//Checar se usuário existe
    const userExists = await User.findOne({ email: email })
        if (userExists) {
            return res.status(422).json({msg: 'Esse email já está cadastrado!'})
}
//Criar Senha
    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(password, salt)

//Criar cadastro

    const user = new User({
        name,
        email,
        password: passwordHash,
    })

    try {
        await user.save()
        res.status(201).json({msg:'usuário criado!'})

    } catch(err) {
        res.status(500).json({msg: 'Ocorreu um erro'})
        console.log(err)

    }
})


//Fazer login

app.post("/autorizar/usuario", async (req,res) => {
    const {email, password} = req.body

    if(!password) {
        return res.status(422).json({msg: 'a senha é obrigatória!'})
    }
    if(!email) {
        return res.status(422).json({msg: 'o email é obrigatório!'})}

//Verificar se usuários existem

const user = await User.findOne({ email: email })
if (!user) {
    return res.status(422).json({msg: 'Usuário não encontrado!'})
}

try {return res.status(200).json({msg: "Usuário encontado!"})

}
catch {

}
//validação senha
const checkPassword = await bcrypt.compare(password, user.password)
    if(!checkPassword) {
        return res.status(422).json({msg: 'Senha inválida!'})

        try {
            const secret = proces.env.SECRET

            const token = jwt.sign({
                id: user._id
            }, secret)

            res.status(200).json({msg: "autentificação realizada!", token})

        }
        catch(err) {
        res.status(500).json({msg: 'Ocorreu um erro'})
        console.log(err)

    }
}
})



//Credenciais.
const dbUser = process.env.DB_USER
const dbPassword = process.env.DB_PASS






//Conexão com BD.
mongoose.connect(`mongodb+srv://${dbUser}:${dbPassword}@loginjwt.keecrwk.mongodb.net/?retryWrites=true&w=majority`)
    .then(() => {
    app.listen(3000)
    console.log('Banco Conectado!')})
    .catch((err) => {
    console.log(err)})