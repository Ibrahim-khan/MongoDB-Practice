const express = require('express');
const mongoose = require('mongoose');

const app = express();

const port = 3002;

app.use(express.json());
app.use(express.urlencoded({extended: true}));

// create product schema
const productSchema = new mongoose.Schema({
    title : {
        type: String,
        required: [true, "product title is required"],
        minlength: [3, "Minimum length of the product title should be 3"],
        maxlength: [100, "Maximum length of the product title should be 100"],
        // lowercase: true,
        // uppercase: true,
        trim: true, // trim ignore space after and before title
        // enum: {
        //     values: ["iphone", "samsung"], //accept only this item
        //     message: "{VALUE} is not supported",
        // }

                    // // for custom validation
                    // validate: {
                    //     validator: function (v) {
                    //        return v.length === 10
                    //     },
                    //     message: (props) => `${props.value} is not a valid title`,
                    // },
    },
    price : {
        type: Number,
        // min: [200, "Minimum price of the product should be 200"],
        // max: [100000, "Maximum price of the product should be 100000"],
    },
    rating: {
        type : Number,
        require: true,
    },
    // email{
    //     type: String,
    //     unique: true,   // that's mean user can't use multiple times
    // },

    description: String,

    phone: {
        type: String,
        require: [true, "Phone number is required"],
        validate: {
            validator: function(v){
                const phoneRegex = /\d{3}-\d{3}-\d{4}/;
                return phoneRegex.test(v);
            },
            message: (props) => `${props.value} is not a valid phone number`
        },
        required: [true, "User phone number required"]
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
});

// create product model
const Product = mongoose.model("Products", productSchema);

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/testProductDB');
        console.log("db is connected");
    } catch (error) {
        console.log("db is not connected");
        console.log(error.message);
        process.exit(1);
    }
}

// create server
app.listen(port, async()=> {
    console.log(`server is runngin at http://localhost:${port}`);
    await connectDB();
});

app.get("/", (req,res)=> {
    res.send("Welcome to Home page");
});

    // CRUD - Create, Read, Update, Delete
    // Create

    app.post("/products", async(req, res) => {
        try {
            const newProduct = new Product({
                title: req.body.title,
                price: req.body.price,
                rating: req.body.rating,
                description: req.body.description,
                phone: req.body.phone,
            });
            const productData = await newProduct.save();
            res.status(201).send(productData);
        }catch(error){
            res.status(500).send({ message: error.message});
        }
    });


    app.get("/products", async (req, res) => {
   
        try {
            const price = req.query.price;
            const rating = req.query.rating;
            let products;
           
            if(price && rating){
                products = await Product.find({
                    $or: [{ price: {$gt: price}}, { rating: { $gt: rating}}],
                });               
            } else {
                products = await Product.find();
            }
            if (products) {
                res.status(200).send({
                    success : true,
                    message : "return all products",
                    data : products,
                });
            } else{
                res.status(404).send({
                success: false,
                message : "products not found",
                });
            }
        } catch (error) {
            res.status(500).send({ message: error.message });
        }
    });


// app.post("/products", async (req, res) => {
   
//     try {
//         const products = await Product.find();
       
//         if(products){
//             res.status(200).send({
//                 success : true,
//                 message : "return all products",
//                 data : products
//             });
//         } else{
//             res.status(404).send({
//                 success: false,
//                 message : "products not found",
//             });
//         }
//     } catch (error) {
//         res.status(500).send({ message: error.message });
//     }
// })
   
   
   
   
   
   
    // try{       
        // // *This is for single documents*
        // const newProduct = new Product({
        //     title: req.body.title,
        //     price: req.body.price,
        //     description: req.body.description,
        // });

        // const productData = await newProduct.save();

        // *This is for multiple documents*
        // const productData = await Product.insertMany([
        //     {
        //         title : "Vivo 90",
        //         price: 10000,
        //         description : "Long lasting phone"
        //     },
        //     {
        //         title : "iphone 16",
        //         price : 100000,
        //         description : "Beautiful Phone"
        //     }
        // ]);

    //     res.status(201).send({productData});
    // }catch (error){
    //     res.status(500).send({ message: error.message });
    // }
//});

app.get("/products/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const product = await Product.findOne({ _id: id});
       
        if(product){
            res.status(200).send({
                success : true,
                message : "return single product",
                data : product 
            });
        } else{
            res.status(404).send({
                success: false,
                message : "product not found",
            });
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
})


app.delete("/products/:id", async(req,res) => {
    try {
        const id = req.params.id;
        const product = await Product.deleteOne({_id: id});

        if(product){
            res.status(200).send({
                success : true,
                message : "Product was deleted",
                data : product 
            });
        } else{
            res.status(404).send({
                success: false,
                message : "product was not deleted with this id",
            });
        }
    } catch (error) {
        res.status(500).send({ message: error.message});
    }
})

app.put("/products/:id", async (res,req) => {
    try {
        const id = req.params.id;
        const updatedProduct = await Product.updateOne(
            {_id: id}, 
            {
                $set : {
                    title: req.body.title,
                    price: req.body.price,
                    description: req.body.description,
                    rating: req.body.rating,
                },
            },
            {new: true}
        );
        
        if(updatedProduct){
            res.status(200).send({
                success : true,
                message : "Product Updated",
                data : updatedProduct,
            });
        } else{
            res.status(404).send({
                success: false,
                message : "Product not updated",
            });
        }
    } catch (error) {
        res.status(500).send({ message: error.message});
    }
});


// DATABASE -> collecitons -> document

// POST: /products -> create a product
// GET: /products -> Return all the products
// GET: /products/:id -> return a specific product
// PUT: /products/:id -> update a product based on id
// DELETE: /products/:id -> delete a product based on id


