import Database from "better-sqlite3";
import express from 'express'
import cors from 'cors'


const app = express()
app.use(cors())
app.use(express.json())
const PORT = 4000;

const db = new Database('./data.db', {
    verbose: console.log
})

const createMuseums = db.prepare(`
CREATE TABLE IF NOT EXISTS museums(
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    city TEXT NOT NULL
    
)`)
createMuseums.run()
const createMuseum = db.prepare(` INSERT INTO museums (name, city) VALUES (? , ?);`)

const getAllMuseums = db.prepare(` SELECT * FROM museums;`)

const getMuseumById = db.prepare(` SELECT * FROM museums WHERE id=?;`)

const createWorks = db.prepare(`
CREATE TABLE IF NOT EXISTS  works(
    id INTEGER  PRIMARY KEY,
    name TEXT NOT NULL,
    picture TEXT NOT NULL,
    museum_id INTEGER,
    FOREIGN KEY(museum_id) REFERENCES museums(id)
)`)
createWorks.run()
const createWorksTable = db.prepare(`INSERT INTO works (name, picture, museum_id) VALUES (?, ?, ?);`)

const getAllWorks = db.prepare(`SELECT * FROM works;`)

const getFromWorksId = db.prepare(`SELECT * FROM works WHERE museum_id=?;`)

const deleteWork = db.prepare(`DELETE FROM works WHERE id=?;`) 

const deleteWorkMuseum = db.prepare(`DELETE FROM museums WHERE work_id = ?;`)


app.get('/museums', (req, res) => {
    const museums = getAllMuseums.all()
    for( const museum of museums){
        const work = getFromWorksId.get(museum.work_id)
        museum.work =work
    }
    res.send(museums)
   
})

app.get('/works', (req, res) =>{
    const works = getAllWorks.all()
    res.send(works)
})

app.get('/works/:id', (req, res) => {
    const id = req.params.id
    const work = getFromWorksId.get(id)

    if(work){
        const museums = getFromWorksId.all(work.id)
        work.museums = museums
        res.send(work)
    } else{
        res.status(404).send({ error: 'Work not found!'})
    }
})

app.post('/works', (req, res) => {
    const {name , picture} = req.body
    const info = createWorks.run(name, picture)

    if(info.changes > 0 ){
        const work = getFromWorksId.get(info.lastInsertRowid)
        res.send(work)
    }else{
        res.send({ error: 'Something went wrong!'})
    }
})

app.post('/museums', (req, res) => {
    const { name, city} = req.body
    const info = createMuseum.run(name, city)

    if(info.changes >0){
        const work = getFromWorksId.get(info.lastInsertRowid)
        res.send(work)
    }else{
        res.send({ error: 'Something went wrong!'})
    }
})

app.delete('/works/:id' , (req, res) =>{
    const id = req.params.id
    deleteWorkMuseum.run(id)
    const info = deleteWork.run(id)

    if( info.changes > 0){
        res.status(404).send({ error: 'Work not found!'})
    }else{
        res.send({ message: 'Work deleted!'})
    }
})

app.listen(4000, () => console.log(`Listening on:  http://localhost:4000`))

