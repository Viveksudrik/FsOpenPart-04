const { test , after, beforeEach} = require('node:test')

const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')

// supertest wraps your app so we can make HTTP requests to it
// WITHOUT actually starting the server (no app.listen needed!)

const api = supertest(app)

const initialBlogs = [
  {
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
  },
  {
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
  },
]

beforeEach(async() => {
    await Blog.deleteMany({})

    await Blog.insertMany(initialBlogs)
})

test('blogs are returned as json', async() => {
    await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
})

test('there are two blogs', async () => {
  const response = await api.get('/api/blogs')
  assert.strictEqual(response.body.length, initialBlogs.length)
})

test('a valid blog can be added', async () => {
  const newBlog = {
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12,
  }

  await api
    .post('/api/blogs')
    .send(newBlog)                                    // send the blog as request body
    .expect(201)                                      // expect 201 Created
    .expect('Content-Type', /application\/json/)

  const response = await api.get('/api/blogs')
  const titles = response.body.map(b => b.title)

  assert.strictEqual(response.body.length, initialBlogs.length + 1)
  assert(titles.includes('Canonical string reduction'))
})

test('if likes is missing, it defaults to 0', async () => {
  const newBlog = {
    title: 'Blog without likes',
    author: 'Test Author',
    url: 'http://example.com',
  }

  const response = await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)

  assert.strictEqual(response.body.likes, 0)
})

test('blog without title is not added', async () => {
  const newBlog = {
    author: 'Test Author',
    url: 'http://example.com',
    likes: 3,
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)

  const response = await api.get('/api/blogs')
  assert.strictEqual(response.body.length, initialBlogs.length)
})

test('blog without url is not added', async () => {
  const newBlog = {
    title: 'A blog without URL',
    author: 'Test Author',
    likes: 3,
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)

  const response = await api.get('/api/blogs')
  assert.strictEqual(response.body.length, initialBlogs.length)
})



test('unique identifier property is named id', async () => {
  const response = await api.get('/api/blogs')
  const blogs = response.body

  blogs.forEach(blog => {
    assert(blog.id)          // 'id' exists
    assert(!blog._id)        // '_id' does NOT exist
  })
})

test( ' a blog can be deleted', async() => {
    const blogAtStart = await api.get('/api/blogs')
    const blogAtDelete = blogAtStart.body[0]

    await api 
         .delete(`/api/blogs/${blogAtDelete.id}`)
         .expect(204)

    const blogAtEnd = await api.get('/api/blogs')
    assert.strictEqual(blogAtEnd.body.length, initialBlogs.length - 1)

    const titles = blogAtEnd.body.map(b => b.title)
    assert(!titles.includes(blogAtDelete.title))
})

test('a blog can be updated', async () => {
  const blogsAtStart = await api.get('/api/blogs')
  const blogToUpdate = blogsAtStart.body[0]

  const updatedData = {
    ...blogToUpdate,
    likes: blogToUpdate.likes + 10,
  }

  const response = await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .send(updatedData)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.body.likes, blogToUpdate.likes + 10)
})



after(async() => {
    await mongoose.connection.close()
})