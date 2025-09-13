
const router = require('express').Router();
const { Cargo } = require('../models');

router.post('/create', async (req,res)=>{
  try{
    const p = req.body;
    const c = await Cargo.create({
      title: p.title || 'title',
      title_i18n: p.title_i18n || null,
      description: p.description || null,
      description_i18n: p.description_i18n || null,
      origin_country: p.origin_country || null,
      dest_country: p.dest_country || null,
      weight: p.weight || 0,
      price: p.price || 0,
      currency: p.currency || process.env.BASE_CURRENCY || 'KZT',
      user_id: p.user_id || null
    });
    res.status(201).json({ success:true, cargo:c });
  }catch(e){ console.error(e); res.status(500).json({ error:'create_failed' }); }
});

router.get('/list', async (req,res)=>{
  try{
    const list = await Cargo.findAll({ order:[['created_at','DESC']] });
    const mapped = list.map(c=>({ id:c.id, title:c.title, price:c.price, currency:c.currency, origin:c.origin_country, dest:c.dest_country, status:c.status, createdAt:c.created_at }));
    res.json(mapped);
  }catch(e){ console.error(e); res.status(500).json({ error:'list_failed' }); }
});

module.exports = router;
