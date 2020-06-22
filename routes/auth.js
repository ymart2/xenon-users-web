var express = require("express")
var router = express.Router()
var passport = require("passport")

// auth login page
router.get('/login', (req, res) => {
    res.render('login', {page: 'Login', menuId: 'home', user: req.user})
})

// login using github
router.get('/github', 
        passport.authenticate('github', { scope: [ 'user:email' ] }), 
        (req, res) => {
            // The request gets redirected to github for authentication
            // so this function is not called
})

// local authentication
router.post('/password', 
  passport.authenticate('local', {failureRedirect: './login'}),
  (req, res) => {
      res.redirect('/profile')
  }
);

// callback link
router.get('/github/callback',
    passport.authenticate('github', { failureRedirect: '/auth/login' }),
   (req, res) => {
        res.redirect('/profile')
})


// auth logout page
router.get('/logout', (req, res) => {
    req.logout();
    req.session.destroy();
    res.redirect('/');
})

module.exports = router;