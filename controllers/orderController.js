import Order from "../models/order.js";
import Product from "../models/product.js";

export async function createOrder(req, res){
    
    // if(req.user == null){
    //     res.status(401).json(
    //         {
    //             message : "Unauthorized user"
    //         }
    //     )
    //     return
    // }

    try{

        const user = req.user;
        if (user == null) {
            res.status(401).json(
                {
                    message : "Unauthorized user"
                }
            );
            return;
        }

        const orderList = await Order.find().sort({date:-1}).limit(1);
        let newOrderId = "CBC00000001";
        
        if(orderList.length != 0){
            let lastOrderIdInString = orderList[0].orderId;
            let lastOrderNumberInString = lastOrderIdInString.replace("CBC","");
            let lastOrderNumber = parseInt(lastOrderNumberInString);
            let newOrderNumber = lastOrderNumber + 1;
            //padStart
            let newOrderNumberInString = newOrderNumber.toString().padStart(7,"0");
            newOrderId = "CBC" + newOrderNumberInString;
        }

        let customerName = req.body.customerName;
        if (customerName == null) {
            customerName = user.firstName + " " + user.lastName;
        }

        let phone = req.body.phone;
        if (phone == null) {
            phone = "Not provided"
        }

        const itemsInRequest = req.body.items;

        if (itemsInRequest == null) {
            res.status(400).json(
                {
                    message : "Items are required to place an order"
                }
            );
            return;
        }

        if (!Array.isArray(itemsInRequest)) {
            res.status(400).json(
                {
                    message : "Items should be an array"
                }
            );
            return;
        }

        const itemsToBeAdded = [];
        let total = 0;

        for (let i = 0; i < itemsInRequest.length; i++) {
            const item = itemsInRequest[i];

            const product = await Product.findOne({productId: item.productId});

            if (product == null) {
                res.status(400).json(
                    {
                        code : "not found",
                        message : `Product with ID ${item.productId} not found`,
                        productId : item.productId
                    }
                );
                return;
            }

            if (product.stock < item.quantity) {
                res.status(400).json(
                    {
                        code : "stock",
                        message : `Insufficient stock for product with ID ${item.productId}`,
                        productId : item.productId,
                        availableStock : product.stock
                    }
                );
                return;
            }

            itemsToBeAdded.push({
                productId : product.productId,
                quantity : item.quantity,
                name : product.name,
                price : product.price,
                image : product.images[0]
            });

            total += product.price * item.quantity;
        }

        const newOrder = new Order({
            orderId : newOrderId,
            items : itemsToBeAdded,
            customerName : customerName,
            email : user.email,
            phone : phone,
            address : req.body.address,
            total : total,
            status : "pending"
        });

        const savedOrder = await newOrder.save()

        // for (let i = 0; i < itemsToBeAdded.length; i++) {
        //     const item = itemsToBeAdded[i];
        //     await Product.updateOne(
        //         {productId: item.productId},
        //         {$inc: {stock: -item.quantity}}
        //     );
        // }

        res.status(201).json(
            {
                message : "Order created successfully",
                order : savedOrder
            }
        )

    }catch(err){
        res.status(500).json(
            {
                message : "Internal server error",
                
            }
        );
        console.log(err);
    }
}

export async function getOrders(req, res){
    if (isAdmin(req)) {
        const orders = await Order.find().sort({date:-1});
        res.json(orders);
    }else if(isCustomer(req)){
        const user = req.user;
        const orders = await Order.find({email: user.email}).sort({date:-1});
        res.json(orders);
    }else{
        res.status(403).json(
            {
                message: "You are not authorized to view orders"
            }
        );
    }
}