var express = require('express');

var sign = require('../sign');
var AV = require('leanengine');
var Competition = AV.Object.extend("Competition");
var TeamFollow = AV.Object.extend("TeamFollow");
var User = AV.Object.extend("_User");
var Comment = AV.Object.extend("Comment");

var router = express.Router();
var Sapi_Ticket = "";
var Time_Ticket = 0;

var livert = require('../control/livert');
/* GET home page. */

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.get('/live', function(req, res, next) {
	var competitionId = req.query.competitionId;
	var competitionObj = new Competition();
	competitionObj.id = competitionId;
	var time = (new Date()).valueOf();
	var request = require('request');
	var link = "/live?competitionId="+competitionId;

	var user = AV.User.current();
	var userId = user ? user.id : "";
	//根据Id查找直播
	var ComQuery = new AV.Query(Competition);
	ComQuery.equalTo("objectId",competitionId);
	ComQuery.include("gameId");
	ComQuery.include("teamAId");
	ComQuery.include("teamBId");
	ComQuery.include("scoreId");
	ComQuery.find({
		success:function(competition){

			if(competition.length>0){
				var game = competition[0].get("gameId");
				var teamA = competition[0].get("teamAId");
				var teamB = competition[0].get("teamBId");
				var score = competition[0].get("scoreId");
			}
			var likesA = competition[0].get("likesA");
			if(!likesA){
				likesA = 0;
			}
			var likesB = competition[0].get("likesB");
			if(!likesB){
				likesB = 0;
			}
			var scoreA = score.get("scoreA");
			if(!scoreA){
				scoreA = 0;
			}
			var scoreB = score.get("scoreB");
			if(!scoreB){
				scoreB = 0;
			}
			var award = competition[0].get("award");
			if(!award){
				award = 0;
			}
			var conversationId = competition[0].get("conversationId") ? competition[0].get("conversationId") : "";
			var teamlike = 0;
			
			if(time-Time_Ticket>7200*1000||Sapi_Ticket==""){
				var url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid="+"wx8fb97e6277001984"+"&secret="+"b08e0393a891b19fe8cabfd1a1ba3139";
				var options = {
					method: "GET",
					url : url
				};
				request(url,options,function(err,response,body){
					if(err){
						next(err);
					}
					var result = JSON.parse(body);
					var token = result.access_token;
					var httpsUrl = "https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token="+token+"&type=jsapi";
					var httpsOptions = {
						method: "GET",
						url : httpsUrl
					};
					request(httpsUrl,httpsOptions,function(err,response,body){
						if(err){
							next(err);
						}
						var results = JSON.parse(body);
						var Sapi_Ticket = results.ticket;
						console.log(Sapi_Ticket);
						Time_Ticket = time;
						var webUrl = "test.ima9ic.co"+req.url;
						var ret = sign(Sapi_Ticket,webUrl);
						console.log(ret);
						if(userId!=""){
							var teamfollow = new AV.Query(TeamFollow);
							teamfollow.equalTo("userId",userId);
							teamfollow.equalTo("competitionId",competitionObj);
							teamfollow.find({
								success:function(teamfollow){
									if(teamfollow.length>0){
										teamlike = teamfollow[0].get("team");
									}
									res.render('live',{logoUrlA:teamA.get("logoUrl"),teamA:teamA.get("name"),likesA:likesA,type:competition[0].get("type"),scoreA:scoreA,scoreB:scoreB,status:competition[0].get("status"),award:award,logoUrlB:teamB.get("logoUrl"),teamB:teamB.get("name"),likesB:likesB,userId:userId,competitionId:competitionId,teamlike:teamlike,conversationId:conversationId,timestamp:ret.timestamp,nonceStr:ret.nonceStr,signature:ret.signature});
								},
								error:function(object,error){
									res.render('error');
								}
							});
						}else{
							res.render('live',{logoUrlA:teamA.get("logoUrl"),teamA:teamA.get("name"),likesA:likesA,type:competition[0].get("type"),scoreA:scoreA,scoreB:scoreB,status:competition[0].get("status"),award:award,logoUrlB:teamB.get("logoUrl"),teamB:teamB.get("name"),likesB:likesB,userId:userId,competitionId:competitionId,teamlike:teamlike,conversationId:conversationId,timestamp:ret.timestamp,nonceStr:ret.nonceStr,signature:ret.signature});
						}
					});
				});	
			}else{
				var webUrl = "test.ima9ic.co"+req.url;
				var ret = sign(Sapi_Ticket,webUrl);
				console.log(ret);
				if(userId!=""){
					var teamfollow = new AV.Query(TeamFollow);
					teamfollow.equalTo("userId",userId);
					teamfollow.equalTo("competitionId",competitionObj);
					teamfollow.find({
						success:function(teamfollow){
							if(teamfollow.length>0){
								teamlike = teamfollow[0].get("team");
							}
							res.render('live',{logoUrlA:teamA.get("logoUrl"),teamA:teamA.get("name"),likesA:likesA,type:competition[0].get("type"),scoreA:scoreA,scoreB:scoreB,status:competition[0].get("status"),award:award,logoUrlB:teamB.get("logoUrl"),teamB:teamB.get("name"),likesB:likesB,userId:userId,competitionId:competitionId,teamlike:teamlike,conversationId:conversationId,timestamp:ret.timestamp,nonceStr:ret.nonceStr,signature:ret.signature});
						},
						error:function(object,error){
							res.render('error');
						}
					});
				}else{
					res.render('live',{logoUrlA:teamA.get("logoUrl"),teamA:teamA.get("name"),likesA:likesA,type:competition[0].get("type"),scoreA:scoreA,scoreB:scoreB,status:competition[0].get("status"),award:award,logoUrlB:teamB.get("logoUrl"),teamB:teamB.get("name"),likesB:likesB,userId:userId,competitionId:competitionId,teamlike:teamlike,conversationId:conversationId,timestamp:ret.timestamp,nonceStr:ret.nonceStr,signature:ret.signature});
				}
			}
		},
		error:function(object,error){
			res.render('error');
		}
	});
});

router.get('/getComment',function(req,res,next){
	var competitionId = req.query.competitionId;
	var user = AV.User.current();
	var userId = user ? user.id : "";
	AV.Query.doCloudQuery('select count(*) from Comment',{
		success:function(result){
			var comment_number = result.count;
			//找出最热门评论
			var commentQuery = new AV.Query(Comment);
			var competitionObj = new Competition();
			competitionObj.id = competitionId;
			commentQuery.include("userId");
			commentQuery.limit(5);
			commentQuery.descending("likes");
			commentQuery.descending("createdAt");
			commentQuery.equalTo("competitionId",competitionObj);
			commentQuery.find({
				success:function(result){
					var hotUsers = new Array();
					for (var i = result.length - 1; i >= 0; i--) {
						result[i].createdAt = format_date(result[i].createdAt);
						hotUsers[i] = result[i].get("userId");
					};
					var hotComments = result;
					

					//找出最新评论
					var commentQuery2 = new AV.Query(Comment);
					commentQuery2.include("userId");
					commentQuery2.limit(5);
					commentQuery2.descending("createdAt");
					commentQuery2.equalTo("competitionId",competitionObj);
					commentQuery2.find({
						success:function(result){
							var newUsers = new Array();
							for (var i = result.length - 1; i >= 0; i--) {
								result[i].createdAt = format_date(result[i].createdAt);
								newUsers[i] = result[i].get("userId");
							};
							var newComments = result;
							if(userId!=""){
								res.json({hotComments:hotComments,newComments:newComments,comment_number:comment_number,hotUsers:hotUsers,newUsers:newUsers});												
								res.end();
							}else{
								res.json({hotComments:hotComments,newComments:newComments,comment_number:comment_number,hotUsers:hotUsers,newUsers:newUsers});
								res.end()
							}
							
						},
						error:function(error){
							res.render('error');
						}
					});
				},
				error:function(error){
					res.render('error');
				}
			});		
		},
		error:function(error){
			res.render('error');
		}
	});

});

router.get('/commentLike',function(req,res,next){
	var commentId = req.query.commentId;
	var user = new req.AV.user;
	var commentLike = new CommentLike();
	var comment = new Comment();
	comment.id = commentId;
	commentLike.set("commentId",comment);
	commentLike.set("userId",user);
	commentLike.save(null,{
		success:function(commentlike){
			res.json({msg:"success"});
			res.end();
		},
		error:function(object,error){
			res.json({msg:"error"});
			res.end();
		}
	});
});

router.get('/count',function(req,res,next){
	var competitionId = req.query.competitionId;
	var query = new AV.Query(Competition);
	query.equalTo("objectId",competitionId);
	query.include("scoreId");
	query.find({
		success:function(competition){
			var scoreId = competition[0].get("scoreId").id;
			var conversationId = competition[0].get("conversationId");
			livert.scoreInit(conversationId,competition[0].get("scoreId").get("scoreA"),competition[0].get("scoreId").get("scoreB"));
			res.render("count",{scoreId:scoreId,conversationId:conversationId,scoreA:competition[0].get("scoreId").get("scoreA"),scoreB:competition[0].get("scoreId").get("scoreB")});

		}
	});
});

router.get('/refresh',function(req,res,next){
	var competitionId = req.query.competitionId;
	var query = new AV.Query(Competition);
	query.include("scoreId");
	query.equalTo("objectId",competitionId);
	query.find({
		success:function(competition){
			competition = competition[0];
			var likesA = competition.get("likesA") ? competition.get("likesA") : 0;
			var likesB = competition.get("likesB") ? competition.get("likesB") : 0;
			var award = competition.get("award") ? competition.get("award") : 0;
			var scoreA = competition.get("scoreId").get("scoreA");
			var scoreB = competition.get("scoreId").get("scoreB");
			res.json({likesA:likesA,likesB:likesB,award:award,scoreA:scoreA,scoreB:scoreB});
			res.end();
		},
		error:function(object,error){
			res.json({error:error});
			res.end();
		}
	});
});
router.get('/comment',function(req,res,next){
	var content = req.query.content;
	var competitionId = req.query.competitionId;
	var userId = req.AV.user.id;
	var comment = new Comment();
	var user = new User();
	user.id = userId;
	var competition = new Competition();
	competition.id = competitionId;
	if(req.query.atUserId){
		var atUser = new User();
		atUser.id = req.query.atUserId;
		comment.set("atUser",atUser);
	}
	comment.set("userId",user);
	comment.set("competitionId",competition);
	comment.set("content",content);
	comment.set("likes",0);
	comment.save(null,{
		success:function(comment){
			comment.createdAt = format_date(comment.createdAt);
			var query = new AV.Query("_User");
			query.equalTo("objectId",comment.get("userId").id);
			query.find({
				success:function(user){
					user = user[0];
					res.json({id:comment.id,createdAt:comment.createdAt,likes:comment.get("likes"),content:comment.get("content"),nickname:user.get("nickname"),userId:comment.get("userId").id,avatorUrl:user.get("avatorUrl")});
					res.end();
				},
				error:function(object,error){
					res.json({error:error});
					res.end();
				}
			})
			
			
		},
		error:function(object,error){
			res.json({error:error});
			res.end();
		}
	});
});

router.get('/share',function(req,res,next){
	var time = (new Date()).valueOf();
	var request = require('request');
	if(time-Time_Ticket>7200*1000||Sapi_Ticket==""){
		var url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid="+"wx8fb97e6277001984"+"&secret="+"b08e0393a891b19fe8cabfd1a1ba3139";
		console.log(url);
		var options = {
			method: "GET",
			url : url
		};
		request(url,options,function(err,response,body){
			if(err){
				next(err);
			}
			// if(response.statusCode != 200){
			// 	console.log(response.statusCode);
			// 	res.render('error');
			// }
			var result = JSON.parse(body);
			var token = result.access_token;
			var httpsUrl = "https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token="+token+"&type=jsapi";
			var httpsOptions = {
				method: "GET",
				url : httpsUrl
			};
			request(httpsUrl,httpsOptions,function(err,response,body){
				if(err){
					next(err);
				}
				// if(response.statusCode != 200){
				// 	console.log(response.statusCode);
				// 	res.render('error');
				// }
				var results = JSON.parse(body);
				var Sapi_Ticket = results.ticket;
				console.log(Sapi_Ticket);
				Time_Ticket = time;
				var webUrl = "http://test.ima9ic.co"+req.url;
				webUrl = encodeURIComponent(webUrl);
				var ret = sign(Sapi_Ticket,webUrl);
				res.render('share',{timestamp:ret.timestamp,nonceStr:ret.nonceStr,signature:ret.signature});
			});
		});	
	}else{
		var webUrl = "http://test.ima9ic.co"+req.url;
		webUrl = encodeURIComponent(webUrl);
		var ret = sign(Sapi_Ticket,webUrl);
		res.render('share',{timestamp:ret.timestamp,nonceStr:ret.nonceStr,signature:ret.signature});
	}
});

function format_date(date){
	var date = new Date(date);
	var year = date.getFullYear();
	var month = date.getMonth()+1;
	var day = date.getDate();
	var now = new Date();
	var mseconds = now.getTime()-date.getTime();
	var time_std = [1000,60*1000,60*60*1000,60*60*24*1000];
	if(mseconds<time_std[0]){
		return "刚刚";
	}
	if(mseconds>=time_std[0]&&mseconds<time_std[1]){
		return Math.floor(mseconds/time_std[0]).toString() + "秒前";
	}
	if(mseconds>=time_std[1]&&mseconds<time_std[2]){
		return Math.floor(mseconds/time_std[1]).toString() + "分钟前";
	}
	if(mseconds>=time_std[2]&&mseconds<time_std[3]){
		return Math.floor(mseconds/time_std[2]).toString() + "小时前";
	}
	month = ((month<10) ? "0" : "") + month;
	day = ((day<10) ? "0" : "") + day;

	var thisYear = now.getFullYear();
	year = (year==thisYear) ? "" : (year+"年");
	return year+""+month+"月"+day+"日";
}
module.exports = router;