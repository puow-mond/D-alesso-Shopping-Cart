var passport = require('passport');
var User = require('../models/user');
var LocalStrategy = require('passport-local').Strategy;

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

// for test
// passport.use('local.signup', new LocalStrategy({
//     usernameField: 'email',
//     passwordField: 'password',
//     passReqToCallback: true
// }, function (req, email, password, done) {
//     req.checkBody('email', 'Invalid email').notEmpty().isEmail();
//     req.checkBody('password', 'Invalid password').notEmpty().isLength({ min: 4 });
//     var errors = req.validationErrors();
//     if (errors) {
//         var messages = [];
//         errors.forEach(function (error) {
//             messages.push(error.msg);
//         });
//         return done(null, false, req.flash('error', messages));
//     }

//     User.findOne({ 'email': email }, function (err, user) {
//         if (err) {
//             return done(err);
//         }
//         if (user) {
//             return done(null, false, { message: 'Email is already in use.' });
//         }
//         var newUser = new User();
//         newUser.email = email;
//         newUser.password = newUser.encryptPassword(password);
//         newUser.save(function (err, result) {
//             if (err) {
//                 return done(err);
//             }
//             return done(null, newUser);
//         });
//     });
// }));

passport.use('local.signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function (req, email, password, done) {
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const username = req.body.username;
    const address = req.body.address;
    const city = req.body.city;
    const state = req.body.state;
    const zip = req.body.zip;
    req.checkBody('firstName', 'First name is required').notEmpty();
    req.checkBody('lastName', 'Last name is required').notEmpty();
    req.checkBody('email', 'Invalid email').notEmpty().isEmail();
    req.checkBody('password', 'Invalid password').notEmpty().isLength({ min: 4 });
    req.checkBody('username', 'Invalid username').notEmpty().isLength({ min: 4 });
    req.checkBody('address', 'Address is required').notEmpty();
    req.checkBody('city', 'City is required').notEmpty();
    req.checkBody('state', 'State is required').notEmpty();
    req.checkBody('zip', 'Zip is required').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        var messages = [];
        errors.forEach(function (error) {
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }

    User.findOne({$or: [
        { 'email': email },
        { 'username': username }
    ]}).exec(function(err, user) {
        if (err) {
            return done(err);
        } else if (user) {
            return done(null, false, { message: 'Email or username is already in use.' });
        }
        var newUser = new User();
        newUser.firstName = firstName;
        newUser.lastName = lastName;
        newUser.email = email;
        newUser.password = newUser.encryptPassword(password);
        newUser.username = username;
        newUser.address = address;
        newUser.city = city;
        newUser.state = state;
        newUser.zip = zip;
        newUser.save(function (err) {
            if (err) {
                console.log("err");
                return done(err);
            }
            console.log("pass");
            return done(null, newUser);
        });
    });
}));

passport.use('local.signin', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function (req, email, password, done) {
    req.checkBody('email', 'Invalid email').notEmpty().isEmail();
    req.checkBody('password', 'Invalid password').notEmpty();
    var errors = req.validationErrors();
    if (errors) {
        var messages = [];
        errors.forEach(function (error) {
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }
    User.findOne({ 'email': email }, function (err, user) {
        if (err) {
            return done(err);
        }
        if (!user) {
            return done(null, false, { message: 'No user found.' });
        }
        if (!user.validPassword(password)) {
            return done(null, false, { message: 'Wrong password.' });
        }
        return done(null, user);
    });
}));