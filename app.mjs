import './db.mjs';

import flash from 'connect-flash';

import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import session from 'express-session';
import hbs from 'hbs';


const app = express();

const sessionOptions = {
    secret: "abcdefg",
    resave: true,
      saveUninitialized: true
};
app.use(session(sessionOptions));
app.use(flash());

import {User, Post, Reply, Goal} from './db.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'hbs');

app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
    res.render('home');
});

app.get("/articles", (req, res) => {
    res.render('articles');
});

app.get("/faq", (req, res) => {
    res.render('faq');
});

app.get("/diary", (req, res) => {
    res.render('diary');
});

app.get("/addDiary", (req, res) => {
    res.render('addDiary');
});

app.get("/community", (req, res) => {
    res.render('community');
});

app.get("/addPost", (req, res) => {
    res.render('addPost');
});
    
app.get("/goals", async (req, res) => {
    // Fetch all goals of the user
    const userID = "userid"; //remove
    const userGoals = await Goal.find({ user: userID }); //change to req.user._id
    console.log("goals", userGoals); 
    res.render('goals', {userGoals: userGoals});
});

app.post("/goals", async (req, res) => {
    try {
        // Parse the form data
        const { goalContent } = req.body;

        // remove 
        const userID = "userid";

        await Goal.create({
            content: goalContent,
            user: userID, //remove and change to req.user._id
        });

        const userGoals = await Goal.find({ user: userID }); //change to req.user._id
        // Render the goals template with the user's goals
        res.render('goals', { userGoals: userGoals });
    } catch (error) {
        // Handle any errors
        console.error('Error adding goal:', error);
        res.status(500).send('Internal Server Error');
    }
});


app.listen(3000);
console.log("http://127.0.0.1:3000/");