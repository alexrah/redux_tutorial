import express from "express";
import path from "path";
import fs from "fs";
import slugify from "slugify";
import myconf from "./config";

// let myconf = new config();

const app = express();

// view engine setup
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'twig');

app.use(express.static(path.join(__dirname,'/assets') ));

app.use(function (req, res, next) {
    res.locals = {
        host: req.headers.host,
        author: myconf.author,
    };
    next();
});

/**
 * @param base_path string
 * @return array lessons dir
 * */
function getLessons(base_path) {

    /**
     * 1. scan dir lessons
     * 2. create array with subdir names
     */

    const parentDir = path.join(__dirname, myconf.asset_dir,base_path);

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
                js_path     : path.join('/js',base_path,dir, 'bundle.js'),
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
    res.render('home',{ pages: lessons,title: "Homepage Index",debug: myconf.debug });
});

app.get('/lessons/:lesson',(req,res)=>{
// app.get('/lessons/01_Redux:_The_Single_Immutable_State_Tree',(req,res)=>{
    const requested_lesson = req.params.lesson;
    const lessons = getLessons('lessons');

    if (myconf.debug) {
        console.log('lessons', lessons);
        console.log('requested_lesson', requested_lesson);
    }

    let lesson_match = lessons.find(lesson => {

        if(myconf.debug){
            console.log('lesson.slug', lesson.slug );
        }

        return lesson.slug === requested_lesson;
    });

    if(myconf.debug) {
        console.log('lesson_match', lesson_match);
    }
    if( typeof lesson_match !== 'undefined' ){

        res.render('lesson',{lesson: lesson_match, title: lesson_match.name})

    } else {

        res.redirect("/");

    }


});

app.listen(myconf.port);
