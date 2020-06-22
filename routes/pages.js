var express = require('express')
var router = express.Router()

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  return res.redirect('/auth/login');
}

// /* GET home page. */
router.get('/', ensureAuthenticated, function(req, res, next) {
  console.log(req.session)
    res.render('home', {page: 'Home', menuId: 'home', user: req.user})
})

var today = Date.now()
var oneYearAgo = new Date(Number(today) - 31556952000);

console.log(`Today is ${Date(today)}. One Year ago today was ${oneYearAgo.toString()}`)
var cur_institute

/* GET Userlist page. */
router.get('/fulldirectory', ensureAuthenticated, function(req, res) {
  var db = req.test_db
  var current = []
  var prev = []
  var institutes = []

  db.collection('users').distinct("institute", (e, docs) => {
    // Hard code some exceptions
    for (i = 0; i < docs.length; i++) {
      if (docs[i] === "Bern/Freiburg" || docs[i] === null || docs[i] === "Munster" || docs[i] === "Other") {
        console.log(`Institute not inserted: ${docs[i]}`)
      } else {
        //console.log(docs[i])
        institutes.push(docs[i])
      }
    }
  })

  db.collection('users').find({}, {"sort": "last_name"}).toArray((e,docs) => {
    for (i = 0; i < docs.length; i++) {
      if(!docs[i].end_date) {
        if(docs)
        current.push(docs[i])
      } else {
        prev.push(docs[i])
      }
    }
    res.render('fulldirectory', {page: 'Full Directory', menuId: 'home', "curr": current, "prev": prev, "institutes": institutes, user: req.user})
  })
})

router.post("/table_info", ensureAuthenticated, function(req, res){
	//var db = req.run_db;
	var db = req.test_db
  // Hard code Muenster/Munster and Bern-Freiburg/Freiburg because they 
  // are the same institutes but come up under different names on the db
  // If valid show all users in that institute
  db.collection('users').find({"end_date": {$exists: false}}, {"sort": "institute"}).toArray(function(err, result) {
		  res.send(JSON.stringify({"data": result}));
  })
    
});

/* GET List of Authors page. */
router.get('/authors', ensureAuthenticated, function(req, res) {
  var db = req.test_db
  var current = []
  var prev = []
  db.collection('users').find({start_date: {$lt: oneYearAgo}}, {"sort": "last_name"}).toArray((e, docs) => {
    for (i = 0; i < docs.length; i++) {
      if(!docs[i].end_date) {
        if(docs)
        current.push(docs[i])
      } else {
        prev.push(docs[i])
      }
    }
    res.render('fulldirectory', {page: 'Author List', menuId: 'home', "curr": current, "prev": prev, user: req.user})
  })
})

// Dealing with profiles
router.get('/profile', ensureAuthenticated, function(req, res){
  // console.log(req.session)
  // res.send(`Profile for the user: ${req.user.first_name} ${req.user.last_name}`)
  res.render('profile', { page: 'Profile', menuId: 'home', title: `${req.user.first_name} ${req.user.last_name}`, user: req.user });
});

module.exports = router