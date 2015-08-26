var AV = require('leanengine');
var util = require('./cloudUtil');


exports.CompetitionShareAfterSave = function(req){
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
}


exports.CompetitionAfterSave = function(req){
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

}

exports.CommentLikeAfterSave = function(request){
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

}

exports.CommentLikeAfterDelete = function(request){
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

}

exports.CommentLikeBeforeSave = function(request,response){
	var like = request.object;
	var commentId = like.get("commentId");
	var userId = like.get("userId");
	var query = new AV.Query('CommentLike');
	query.equalTo('commentId',commentId);
	query.equalTo('userId',userId);
	query.find({
		success:function(likes){
			if(likes.length == 0){
				return response.success();
			}
			else{
				return response.error("The CommentLike already exists");
			}
		},
		error:function(error){
			return response.error(error);
		}
	})
}

exports.CommentLikeBeforeDelete = function(request,response){
	var like = request.object;
	var commentId = like.get("commentId");
	var userId = like.get("userId");
	var query = new AV.Query('CommentLike');
	query.equalTo('commentId',commentId);
	query.equalTo('userId',userId);
	query.find({
		success:function(likes){
			if(likes.length == 0){
				return response.error("Not such a CommentLike exists");
			}
			else{
				return response.success();
			}
		},
		error:function(error){
			return response.error(error);
		}
	})
}

exports.GameFollowAfterSave = function(req){
	var query = new AV.Query('Game');
	var gameIdObj = req.object.get('gameId');
	var gameId = gameIdObj.id;
	query.get(competitionId,{
		success : function(game){
			var award = game.get('award');
		
			console.log(award);
			var awardLimit = game.get('awardLimit');	
			
			//error happened ,fix it
			if(award > awardLimit){
				game.set('award',awardLimit);
				game.save();
				return;
			}
			else if( awardLimit == 0 ){
				return;
			}
			else{
				if(award+1 >= awardLimit){
					game.set('award',awardLimit);
					game.save();
					return;
				}
				else{
					game.increment('award',1);
					game.save();
					return;
				}
			}
		},
		error : function(error){
			console.log(error);
		}
	})

}

exports.GameFollowAfterDelete = function(req){
	var follow = req.object;
	var gameId = follow.get("gameId").id;
	var query = new AV.Query("Game");
	query.get(gameId,{
		success : function(game){
			var award = game.get('award');
		
			var awardLimit = game.get('awardLimit');	
			
			//error happened ,fix it
			if(award < 0 ){
				game.set('award',awardLimit);
				game.save();
				return;
			}
			else{
				if(award-1 <= 0){
					game.set('award',0);
					game.save();
					return;
				}
				else{
					game.increment('award',-1);
					game.save();
					return;
				}
			}
		},
		error : function(error){
			console.log(error);
		}
	})
}


exports.CompetitionAfterUpdate = function(req){
	console.log(req);
	var competition = req.object;
	var award = competition.get('award');
	var awardLimit = competition.get('awardLimit');
	if(award>awardLimit){
		competition.set("award",awardLimit);
	}
	else if(award<0){
		competition.set("award",0);
	}
	competition.save(null,{
		success:function(competition){
			return;
		},
		error:function(competition,error){
			console.log("CompetitionAfterUpdate");
			console.log(error);
		}
	});
}

exports.GameAfterUpdate = function(req){
	console.log(req);
	var game = req.object;
	var award = game.get('award');
	var awardLimit = game.get('awardLimit');
	if(award>awardLimit){
		game.set("award",awardLimit);
	}
	else if(award<0){
		game.set("award",0);
	}
	game.save(null,{
		success:function(game){
			return;
		},
		error:function(game,error){
			console.log("gameAfterUpdate");
			console.log(error);
		}
	});
}