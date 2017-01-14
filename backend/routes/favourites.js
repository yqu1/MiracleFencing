var express = require('express');
var bodyParser = require('body-parser');
var favRouter = express.Router();
var mongoose = require('mongoose');
var Verify = require('./verify');

var Fav = require('../models/fav');

favRouter.use(bodyParser.json());
favRouter.route('/')

.get(Verify.verifyOrdinaryUser, function(req, res, next) {
	Fav.findOne({'postedBy' : req.decoded._doc._id}).populate('dishes postedBy').exec(function(err, fav){
		if(err) throw err;
		console.log(fav);
		res.json(fav);
	})
})

.post(Verify.verifyOrdinaryUser, function(req, res, next) {
	Fav.findOne({'postedBy' : req.decoded._doc._id}, function(err, fav){
		if(err) throw err;
		if(fav === null) {
			Fav.create({postedBy: req.decoded._doc._id, dishes: req.body}, function(err, favDish){
				if(err) throw err;
				console.log('Favourite dish created!');
				var id = favDish._id;
				res.writeHead(200, {
			        'Content-Type': 'text/plain'
			      });
			     res.end('Added the dish with id: ' + id);
			})
		}
		else {
			fav.dishes.push(req.body);
			fav.save(function(err, dish){
				if(err) throw err;
				console.log('Updated Favourites!');
				console.log(fav);
				res.json(fav);
			})
		}
	})
})

.delete(Verify.verifyOrdinaryUser, function(req, res, next){
	Fav.remove({'postedBy' : req.decoded._doc._id}, function(err, resp){
		if(err) throw err;
		res.json(resp);
	})
})

favRouter.route('/:favId')
.delete(Verify.verifyOrdinaryUser, function(req, res, next){
	Fav.findOne({'postedBy' : req.decoded._doc._id}, function(err, fav) {
		if(err) throw err;
		fav.dishes.remove(req.params.favId);
		fav.save(function(err, resp){
			if(err) throw err;
			res.json(resp);
		})
	})
})

module.exports = favRouter;