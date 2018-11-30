'use strict';

const express = require('express');
const Note = require('../models/note');
const mongoose = require('mongoose');

const router = express.Router();


/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
    const { searchTerm, folderId } = req.query;

    const regex = new RegExp(searchTerm, 'i');

    let noteFilter = {};

    if (searchTerm) {
      noteFilter.$or = [{ 'title': regex}, { 'content': regex}]
    }

    if (folderId) {
      noteFilter.folderId = folderId;
    }

    Note.find(noteFilter)
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
  const { title, content, folderId } = req.body;

  if (!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  if (folderId && !mongoose.Types.ObjectId.isValid(folderId)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  const newNote = {
        title: title,
        content: content,
        folderId: folderId
    };

    if (folderId === ""){
      newNote.folderId = null;
    }

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
  const { title, content, folderId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  if (!mongoose.Types.ObjectId.isValid(folderId)) {
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
    content: content,
    folderId: folderId
  }

  if (folderId === "") {
    delete updatedNote.folderId;
    updatedNote.$unset = { folderId: ' ' }
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
  const { note } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id, note)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  return Folder.findByIdAndRemove(id, note)
  .then(results => {
    res.json(results);
  })
  .catch(err => {
    next(err);
  })
});

module.exports = router;
