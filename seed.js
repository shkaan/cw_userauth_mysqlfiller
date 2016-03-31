
var Model = require('./model');

var faker = require('faker');


function createPost(counter) {
    var post = {};
    var arr = ['shkaan','lojcami','root'];

    post.question = faker.lorem.words() + '-' + counter;
    post.answer = faker.lorem.words() + '-' + counter;
    post.created_by = arr[Math.floor(Math.random()*arr.length)];

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
var myposts = createPosts(250);


    for (var i in myposts) {
        if (myposts.hasOwnProperty(i)) {
            new Model.Words(myposts[i])
                .save()
                .then(function (data) {
                    //console.log(data);
                    return data;
                })
                .catch(function (err) {
                    console.error(err);
                });
        }

    }


setTimeout(function(){
    console.log('\n>Seeding complete');
    process.exit(0);

},2500);

//console.log('> seeding complete!');


//function cb(ress) {
//    console.log(ress);
//    //process.exit(0);
//}

//console.log(bulk);
//setTimeout(function () {
//    for (var i in myposts) {
//new Model.Words(myposts).save()
//
//    .then(function () {
//        //console.log(data);
//    })
//    .catch(function (err) {
//        console.error(err);
//    });
//console.log(bulk.attributes[i]);
//}
//},3000);
//process.exit(0);


//.collection(myposts)
//.invokeThen('save')
//.then(function () {
//})
//.catch(function (err) {
//    console.error(err.stack);
//});
// save posts
//  return new postsCollection(myposts)
//  .invokeThen('save')
//  .then(function () {
//    console.log('> seeding complete!');
//    process.exit(0);
//  });
//})
//.otherwise(function (error) {
//  console.error(error.stack);
//  process.exit(1);
//});