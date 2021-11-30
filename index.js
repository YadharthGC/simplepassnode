const express = require("express")
const app = express();
const cors = require("cors")
const mongodb = require("mongodb");
//const url = 'mongodb://localhost:27017';
const url = "mongodb+srv://ganesh:chitra@cluster0.2pjhw.mongodb.net/booking?retryWrites=true&w=majority"
const mongoclient = mongodb.MongoClient
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 3003

app.use(cors({
    origin: "*"
}))
app.use(express.json())
    ////////////////////////
    ////////////////////////

function authenthicate(req, res, next) {
    try {
        if (req.headers.authorization) {
            jwt.verify(req.headers.authorization, "7x~Xd\;x\E\5K!?D", function(error, decoded) {
                if (error) {
                    console.log("error55")
                } else {
                    next()
                }
            });
        } else {
            console.log("error66")
        }
    } catch (error) {}
}

app.post("/register", async function(req, res) {
    try {
        let client = await mongoclient.connect(url);
        let db = client.db("ptask")
        let salt = bcrypt.genSaltSync(10)
        let hash = bcrypt.hashSync(req.body.password, salt)
        req.body.password = hash
        let post = await db.collection("registers").insertOne(req.body)
        await client.close()
    } catch (error) {
        console.log("error5")
    }
})


app.post("/login", async function(req, res) {
    try {
        let client = await mongoclient.connect(url);
        let db = client.db("ptask")
        let users = await db.collection("registers").find({
            gmail: req.body.gmail
        }).toArray()
        console.log(users)
        if (users) {
            let match = await bcrypt.compareSync(req.body.password, users[0].password);
            if (match) {
                let token = jwt.sign({
                    id: users._id
                }, "7x~Xd\;x\E\5K!?D");
                let deel = await db.collection("home").deleteMany({})
                let post = await db.collection("home").insertMany(users)

                res.json({
                    message: true,
                    token
                })
            } else {
                console.log("errorrrrr")
            }
        } else {
            console.log("error333")
        }
    } catch (error) {
        console.log("errorapple")
        console.log(error)
    }
})


app.get("/details", [authenthicate], async function(req, res) {
    try {
        let client = await mongoclient.connect(url);
        let db = client.db("ptask");
        let get = await db.collection("home").find().toArray()
        console.log(get)
        res.json(get);
        await client.close();
    } catch (error) {
        console.log("get error")
        console.log(error)
    }
})

app.put("/edit/:id", [authenthicate], async function(req, res) {
    try {
        console.log(req.params.id, req.body)
        let client = await mongoclient.connect(url);
        let db = client.db("ptask");
        let put = await db.collection("registers").findOneAndUpdate({
            _id: mongodb.ObjectId(req.params.id)
        }, {
            $set: {
                name: req.body.name,
                no: req.body.no,
                street: req.body.street,
                city: req.body.city,
                district: req.body.district,
                state: req.body.state,
                pin: req.body.pin,
            }
        })
        let putt = await db.collection("home").findOneAndUpdate({
            _id: mongodb.ObjectId(req.params.id)
        }, {
            $set: {
                name: req.body.name,
                no: req.body.no,
                street: req.body.street,
                city: req.body.city,
                district: req.body.district,
                state: req.body.state,
                pin: req.body.pin,
            }
        })
        await client.close()
    } catch (error) {
        console.log(error)
        console.log("no edit")
    }

})

// app.get("/already", async function(req, res) {
//     try {
//         console.log("got")
//         let client = await mongoclient.connect(url);
//         let db = client.db("ptask");
//         let get = await db.collection("home").find({}).toArray();
//         console.log(get)
//         res.json(get);
//         await client.close();
//     } catch (error) {
//         console.log("errortt")
//     }
// })


//////////////////////
////////////////////
app.listen(port, function() {
    console.log(`App is Running in ${port}`);
})