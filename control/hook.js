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

