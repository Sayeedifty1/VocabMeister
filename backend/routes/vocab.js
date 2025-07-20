const express = require('express');
const prisma = require('../config/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Upload vocabulary
router.post('/upload', async (req, res) => {
  try {
    const { vocabularyText, userId } = req.body;

    if (!vocabularyText || !userId) {
      return res.status(400).json({ error: 'Vocabulary text and userId are required' });
    }

    // Parse vocabulary text
    const lines = vocabularyText.trim().split('\n');
    const vocabItems = [];

    for (const line of lines) {
      const parts = line.split(' - ').map(part => part.trim());
      
      if (parts.length === 3) {
        const [german, english, bengali] = parts;
        
        if (german && english && bengali) {
          vocabItems.push({
            german,
            english,
            bengali,
            userId
          });
        }
      }
    }

    if (vocabItems.length === 0) {
      return res.status(400).json({ error: 'No valid vocabulary items found. Format: German - English - Bengali' });
    }

    // Save to database
    const savedVocabs = await prisma.vocab.createMany({
      data: vocabItems
    });

    res.json({ 
      message: `${savedVocabs.count} vocabulary items uploaded successfully`,
      count: savedVocabs.count
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get vocabulary list
router.get('/list', async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    const vocabs = await prisma.vocab.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' }
    });
    res.json({ vocabs });
  } catch (error) {
    console.error('List error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 