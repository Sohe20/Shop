const Product = require("../models/product");
const Order = require("../models/order");
const cookieParse = require("../util/cookieparser");

exports.getProducts = (req, res) => {
  Product.find().then((products) => {
    res.render("shop/product-list", {
      prods: products,
      pageTitle: "All Product",
      path: "/products",
      isAuthenticated:req.session.isLoggedIn
    });
  });
};

exports.getIndex = (req, res) => {
  
  Product.find()
    .then((products) => {
      res.render("shop/index", {
        path: "/",
        pageTitle: "Shop",
        prods: products,
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getProduct = (req, res) => {
  const prodId = req.params.productId;

  Product.findById(prodId)
    .then((product) => {
      res.render("shop/product-details", {
        product: product,
        pageTitle: product.title,
        path: "/products",
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postCart = (req, res) => {
  const prodId = req.body.productId;

  Product.findById(prodId)
    .then((product) => {
      req.user.addTocart(product);
      res.redirect("/cart");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getCart = async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect('/login');
    }

    const user = await req.user.populate('cart.items.productId');

    res.render('shop/cart', {
      pageTitle: 'Cart',
      path: '/cart',
      products: user.cart.items,
      isAuthenticated: req.session.isLoggedIn
    });
  } catch (err) {
    console.error('Error in getCart:', err);
    res.redirect('/');
  }
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then(() => {
      console.log(req.user); // چاپ یوزر پس از حذف محصول از سبد خرید
      res.redirect("/cart"); // ریدایرکت به صفحه سبد خرید
    })
    .catch((err) => console.log(err)); // در صورت بروز خطا، نمایش خطا
};

exports.postOrder = async (req, res, next) => {
  try {
    if (!req.user) return res.redirect('/login');

    // اگر name خالی بود، از body یا email پر کن
    const resolvedName =
      req.body?.name ||
      req.user?.name ||
      (req.session?.user?.name) ||
      (req.user?.email ? req.user.email.split('@')[0] : null);

    // اگه پروفایل name نداشت، بی‌صدا ذخیره‌اش کن
    if (!req.user.name && resolvedName) {
      req.user.name = resolvedName.trim();
      req.user.save().catch(() => {}); // بدون اختلال توی سفارش
      if (req.session?.user) {
        req.session.user.name = req.user.name;
        req.session.save?.(() => {});
      }
    }

    // پرکردن cart با محصول‌ها
    await req.user.populate('cart.items.productId');

    const products = req.user.cart.items.map(i => ({
      quantity: i.quantity,
      product: { ...i.productId.toObject() }
    }));

    // ساخت سفارش
    await Order.create({
      products,
      user: {
        name: (req.user.name || resolvedName || 'Customer').trim(),
        userId: req.user._id
      }
    });

    // پاک کردن سبد خرید
    await req.user.clearCart();
    res.redirect('/orders');
  } catch (err) {
    console.log(err);
    next(err);
  }
};


exports.getOrder = (req, res) => {
  Order.find({ "user.userId": req.user._id })
    .then((orders) => {
      console.log(orders);

      res.render("shop/orders", {
        pageTitle: "Orders",
        path: "/orders",
        orders: orders,
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
