'use strict';

const express = require('express');
const Folder = require('../models/folder');
const mongoose = require('mongoose');

const router = express.Router();


/* ========== GET/READ ALL FOLDERS ========== */
router.get('/', (req, res, next) => {
    Folder.find({})
    .sort({ updatedAt: 'desc'})
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    })
  });

/* ========== GET/READ A SINGLE FOLDER ========== */
router.get('/:id', (req, res, next) => {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const err = new Error('The `id` is not valid');
      err.status = 400;
      return next(err);
    }

    return Folder.findById(id)
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    })
});

/* ========== POST/CREATE A FOLDER ========== */
router.post('/', (req, res, next) => {
  const { name } = req.body;

  if (!name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  const newFolder = {
        name: name
    };
    return Folder.create(newFolder)
    .then(results => {
      res.location(`http://${req.headers.host}/notes/${results.id}`).status(201).json(results);
    })
    .catch(err => {
        if (err.code === 11000) {
            err = new Error('The folder name already exists');
            err.status = 400;
        }
        next(err);
        });
  });

/* ========== PUT/UPDATE A FOLDER ========== */
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

  const updatedFolder = {
    name: name
  }
  return Folder.findByIdAndUpdate(id, updatedFolder)
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

/* ========== DELETE/REMOVE A FOLDER & IT'S CONTENT ========== */
router.delete('/:id', (req, res, next) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  return Folder.findByIdAndRemove(id)
  .then(results => {
    res.json(results).status(204);
  })
  .catch(err => {
    next(err);
  })
});

module.exports = router;
