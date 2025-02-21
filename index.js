const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');
const express = require('express');
const app = express();
const Path = require('path');
const methodOverride = require('method-override');
const{ v4: uuidv4 } = require('uuid');

app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', Path.join(__dirname, "/Views"));
app.use(methodOverride('_method'))




const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'delta_app',
    password: 'Asdfghjk9870@',
});
// Function to generate a random username 

let getRandomUser = () => {
    return [
        faker.string.uuid(), // Use 'id' to match the schema
        faker.internet.userName(),
       faker.internet.email(),
        faker.internet.password(),
    ];
};

const qu = "INSERT INTO user (id, username, email, password) VALUES ?"; 

let data =[];



// connection.query(q, [data], (err, result) => {
//     if (err) {
//         console.error("Error inserting data:", err.message);
//     } else {
//         console.log("Rows inserted:", result.affectedRows);
//     }
//     connection.end(); // Close connection inside callback to avoid premature termination
// });

const port = 8080;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

app.get('/', (req, res) => {
    let q = 'SELECT count(*) FROM user';
    connection.query(q, (err, result) => {
        if (err) {
            console.error("Error inserting data:", err.message);
            res.send("some error occured");
        } else {
            let count = result[0]["count(*)"];
            res.render("index.ejs",{count});
        }
       //connection.end(); // Close connection inside callback to avoid premature termination
    }); 
});
// /user route: Fetch and display all users
app.get('/user', (req, res) => {
    let q = `SELECT * FROM user`;
    connection.query(q, (err, users) => {
        if (err) {
            console.error("Error fetching users:", err.message);
            return res.status(500).send("Some error occurred");
        }
        // Pass the result to the EJS template
        res.render("showusers.ejs",{users});
    });
});

//edit route
app.get("/user/:id/edit", (req, res) => {
    let {id} = req.params;
    let q = `select *From user where id = '${id}'`;
    connection.query(q, (err, result) => {
        if (err) {
            console.error("Error fetching users:", err.message);
            return res.status(500).send("Some error occurred");
        }
        // Pass the result to the EJS template
       let user = result[0];
        res.render("edit.ejs",{user});
    });
    
});

app.patch("/user/:id", (req, res) => {
    const { id } = req.params;
    const { password: formpass, username: newusername } = req.body;

    const q = `SELECT * FROM user WHERE id = ?`; // Use parameterized query
    connection.query(q, [id], (err, result) => {
        if (err) {
            console.error("Error fetching user:", err.message);
            return res.status(500).send("Some error occurred");
        }

        if (result.length === 0) { // Check if user exists
            return res.status(404).send("User not found");
        }

        const user = result[0];

        if (formpass !== user.password) { // Important: Hash passwords for comparison in real applications
            return res.status(401).send("Incorrect password"); // Use 401 Unauthorized
        }

        const q2 = `UPDATE user SET username = ? WHERE id = ?`; // Use parameterized query
        connection.query(q2, [newusername, id], (err, result2) => {
            if (err) {
                console.error("Error updating user:", err.message);
                return res.status(500).send("Some error occurred");
            }

            if (result2.affectedRows === 0) { // Check if update was successful
              return res.status(404).send("User not found for update");
            }

            res.redirect("/user");
        });
    });
});

//add new user
app.get("/user/new",(req,res)=>{
    res.render("add.ejs");
})

app.post("/user",(req,res)=>{
    let {username,email,password} = req.body;
    let id = uuidv4();
    let q = `INSERT INTO user (id, username, email, password) VALUES (?, ?, ?, ?)`;
    connection.query(q, [id, username, email, password], (err, result) => {
        if (err) {
            console.error("Error inserting user:", err.message);
            return res.status(500).send("Some error occurred");
        }
        res.redirect("/user");
    });

})

//delete user
app.delete("/user/:id",(req,res)=>{
    let {id} = req.params;
    let q = `DELETE FROM user WHERE id = ?`;
    connection.query(q, [id], (err, result) => {
        if (err) {
            console.error("Error deleting user:", err.message);
            return res.status(500).send("Some error occurred");
        }
        res.redirect("/user");
    });
});