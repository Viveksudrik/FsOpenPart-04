const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
    if (blogs.length === 0) return null

    const favorite = blogs.reduce((max, blog) =>
        blog.likes > max.likes ? blog : max
        , blogs[0])

    return {
        title: favorite.title,
        author: favorite.author,
        likes: favorite.likes,
    }
}

const mostBlogs = (blogs) => {
    if (blogs.length === 0) return null

    const authorCounts = blogs.reduce((counts, blog) => {
        counts[blog.author] = (counts[blog.author] || 0) + 1
        return counts
    }, {})

    const topAuthor = Object.entries(authorCounts).reduce((max, [author, count]) =>
        count > max.blogs ? { author, blogs: count } : max
        , { author: '', blogs: 0 })

    return topAuthor
}

const mostLikes = (blogs) => {
    if (blogs.length === 0) return null

    const authorLikes = blogs.reduce((likes, blog) => {
        likes[blog.author] = (likes[blog.author] || 0) + blog.likes
        return likes
    }, {})

    const topAuthor = Object.entries(authorLikes).reduce((max, [author, likes]) =>
        likes > max.likes ? { author, likes } : max
        , { author: '', likes: 0 })

    return topAuthor
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes,
}
