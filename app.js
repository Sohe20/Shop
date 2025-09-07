const express = require("express");
const path = require("path");
const bodyparser = require("body-parser");



const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session)

const User = require("./models/user");
const Product = require("./models/product");

const MONGODB_URI= "mongodb://localhost/Shop"


const app = express();
const store = new MongoDBStore({
  uri : MONGODB_URI,
  collection:'session'
})

// تنظیمات EJS برای استفاده از قالب‌ها
app.set("view engine", "ejs");
app.set("views", "views");

const adminRouter = require("./routes/admin");
const shopRouter = require("./routes/shop");
const authRouter = require("./routes/auth");

// استفاده از body-parser برای پردازش داده‌های POST
app.use(bodyparser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({ 
    secret: "my secret", 
    resave: false, 
    saveUninitialized: false,
    store:store ,
    
  })
);

// میدل‌ور برای افزودن یوزر به درخواست
app.use((req, res, next) => {
  if(!req.session.user){
    return next()
  }
  User.findById(req.session.user._id) // آیدی یوزر تستی
    .then((user) => {
      req.user = user; // یوزر رو به درخواست اضافه می‌کنیم
      next(); // ادامه اجرای درخواست
    })
    .catch((err) => {
      console.log(err);
      next(); // در صورت بروز خطا هم باید next() اجرا بشه
    });
});

// مسیرهای روت
app.use("/admin", adminRouter);
app.use(shopRouter);
app.use(authRouter);

// اتصال به دیتابیس MongoDB و راه‌اندازی سرور
mongoose
  .connect(MONGODB_URI)
  .then(() => {
   // راه‌اندازی سرور روی پورت 3000
    app.listen(3000, () => {
      console.log("Running on Port 3000");
    });
  })
  .catch((err) => {
    console.log(err);
  });
