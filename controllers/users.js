const usersRouter = require('express').Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')

usersRouter.get('/',async(request,response) => {
    const users = await User.find({}).populate('blogs',{
        title: 1,
        author: 1,
        url: 1
    })
    response.json(users)
})

usersRouter.post('/',async(request,response) => {
    const body  = request.body
    if(!body.username || !body.password){
        return response.status(400).json({error:
            'username and password are required'
        })
    }   
    if(body.username.length < 3){
        return response.status(400).json({error:
            'username must be at least 3 characters long'
        })
    }
    if(body.password.length < 3){
        return response.status(400).json({error:
            'password must be at least 3 characters long'
        })
    }

    const  passwordHash = await bcrypt.hash(body.password,10)
   
    const user = new User({
        username: body.username,
        name: body.name,
        passwordHash,
    })

    const savedUser = await user.save()
    response.status(201).json(savedUser)
})

module.exports = usersRouter
