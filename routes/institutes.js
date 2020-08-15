var express = require("express");
var router = express.Router();
var base = '/shifts';

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  return res.redirect(base + '/auth/login');
}

// GET Institutes List page.
router.get('/', ensureAuthenticated, function(req, res) {
  res.render('institutes', 
    { page: 'Institutes', 
      menuId: 'home', 
      institutes: array_of_institutes, 
      user: req.user
    }
  );
});

// GET individual institution page.
router.get('/:institute', ensureAuthenticated, function(req, res) {
  var db = req.xenonnt_db;
  var collection = db.collection('users');
  var givenInstitute = req.params.institute;
  var findInstitute;

  // Hard-code institutes that are under different names in the database 
  // such as Muenster/Munster, UCSD/UC San Diego, Uchicago/Chicago, and 
  // Bern-Freiburg/Freiburg.
  for (let i = 0; i < array_of_institutes.length; i++) {
    if (array_of_institutes[i][0] === givenInstitute) {
      if (array_of_institutes[i].length > 1) {
        var alternateInstitute = array_of_institutes[i][1];
        break;
      }
    }
  }
  // Make sure we always find the institute, even if it appears under
  // different names.
  if (alternateInstitute) {
    findInstitute = 
      collection.find(
        { "end_date": {$exists: false}, 
          $or: [
            {"institute": givenInstitute}, 
            {"institute": alternateInstitute}
          ]
        }, 
        {"sort": "last_name"}
      );
  } else {
    findInstitute = 
      collection.find(
        { "institute": givenInstitute, 
          "end_date": {$exists: false}
        }, 
        {"sort": "last_name"}
      );
  }

  // If valid show all users in that institute
  findInstitute.toArray(function(e, docs) {
    var dict = {};
    var pi = [];
    // Create dictionary that holds team stats
    for (let i = 0; i < docs.length; i++) {
      let positionStr = (docs[i].position).toString();
      // PI treated differently because we want their name(s)
      if (positionStr === 'PI') {
        pi.push(docs[i]);
      } else {
        if (dict[positionStr]) {
          dict[positionStr] += 1;
        } else {
          dict[positionStr] = 1;
        }
      }
    }
    // separate current member information from previous member information
    var current = [];
    var prev = [];
    for (let i = 0; i < docs.length; i++) {
      if(!docs[i].end_date) {
        if(docs)
        current.push(docs[i]);
      } else {
        prev.push(docs[i]);
      }
    }

    res.render('institute_stats', 
      { page: givenInstitute, 
        menuId: 'home', 
        PI: pi,
        dict: dict,
        curr: current, 
        prev: prev,
        institutes: array_of_institutes,
        user: req.user
      }
    );
  });
});

// GET New User page.
router.get('/:institute/newuser', ensureAuthenticated, function(req, res) {
  var curInstitute = req.params.institute;
  res.render('newuser', 
    { page: 'New User', 
      cur_institute: curInstitute, 
      menuId: 'home', 
      title: 'Add New User', 
      user: req.user
    }
  );
});

module.exports = router