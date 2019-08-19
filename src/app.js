import express from "express";
import path from "path";
import fs from "fs";
import slugify from "slugify";

import Entities from 'html-entities';

const entities = Entities.Html5Entities;

const app = express();

const port = "9090";

const asset_dir = 'assets';

const debug = true;

// view engine setup
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'twig');

app.use(express.static(path.join(__dirname,'/assets') ));


/**
 * @param base_path string
 * @return array lessons dir
 * */
function getLessons(base_path) {

    /**
     * 1. scan dir lessons
     * 2. create array with subdir names
     */

    const parentDir = path.join(__dirname, asset_dir,base_path);

    let childrenDir = [];
    let files = fs.readdirSync(parentDir);

    files.forEach((dir) => {
        if (fs.lstatSync(path.join(parentDir, dir)).isDirectory()) {

            let htmlContent = '';
            let html_file = path.join(parentDir, dir, 'main.html');
            if (fs.existsSync(html_file)) {

                // htmlContent = fs.readFileSync('file://'+entities.encode(html_file),'utf8');
                htmlContent = fs.readFileSync(html_file, 'utf8');

            }

            childrenDir.push({
                js_path     : path.join('/',base_path,dir, 'main.js'),
                html_content: htmlContent,
                name        : dir,
                slug        : slugify(dir, "_")
            })

        }

    });

    return childrenDir
}

app.get('/',(req,res)=>{

    const lessons = getLessons('lessons');
    res.render('home',{ pages: lessons,title: "Homepage Index",debug: debug });
});

app.get('/lessons/:lesson',(req,res)=>{
// app.get('/lessons/01_Redux:_The_Single_Immutable_State_Tree',(req,res)=>{
    const requested_lesson = req.params.lesson;
    const lessons = getLessons('lessons');

    if (debug) {
        console.log('lessons', lessons);
        console.log('requested_lesson', requested_lesson);
    }

    let lesson_match = lessons.find(lesson => {

        if(debug){
            console.log('lesson.slug', lesson.slug );
        }

        return lesson.slug === requested_lesson;
    });

    if(debug) {
        console.log('lesson_match', lesson_match);
    }
    if( typeof lesson_match !== 'undefined' ){

        res.render('lesson',{lesson: lesson_match, title: lesson_match.name})

    } else {

        res.redirect("/");

    }


});

app.listen(port);
