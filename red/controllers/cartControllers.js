const Cart = require("../models/Cart");
const Item = require("../models/Item");

module.exports.get_cart_items = async (req, res) => {
  const userId = req.params.id;
  try {
    let cart = await Cart.findOne({ userId });
    if (cart && cart.items.length > 0) {
      res.sent(cart);
    } else {
      res.sent(null);
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong");
  }
};

module.exports.add_cart_item = async (req, res) => {
  const userId = req.params.id;
  const { productId, quantity } = req.body;

  try {
      let cart = await Cart.findOne({userId});
      let item = await Item.findOne({_id: productId});
      if(!item){
          res.status(400).send('Item not found')
      }
      const price = item.price;
      const name = item.title;

      if (cart){
          // if cart exists for the user
        let itemIndex = cart.items.findIndex(p => p.productId === productId)
        }

        // check if productiss or not
        if(itemIndex > -1){
            let productItem = cart.items[itemIndex];
            productItem.quantity += quantity;
            cart.items[itemIndex] = productItem;
        } else {
            cart.items.push({productId, name, quantity, price})
        }
        cart.bill += quantity*price;
        cart = await cart.save();
        return res.status(201).send(cart);
  } else {
      // no cart exists, create one
      const newCart = await Cart.create({
          userId,
          items: [{productId, name, quantity, price}],
          bill: quantity*price
      })
      return res.staus(201).send(newCart);
  }
  catch(err){
      console.log(err)
      res.status(500).send('Something went wrong')
  }
};
