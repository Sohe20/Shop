const session = require("express-session");
const User = require("../models/user");

const bcrypt = require("bcryptjs");

exports.getLogin = (req, res) => {
  res.render("auth/login", {
    path: "/Login",
    pageTitle: "ورود",
      isAuthenticated: false, // استفاده از متغیر محلی که بررسی شد
  });
};


exports.postLogin = (req, res) => {

    const email = req.body.email;
    const password = req.body.password;

    User.findOne({
        email: email
    }).then(
        user => {
            if (!user) {
                return res.redirect('/login');
            }
            bcrypt.compare(password, user.password).then(isMatch => {

                if (isMatch) {
                    req.session.isLoggedIn = true;
                    req.session.user = user;
                    return req.session.save(err => {
                        console.log(err);
                        res.redirect('/');
                    });
                }
                res.redirect('/login');
            })

        }
    )
}



exports.postLogout = (req, res) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};

exports.getSignup = (req, res) => {
  res.render("auth/signup", {
    path: "/auth",
    pageTitle: "ثبت نام",
    isAuthenticated: false,
  });
};

exports.postSignup = (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    User.findOne({ email: email })
      .then(userDoc => {
        if (userDoc) {
          return res.redirect('/signup');
        }
        return bcrypt
          .hash(password, 12)
          .then(hashedPassword => {
            const user = new User({
              email: email,
              password: hashedPassword,
              cart: { items: [] }
            });
            return user.save();
          })
          .then(result => {
            res.redirect('/login');
          });
      })
      .catch(err => {
        console.log(err);
      });

}


