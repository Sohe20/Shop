const express = require("express");
const router = express.Router();

const shopController = require('../controllers/shop')

router.get('/',shopController.getIndex)

router.get('/products/:productId',shopController.getProduct)

router.get('/products',shopController.getProducts)

router.post('/cart',shopController.postCart)

router.get('/cart',shopController.getCart)

router.get('/orders',shopController.getOrder)

router.post('/cart-delete-item',shopController.postCartDeleteProduct)

router.post('/create-order',shopController.postOrder)

module.exports = router

