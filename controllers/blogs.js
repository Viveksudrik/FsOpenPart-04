const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const middleware = require('../utils/middleware')

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({}).populate('user', {
        username: 1,
        name: 1,
    })
    response.json(blogs)
})
blogsRouter.post('/', middleware.useExtractor, async (request, response) => {
    const user = request.user
    const blog = new Blog({
        ...request.body,
        user: user._id,
    })
    const savedBlog = await blog.save()

    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    response.status(201).json(savedBlog)

})

blogsRouter.put('/:id', async (request, response) => {
    const { title, author, url, likes } = request.body

    const updatedBlog = await Blog.findByIdAndUpdate(
        request.params.id,
        { title, author, url, likes },
        { new: true, runValidators: true }
    )

    if (updatedBlog) {
        response.json(updatedBlog)
    } else {
        response.status(404).end()
    }
})

blogsRouter.delete('/:id', middleware.useExtractor, async (request, response) => {
    const blog = await Blog.findById(request.params.id)
    if (blog.user.toString() !== request.user._id.toString()) {
        return response.status(401).json({ error: 'only the creator can delete this blog' })
    }

    await Blog.findByIdAndDelete(request.params.id)
    response.status(204).end()
})


module.exports = blogsRouter
