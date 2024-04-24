import './db.mjs';

import flash from 'connect-flash';

import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import session from 'express-session';
import hbs from 'hbs';
import { User, Post, Reply, Goal } from './models.js'; // Import your mongoose models


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
    
app.get("/goals", (req, res) => {
    res.render('goals');
});


app.listen(3000);
console.log("http://127.0.0.1:3000/");