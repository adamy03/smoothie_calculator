/* Imports */
const express = require("express"); 
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser"); /* To handle post parameters */
const app = express(); 
const portNumber = 5005;

require("dotenv").config({
   path: path.resolve(__dirname, ".env"),
});
const { MongoClient, ServerApiVersion } = require("mongodb");
const { url } = require("inspector");


app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "templates"));
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static('templates'));

const homeURL = `http://localhost:${portNumber}`


/* Command Line Interface */
process.stdin.setEncoding("utf8");

/* Rendering Page */
app.get("/", (req, res) => {
    res.render("index");
});

app.get("/smoothieMaker", (req, res) => {
    res.render("smoothieMaker", {url: homeURL+"/smoothieMaker"});
});


app.post("/smoothieMaker", (req, res) => {
    const {name} = req.body; // #TODO
    (async () => {
        const databaseName = process.env.MONGO_DB_NAME;
        const collectionName = process.env.MONGO_COLLECTION
        const uri = process.env.MONGO_CONNECTION_STRING;
        const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });
     
        try {
            await client.connect();
            const database = client.db(databaseName);
            const collection = database.collection(collectionName);
            
            const recipie = {}; //#TODO 
            result = await collection.insertOne(recipie);
        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
            res.render("smoothieMaker", {
                name: name,
                email: email,
                gpa: gpa,
                background: background,
            });
        }
    })();

    
});

app.get("/smoothieGetter", (req, res) => {
    res.render("smoothieGetter", {
        url: homeURL+"/smoothieGetter",
        name: "",
        ingredientsTable: "",
        nutritionTable: ""
    });
});

app.get("")

app.post("/smoothieGetter", (req, res) => {
    const {name} = req.body;
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
            let filter = {recipieName: name}; // #TODO
            const result = await collection.findOne(filter);

            if (!result) {
                msg = "No smoothie found with that name";
                ingredientsTable = "";
                nutritionTable = "";
            }
            else {
                name = result.recipieName;
                ingredientsTable = result.ingredients
                nutritionTable = result.nutritionTable 
            }
         } catch (e) {
            console.error(e);
         } finally {
            await client.close();
            res.render("smoothieGetter", {
                url: homeURL+"/smoothieGetter",
                name: name,
                ingredientsTable: ingredientsTable,
                nutritionTable: nutritionTable,
            });
         }
    })();
}
);

function getIngredientTable(ingredientsData) { 
    tableStr = "<div>"
    
    tableStr += "</div>"
}

async function getNutrition(fruitJson) {
    // MAKE RETURN IN TABLE FORM LATER
    let caloriesT, fatT, sugarT, carbohydratesT, proteinT = 0;
    for (fruit in fruitJson) { // need to use try catch? // NAMES WILL BE DIFF?
        const name = Object.keys(fruit)[0]; // get name of fruit
        const count = fruit[name]; // get quantity of fruit 
    
        const res = await fetch(`https://www.fruityvice.com/api/fruit/${name}`);
        const data = await res.json();

        const {calories, fat, sugar, carbohydrates, protein } = data.nutritions;
        caloriesT += calories * count;
        fatT += fat * count;
        sugarT += sugar * count;
        carbohydratesT += carbohydrates * count;
        proteinT += protein * count;
    }
    crossOriginIsolated.log("cals test: ${caloriesT}");
}

app.listen(portNumber);