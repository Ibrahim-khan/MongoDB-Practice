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
        required: true
    },
    price : Number,
    description: String,
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


app.listen(port, async()=> {
    console.log(`server is runngin at http://localhost:${port}`);
    await connectDB();
});

app.get("/", (req,res)=> {
    res.send("Welcome to Home page");
});

    // CRUD - Create, Read, Update, Delete
    // Create

    app.get("/products", async (req, res) => {
   
        try {
            // const price = req.query.price;
            const products = await Product.find(); //{price : {$gt: price}}
           
            if(products){
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
    })

app.post("/products", async (req, res) => {
   
    try {
        const products = await Product.find();
       
        if(products){
            res.status(200).send({
                success : true,
                message : "return all products",
                data : products
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
})
   
   
   
   
   
   
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
                    price: req.body.price,
                },
            },
            {new: true}
        );
        
        if(updatedProduct){
            res.status(200).send({
                success : true,
                message : "Product Updated",
                data : updatedProduct
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
})


// DATABASE -> collecitons -> document

// POST: /products -> create a product
// GET: /products -> Return all the products
// GET: /products/:id -> return a specific product
// PUT: /products/:id -> update a product based on id
// DELETE: /products/:id -> delete a product based on id


