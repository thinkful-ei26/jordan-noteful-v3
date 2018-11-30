'use strict';

const express = require('express');
const mongoose = require('mongoose');
const Note = require('../models/note');
const Tag = require('../models/tags');

const router = express.Router();


/* ========== GET/READ ALL TAGS ========== */
router.get('/', (req, res, next) => {
    Tag.find({})
    .sort({ updatedAt: 'desc'})
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    })
  });

/* ========== GET/READ A SINGLE TAG ========== */
router.get('/:id', (req, res, next) => {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error('The `id` is not valid');
      err.status = 400;
      return next(err);
    }

    return Tag.findById(id)
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    })
});

/* ========== POST/CREATE A TAG ========== */
router.post('/', (req, res, next) => {
  const { name } = req.body;

  if (!name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  const newTag = {
        name: name
    };
    return Tag.create(newTag)
    .then(results => {
      res.location(`http://${req.headers.host}/notes/${results.id}`).status(201).json(results);
    })
    .catch(err => {
        if (err.code === 11000) {
            err = new Error('The tag name already exists');
            err.status = 400;
        }
        next(err);
        });
  });

/* ========== PUT/UPDATE A TAG ========== */
router.put('/:id', (req, res, next) => {
  const id = req.params.id;
  const { name } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  if (!name) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  const updateTag = {
    name: name
  }
  return Tag.findByIdAndUpdate(id, updateTag)
  .then(results => {
    res.json(results);
  })
  .catch(err => {
    if (err.code === 11000) {
      err = new Error('The folder name already exists');
      err.status = 400;
    }
    next(err);
  });
});

/* ========== DELETE/REMOVE A TAG & IT'S CONTENT ========== */
router.delete('/:id', (req, res, next) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  const deleteTagId = Tag.findByIdAndRemove(id)
  const deleteTagFromNotes = Note.updateMany({ tags: id}, { $pull: {tags: id} })
  
  Promise.all([deleteTagId, deleteTagFromNotes])
  .then(() => {
  return Note
      .deleteMany({ tagId: id })
      .then(res.sendStatus(204));
  })
  .catch(err => {
    next(err);
  })
});

module.exports = router;
