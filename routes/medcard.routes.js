const express = require('express');
const router = express.Router();
const medCardModel = require('../modals/medcardmodel');
const authenticateToken = require('../middleware/auth');

router.post('/', authenticateToken, async (req, res) => {
  try {
    const existing = await medCardModel.findOne({ email: req.body.email });

    if (existing) {
      await medCardModel.updateOne(
        { email: req.body.email },
        {
          $push: {
            med_card: {
              title: req.body.title,
              description: req.body.description,
              duration: req.body.duration,
              price: req.body.price,
            }
          }
        }
      );
      res.status(200).json({ success: true, message: 'Med card updated' });
    } else {
      const newCard = new medCardModel({
        email: req.body.email,
        med_card: {
          title: req.body.title,
          description: req.body.description,
          duration: req.body.duration,
          price: req.body.price,
        },
      });
      const saved = await newCard.save();
      res.status(201).json({ success: true, data: saved });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error handling med card' });
  }
});

module.exports = router;
