var express = require('express');
var router = express.Router();
var AV = require('leanengine');
var Game = AV.Object.extend("Game");

router.get("/game",function(req,res,next){
	var gameId = req.query.gameId;
	var query = new AV.Query(Game);
	query.include("campusId");
	query.equalTo("objectId",gameId);
	query.find({
		success:function(game){
			console.log(game);
			res.render("game",{game:game[0]});
		},
		error:function(data,error){
			res.render("error",{error:error});
		}
	})
	
});

router.get("/getTeam",function(req,res,next){

})
module.exports = router