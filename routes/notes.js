'use strict';

const express = require('express');
const Note = require('../models/note');
const mongoose = require('mongoose');

const router = express.Router();


/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
    const { searchTerm, folderId, tags } = req.query;

    const regex = new RegExp(searchTerm, 'i');

    let noteFilter = {};

    if (searchTerm) {
      noteFilter.$or = [{ 'title': regex}, { 'content': regex}]
    }

    if (folderId) {
      noteFilter.folderId = folderId;
    }

    if (tags) {
      noteFilter.tags = tags;
    }

    Note.find(noteFilter)
    .populate('tags')
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
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error('The `id` is not valid');
      err.status = 400;
      return next(err);
    }

    return Note.findById(id)
    .populate('tags')
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    })
});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {
  const { title, content, folderId, tags } = req.body;

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

  for (let i = 0; i < tags.length; i++) {
    if(tags[i] && !mongoose.Types.ObjectId.isValid(tags[i])) {
      const err = new Error('The `tags` id is not valid');
      err.status = 400;
      return next(err);
    } 
  }

  const newNote = {
        title: title,
        content: content,
        folderId: folderId,
        tags: tags
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
    newNote.save();
    })

  });

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {
  const id = req.params.id;
  const { title, content, folderId, tags } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  if (folderId && !mongoose.Types.ObjectId.isValid(folderId)) {
    const err = new Error('The `folder id` is not valid');
    err.status = 400;
    return next(err);
  }

  if (!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  for (let i = 0; i < tags.length; i++) {
    if(tags[i] && !mongoose.Types.ObjectId.isValid(tags[i])) {
      const err = new Error('The `tags` id is not valid');
      err.status = 400;
      return next(err);
    } 
  }

  const updatedNote = {
    id: id,
    title: title,
    content: content,
    folderId: folderId,
    tags: tags
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
    updatedNote.save(); 
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
