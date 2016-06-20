var Model = require('./model');
var DB = require('./db').DB;

var faker = require('faker');

var Wordscol = DB.Collection.extend({
    model: Model.Words
});


function createPost(counter) {
    var post = {};
    var arr = ['shkaan', 'lojcami', 'root'];

    post.question = faker.lorem.words() + '-' + counter;
    post.answer = faker.lorem.words() + '-' + counter;
    post.created_by = arr[Math.floor(Math.random() * arr.length)];

    return post;
}

function createPosts(total) {
    var posts = [];

    for (var i = 0; i < total; i++) {
        posts.push(createPost(i));
    }
    return posts;
}

console.log('> seeding...');

// create # posts
var myposts = Wordscol.forge(createPosts(5000))
    .invokeThen('save')
    .then(function () {
        console.log('Seeding Complete!');
        process.exit()
    });
