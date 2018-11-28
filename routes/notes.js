'use strict';

const express = require('express');
const Note = require('../models/note');
const mongoose = require('mongoose');

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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error('The `id` is not valid');
      err.status = 400;
      return next(err);
    }

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

  if (!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  const newNote = {
        title: title,
        content: content
    };
    return Note.create(newNote)
    .then(results => {
      res.location(`http://${req.headers.host}/notes/${results.id}`).status(201).json(results);
    })
    .catch(err => {
      next(err);
    })
  });

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {
  const id = req.params.id;
  const { title, content } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  if (!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

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

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  return Note.findByIdAndRemove(id)
  .then(results => {
    res.json(results);
  })
  .catch(err => {
    next(err);
  })
});

module.exports = router;
