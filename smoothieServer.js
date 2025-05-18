/* Imports */
const express = require("express"); 
const fs = require("fs");
const path = require("path");

require("dotenv").config({
   path: path.resolve(__dirname, "credentialsDontPost/.env"),
});

const bodyParser = require("body-parser"); 
const app = express(); 
const portNumber = 5005;
const fruits = [
    "strawberry", 
    "banana", 
    "pear", 
    "blackberry", 
    "kiwi", 
    "pineapple", 
    "fig", 
    "passionfruit", 
    "raspberry", 
    "mango", 
    "blueberry", 
    "apple", 
    "peach"
]

// make table, connect to mongo db, 
require("dotenv").config({
   path: path.resolve(__dirname, ".env"),
});
const { MongoClient, ServerApiVersion } = require("mongodb");
const { url } = require("inspector");
const { emitWarning } = require("process");

app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "templates"));
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static('templates'));

router = express.Router();
app.use("/", router);

// const homeURL = `https://smoothie-calculator.onrender.com`
const homeURL = `http://localhost:${portNumber}`

/* Rendering Page */
router.get("/", (request, response) => {
    response.render("index")
});

router.get("/smoothieMaker", (req, res) => {
    res.render("smoothieMaker", {msg: "", url: homeURL+"/smoothieMaker"});
});

router.post("/smoothieMaker", async (req, res) => {
    const {strawberry, banana, pear, blackberry, kiwi, pineapple, fig, passionfruit, raspberry, mango, blueberry, apple, peach, smoothieName} = req.body;
    let fruits = {strawberry, banana, pear, blackberry, kiwi, pineapple, fig, passionfruit, raspberry, mango, blueberry, apple, peach};

    for (fruit in fruits) { //filter fruits
        if (fruits[fruit] == "") {
            delete fruits[fruit];
        }
    }

    const nutritionInfo = await getNutrition(fruits);
    let msg = "Smoothie saved!";

    (async () => {
        const databaseName = process.env.MONGO_DB_NAME;
        const collectionName = process.env.MONGO_COLLECTION
        const uri = process.env.MONGO_CONNECTION_STRING;
        const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });

        try {
            await client.connect();
            const database = client.db(databaseName);
            const collection = database.collection(collectionName);
            
            const recipie = {name: smoothieName, recipie: fruits, nutrition: nutritionInfo}
            result = await collection.insertOne(recipie);
        } catch (e) {
            console.error(e);
            msg = "Error: saving failed";
        } finally {
            await client.close();
            res.render("smoothieMaker", {url: homeURL+"/smoothieMaker", msg: msg});
        }
    })();
});

router.get("/smoothieGetter", (req, res) => {
    res.render("smoothieGetter", {
        url: homeURL+"/smoothieGetter",
        name: "",
        ingredientsTable: "",
        nutritionTable: ""
    });
});

router.post("/smoothieGetter", (req, res) => {
    const {name} = req.body;
    let msg = name;
    let ingredientsTable = [];
    let nutritionTable = []; 

    (async () => {
        const databaseName = process.env.MONGO_DB_NAME;
        const collectionName = process.env.MONGO_COLLECTION
        const uri = process.env.MONGO_CONNECTION_STRING;
        const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });

        try {
            await client.connect();
            const database = client.db(databaseName);
            const collection = database.collection(collectionName);
            let filter = {name: name}; // #TODO
            const result = await collection.findOne(filter);
            if (!result) {
                msg = "No smoothie found with that name";
                ingredientsTable = "";
                nutritionTable = "";
            }
            else {
                ingredientsTable = getNutritionTable(result.nutrition);
                nutritionTable = getRecipieTable(result.recipie);
            }
         } catch (e) {
            console.error(e);
         } finally {
            await client.close();
            res.render("smoothieGetter", {
                url: homeURL+"/smoothieGetter",
                name: msg,
                ingredientsTable: ingredientsTable,
                nutritionTable: nutritionTable,
            });
         }
    })();
}
);

async function getNutrition(fruitJson) {
    // MAKE RETURN IN TABLE FORM LATER
    // let caloriesT, fatT, sugarT, carbohydratesT, proteinT = 0;
    let caloriesT = 0;
    let fatT = 0;
    let sugarT = 0;
    let carbohydratesT = 0;
    let proteinT = 0;
    for (fruit in fruitJson) { // need to use try catch? // NAMES WILL BE DIFF?
        const name = fruit; // get name of fruit
        const count = Number(fruitJson[name]); // get quantity of fruit 

        if (count > 0) {
            const res = await fetch(`https://www.fruityvice.com/api/fruit/${name}`);
            const data = await res.json();

            const {calories, fat, sugar, carbohydrates, protein} = data.nutritions;
            caloriesT += calories * count;
            fatT += fat * count;
            sugarT += sugar * count;
            carbohydratesT += carbohydrates * count;
            proteinT += protein * count;
        }
        
    }
    caloriesT = (caloriesT).toFixed(2);
    fatT = (fatT).toFixed(2);
    sugarT = (sugarT).toFixed(2);
    carbohydratesT = (carbohydratesT).toFixed(2);
    proteinT = (proteinT).toFixed(2);
    
    return {caloriesT, fatT, sugarT, carbohydratesT, proteinT}
}

function getRecipieTable(fruitJson) {
    let table = "<table><tr><th>Fruit</th><th>Quantity</th></tr>";
    for (fruit in fruitJson) {
        amount = fruitJson[fruit];
        if (amount > 0) {
            table += `<tr><td>${fruit}</td><td>${amount}</td></tr>`;
        }
    }
    table += "</table>";
    return table;
}

function getNutritionTable(nutritionInfo) {
    let table = "<table><tr><th>Nutrient</th><th>Amount</th></tr>";
    table += `<tr><td>Calories</td><td>${nutritionInfo.caloriesT}</td></tr>`;
    table += `<tr><td>Fat</td><td>${nutritionInfo.fatT}</td></tr>`;
    table += `<tr><td>Sugar</td><td>${nutritionInfo.sugarT}</td></tr>`;
    table += `<tr><td>Carbohydrates</td><td>${nutritionInfo.carbohydratesT}</td></tr>`;
    table += `<tr><td>Protein</td><td>${nutritionInfo.proteinT}</td></tr>`;
    
    table += "</table>";
    return table;
}

router.use((request, response) => {
    response.status(404).send("Resource Not Found (in building router)");
});

app.listen(portNumber);
module.exports = router;