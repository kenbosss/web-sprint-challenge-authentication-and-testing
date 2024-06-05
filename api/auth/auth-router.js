const router = require('express').Router();
const bcrypt = require('bcryptjs')
const db = require('../../data/dbConfig')
const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET || 'shh'

router.post('/register', async (req, res) => {
  const {username, password} =req.body
 if(!username || !password){
  return res.status(400).json({message: 'username and password required'})
 }
 try {
 const hashed = bcrypt.hashSync(password,8)
  const[id] = await db('user').insert({username,password:hashed})
  const newuser = await db('user').where({id}).first()
  res.status(201).json(newuser)

 } catch(e){
  if(e.code === 'SQLITE_CONSTRAINT'){
    res.status(400).json({message:'username taken'})
  } else {
    res.status(500).json({message:'Internal server error'})
  }
 }

});

router.post('/login', async (req, res) => {
  const { username, password} =req.body
try{
  const user = await db('user').select('*').where({username}).first()
  if(user && await bcrypt.compareSync(password, user.password)){
    const payload = {userId: user.id}
    const token = jwt.sign(payload,JWT_SECRET, {expiresIn:'1h'})
    res.json({message:`welcome ${user.username, token}`})
  } else {
    res.status(401).json({message:'invalid credentials'})
  }
} catch (e) {
  res.status(500).json({message: 'username and passwword required'})
} 
  }
);

module.exports = router;
