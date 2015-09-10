var express = require('express');
var router = express.Router();
var AV = require('leanengine');
var Game = AV.Object.extend("Game");
var Competition = AV.Object.extend("Competition");

router.get("/game",function(req,res,next){
	var gameId = req.query.gameId;
	var query = new AV.Query(Game);
	query.include("campusId");
	query.equalTo("objectId",gameId);
	query.find({
		success:function(game){
			res.render("game",{game:game[0]});
		},
		error:function(data,error){
			console.log(error);
			res.render("error",{error:error});
		}
	})
	
});

router.get("/getTeam",function(req,res,next){
	var gameId = req.query.gameId;
	var query = new AV.Query(Game);
	query.equalTo("objectId",gameId);
	query.find({
		success:function(game){
			var relation = game[0].relation("teams");
			relation.query().find({
				success:function(list){
					var number = list.length;
					res.json({teamList:list,number:number});
					res.end();
				},
				error:function(data,error){

				}
			});
		},
		error:function(data,error){

		}
	})
});

router.get("/getRace",function(req,res,next){
	var gameId = req.query.gameId;
	var query = new AV.Query(Competition);
	query.include("scoreId");
	query.include("teamAId");
	query.include("teamBId");
	var game = new Game();
	game.id = gameId;
	query.equalTo("gameId",game);
	query.descending("level");
	query.find({
		success:function(competition){
			var number = competition.length;
			for(var i=0;i<competition.length;i++){
				if(competition[i].get("scoreId")){
					competition[i].set("scoreId",{scoreA:competition[i].get("scoreId").get("scoreA"),scoreB:competition[i].get("scoreId").get("scoreB")});	
				}else{
					competition[i].set("scoreId",{scoreA:0,scoreB:0});
				}
				competition[i].set("teamAId",{name:competition[i].get("teamAId").get("name"),logoUrl:competition[i].get("teamAId").get("logoUrl")});
				competition[i].set("teamBId",{name:competition[i].get("teamBId").get("name"),logoUrl:competition[i].get("teamBId").get("logoUrl")});
			}
			res.json({raceList:competition,number:number,});
			res.end();
		},
		error:function(data,error){

		}
	});

});

router.get("/getReportList",function(req,res,next){
	var gameId = req.query.gameId;
	var query = new AV.Query(Competition);
	var game = new Game();
	game.id = gameId;
	query.equalTo("gameId",game);
	query.include("reportId");
	query.find({
		success:function(competition){
			var number = competition.length;
			var reportList = new Array();
			for(var i=0;i<competition.length;i++){
				var hasReport = false;
				reportList[i] = {};
				if(competition[i].get("reportId")){
					hasReport = true;
					var time = new Date(competition[i].get('reportId').createdAt);
					var month = time.getMonth()+1;
					var day = time.getDate();
					var createdAt = month<10?"0"+month:month+"-"+day<10?"0"+day:day;
					var author = competition[i].get('reportId').get('author');
					var coverUrl = competition[i].get("reportId").get("coverUrl")?competition[i].get("reportId").get("coverUrl"):"";
					reportList[i] = {title:competition[i].get("reportId").get("title"),coverUrl:coverUrl,createdAt:createdAt,time:competition[i].get("reportId").createdAt,author:author};
				}else{
					reportList[i].time=new Date();
				}
				reportList[i].hasReport=hasReport;
			}
			reportList.sort(function(a,b){
				return a.time<b.time?1:-1;
			});
			res.json({reportList:reportList,number:number});
			res.end();
		},
		error:function(data,error){

		}
	});

});
module.exports = router