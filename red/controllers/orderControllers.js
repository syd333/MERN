const Order = require('../models/Order')
const Cart = require('../models/Cart')
const User = require('../models/User')
const config = require('config')
const stripe = requre('stripe')(config.get('StripeAPIKey'))

//get all orders for user and sort by date ordered (descending order)
module.exports.get_orders - async (req. res) =>{
    const userId = req.params.id
    Order.find({userId}).sort({date: -1}).then(orders => 
        res.json(orders))
}

//checkout func
// receive userId and souce as req body from stripe
// find cart and user by userId 
// check if cart exists if not send response
// create a stripe charge - pass in amt, currency, & source obj
// if charge was not successful - throw error
// if charge was successful - create new order 
// delete cart using cart Id 

module.exports.checkout = async (req, res) => {
    try {
        const userId = req.params.id
        const{ source } = req.body
        let cart = await Cart.findOne({userId})
        let user = await User.findOne({_id: userId})
        const email = user.email
        if (cart) {
            const charge = await stripe.charges.create({
                amount: cart.bill,
                currency: 'usd',
                source: source,
                receipt_email: email
            })
            if(!charge) throw Error('Payment failed')
            if(charge){
                const order = await Order.create({
                    userId,
                    items: cart.items,
                    bill: cart.bill
                })
                const data = await Cart.findByIdAndDelete({_id:cart.id})
                return res.status(201).send(order)
            }
        }
        else{
            res.status(500).send("You do not have any items in your cart")
        }
    }
    catch(err){
        console.log(err)
        res.status(500).send("Something went wrong")
    }
}