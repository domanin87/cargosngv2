
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const secret = process.env.JWT_SECRET || 'dev';

router.post('/register', async (req,res)=>{
  try{
    const { email, password } = req.body;
    if(!email || !password) return res.status(400).json({ error:'email & password required' });
    const exists = await User.findOne({ where:{ email } });
    if(exists) return res.status(409).json({ error:'email_exists' });
    const hash = await bcrypt.hash(password, 10);
    const u = await User.create({ email, passwordHash: hash });
    const token = jwt.sign({ id:u.id, role:u.role, preferredLanguage:u.preferredLanguage, preferredCurrency:u.preferredCurrency }, secret);
    res.json({ token, user:{ id:u.id, email:u.email, role:u.role } });
  }catch(e){ console.error(e); res.status(500).json({ error:'register_failed' }); }
});

router.post('/login', async (req,res)=>{
  try{
    const { email, password } = req.body;
    const u = await User.findOne({ where:{ email } });
    if(!u) return res.status(401).json({ error:'invalid_credentials' });
    const ok = await bcrypt.compare(password, u.passwordHash);
    if(!ok) return res.status(401).json({ error:'invalid_credentials' });
    const token = jwt.sign({ id:u.id, role:u.role, preferredLanguage:u.preferredLanguage, preferredCurrency:u.preferredCurrency }, secret);
    res.json({ token, user:{ id:u.id, email:u.email, role:u.role } });
  }catch(e){ console.error(e); res.status(500).json({ error:'login_failed' }); }
});

module.exports = router;
