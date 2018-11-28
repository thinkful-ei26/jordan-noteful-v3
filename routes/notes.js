'use strict';

const express = require('express');

const Note = require('../models/note');

const router = express.Router();


/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
    const { searchTerm } = req.query;
    const regex = new RegExp(searchTerm, 'i');
    let filter = {};
    filter.$or = [{ 'title': regex}, { 'content': regex}]
        
    Note.find(filter)
    .sort({ updatedAt: 'desc'})
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    })
  });

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {
    const id = req.params.id;
    return Note.findById(id)
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    })
});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {
  const { title, content } = req.body;
  const newNote = {
        title: title,
        content: content
    };
    return Note.create(newNote)
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    })
  });

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {
  const id = req.params.id;
  const { title, content } = req.body;
  const updatedNote = {
    id: id,
    title: title,
    content: content
  }
  return Note.findByIdAndUpdate(id, updatedNote)
  .then(results => {
    res.json(results);
  })
  .catch(err => {
    next(err);
  })

});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {
  const id = req.params.id;
  return Note.findByIdAndRemove(id)
  .then(results => {
    res.json(results);
  })
  .catch(err => {
    next(err);
  })
});

module.exports = router;
