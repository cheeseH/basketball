
var AV = require('leanengine');

function getLikes(user,comment,callback){
	if(!user){
		callback(false);
	}
	var query = new AV.Query('CommentLike');
	query.equalTo('userId',user);
	query.equalTo('commentId',comment);
	query.find({
		success:function(likes){
			if(likes.length == 0){
				return callback(false);
				
			}
			return callback(true);
		},
		error:function(error){
			return callback(null,error);
		}
	})
}



exports.forEachComments = function(user,i,comments,count,callback){
	var likes = new Array();
	if(comments.length == 0){
		return callback(likes);
	}
	for(;i<comments.length;i++){
		(function (i) {
		            getLikes(user,comments[i] , function(like,error){
		     	if(error){
		     		return callback(null,error);
		     		
		     	}
		     	likes[i] = like;
		     	if(++count  == comments.length){
		     		return callback(likes);
		     		
		     	}
		     	


		          });
		   }(i));
	}
}