
var AV = require('leanengine');
var util = require('./control/cloudUtil');
AV.Cloud.define('hello',function(req,res){
 	 console.log(req)
  	res.success('Hello world!');

});

AV.Cloud.define('teamfollow',function(req,res){
	console.log(req);
	var user = req.user;
	if(typeof(user) == 'undefined'){
		res.error();
	}
	var followObj = req.params;
	var competitionId = followObj.competitionId;
	console.log(competitionId);
	var competitionQuery = new AV.Query('Competition');
	competitionQuery.get(competitionId,{
		success:function(competition){
			var team = followObj.team;
			var query = new AV.Query('TeamFollow');
			var Competition = AV.Object.extend('Competition');
			query.equalTo('competitionId',competition);
			query.equalTo('userId',user);
			query.find({
				success:function(follows){
					//not such a record exist
					if(follows.length == 0){
						var TeamFollow = AV.Object.extend('TeamFollow');
						var follow = new TeamFollow();
						console.log(competition);
						follow.set('userId',user);
						follow.set('competitionId',competition);
						follow.set('team',team);
						follow.save(null,{
							success:function(follow){
								var award = competition.get('award');
								switch(team){
									case 0:
										break;
									case 1:
										competition.increment('likesA',1);
										break;
									case 2:
										competition.increment('likesB',1);
										break;
									default:
										res.error();
										
								}
								console.log(award);
								var awardLimit = competition.get('awardLimit');	
								
								//error happened ,fix it
								if(award > awardLimit){
									competition.set('award',awardLimit);
									competition.save();
									res.success(follow);
								}
								else if( awardLimit == 0 ){
									competition.save();
									res.success();
								}
								else{
									if(award+1 >= awardLimit){
										competition.set('award',awardLimit);
										competition.save();
										res.success(follow);
									}
									else{
										console.log("here");
										competition.increment('award',1);
										competition.save();
										res.success(follow);
									}
								}
							
							},
							error:function(follow,error){
								console.log(error);
								res.error();
							}
						});
					} 
					else if(follows.length>0){
						console.log('here1');
						var follow = follows[0];
						var oldTeam = follow.get("team");
						follow.fetchWhenSave(true);
						follow.set('team',team);
						follow.save().then(function(follow){
							var addA = 0;
							var addB = 0;
							switch(team){
								case 0:
									console.log('here3');
									break;
								case 1:
									addA++;
									competition.increment('likesA',1);
									break;
								case 2:
									addB++;
									competition.increment('likesB',1);
									break;
								default:
									res.error();
									
							}
							switch(oldTeam){
							case 0:
								break;
							case 1:
								var likesA = competition.get('likesA');
								console.log(likesA);
								if(likesA<0 && ((likesA+addA-1)<0)){
									competition.set('likesA',0);
									break;
								}
								competition.increment('likesA',-1);
								break;
							case 2:
								var likesB = competition.get('likesB');
								console.log(likesB);
								if(likesB<0 && ((likesB+addB-1)<0)){
									competition.set('likesA',0);
									break;
								}
								console.log('here2');
								competition.increment('likesB',-1);
								break;
							default:
								res.error();
									
							}
				
							competition.save();
							res.success(follow);
						},function(follow,error){
							res.error();
						})
						
					}
				},
				error:function(error){
					console.log(error);
					res.error();
				}
			})

		},
		error:function(error){
			console.log(error);
			res.error();
		}
	})
	

})



AV.Cloud.afterSave('FollowShare',function(req){
	console.log(req);
	var query = new AV.Query('Competition');
	var competetionIdObj = req.object.get('competitionId');
	var competitionId = competetionIdObj.id;
	query.get(competitionId,{
		success : function(competetion){
			var award = competetion.get('award');
		
			console.log(award);
			var awardLimit = competetion.get('awardLimit');	
			
			//error happened ,fix it
			if(award > awardLimit){
				competetion.set('award',awardLimit);
				competetion.save();
				return;
			}
			else if( awardLimit == 0 ){
				return;
			}
			else{
				if(award+0.5 >= awardLimit){
					competetion.set('award',awardLimit);
					competetion.save();
					return;
				}
				else{
					console.log("here");
					competetion.increment('award',0.5);
					competetion.save();
					return;
				}
			}
		},
		error : function(error){
			console.log(error);
		}
	})
});

AV.Cloud.afterSave('Competition',function(req){
	var comObj = req.object;
	console.log(req.object);
	var gameIdObj = comObj.get("gameId");
	console.log(gameIdObj);
	var gameId = gameIdObj.id;
	console.log(gameId);
	var query = new AV.Query('Game');
	query.get(gameId,{
		success:function(game){
			var type = comObj.get('type');
			game.set('type',type);
			game.save();
			return;
		},
		error:function(error){
			console.log(error);
			return;
		}
	})

})

AV.Cloud.afterSave('CommentLike',function(request){
	var commentId = request.object.get('commentId').id;
	var query = new AV.Query('Comment');
	query.get(commentId,{
		success:function(comment){
			comment.increment('likes',1);
			comment.save();
		},
		error:function(error){
			console.error(error);
			return;
		}
	})

})

AV.Cloud.afterDelete('CommentLike',function(request){
	var commentId = request.object.get('commentId').id;
	var query = new AV.Query('Comment');
	query.get(commentId,{
		success:function(comment){
			var likes = comment.get('likes');
			if(likes<0 || likes==0){
				comment.set('likes',0);
			}
			else{
				comment.increment('likes',-1);
			}
			comment.save();
		},
		error:function(error){
			console.error(error);
			return;
		}
	})

})


AV.Cloud.define('commentInit',function(req,res){
	console.log(req);	
	var _count = new Number(req.params.count);
	var user = req.user;
	var _competitionId = req.params.competitionId;
	//find the hot first
	var Competition = AV.Object.extend('Competition');
	var competitionId = new Competition();
	competitionId.id = _competitionId; 
	var query = new AV.Query('Comment');
	query.include("userId");
	query.limit(_count);
	query.descending("likes");
	query.descending("createdAt");
	query.equalTo("competitionId",competitionId);
	var results = new Object();
	query.find({
		success:function(comments){
			console.log('hahah');
			results.recent = new Array(comments.length);
			util.forEachComments(user,0,comments,0,function(likes,error){
				if(error){
					console.log('he1');
					console.log(error);
					res.error();
				}
				else{
					console.log('he2');
					console.log(likes);
					for(var i = 0;i<comments.length;i++){
						var resultObj = {
							comment:comments[i],
							likes:likes[i]
						}
						results.recent[i] = resultObj;
					}
					var newQuery = new AV.Query('Comment');
					query.include("userId")
					query.limit(_count);
					query.descending("createdAt");
					query.equalTo("competitionId",competitionId);
					query.find({
						success:function(comments){
							results.hot = new Array(comments.length);
							util.forEachComments(user,0,comments,0,function(likes,error){
								if(error){
									console.log(error);
									res.error();
								}
								else{
									for(var i = 0;i<comments.length;i++){
										var resultObj = {
											comment:comments[i],
											likes:likes[i]
										}
										results.hot[i] = resultObj;
									}
									res.success(results);
								}
							})
						},
						error:function(error){
							console.log(error);
							res.error();
						}
					})


				}
			})
		},
		error:function(error){
			console.log(error);
			res.error();
		}
	})
})

AV.Cloud.define('getOldComment',function(req,res){
	var _maxTime = new Date(req.params.createdAt);
	console.log(_maxTime);
	var _count = new Number(req.params.count);
	var user = req.user;
	var _competitionId = req.params.competitionId;
	var Competition = AV.Object.extend('Competition');
	var competitionId = new Competition();
	competitionId.id = _competitionId; 
	var query = new AV.Query('Comment');
	query.limit(_count);
	query.descending("createdAt");
	query.equalTo("competitionId",competitionId);
	query.lessThan("createdAt",_maxTime);
	query.find({
		success:function(comments){
			var results = new Array(comments.length);
			util.forEachComments(user,0,comments,0,function(likes,error){
				if(error){
					console.log(error);
					res.error();
				}
				else{
					for(var i = 0;i<comments.length;i++){
						var resultObj = {
							comment:comments[i],
							likes:likes[i]
						}
						results[i] = resultObj;
					}
					res.success(results);
				}
			})

		},
		error:function(error){
			console.log(error);
			res.error();
		}
	})
})





module.exports = AV.Cloud;