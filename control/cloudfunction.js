var AV = require('leanengine');
var util = require('./cloudUtil');

var Competition = AV.Object.extend('Competition');

exports.CommentInit = function(req,res){

	var _count = new Number(req.params.count);
	var user = req.user;
	var _competitionId = req.params.competitionId;
	//find the hot first;
	var competitionId = new Competition();
	competitionId.id = _competitionId; 
	var query = new AV.Query('Comment');
	query.include("userId");
	query.include("atUser");
	query.limit(_count);
	query.descending("likes");
	query.equalTo("competitionId",competitionId);
	var results = new Object();
	query.find({
		success:function(comments){
			console.log('hahah');
			results.hot = new Array();
			util.forEachComments(user,0,comments,0,function(likes,error){
				if(error){
					console.log(error);
					res.error();
					return;
				}
				else{
					console.log('he2');
					console.log(likes);
					for(var i = 0;i<comments.length;i++){
						var atUser;
						if(!comments[i].get("atUser")){
							atUser = "";
						}
						else{
							atUser = comments[i].get("atUser");
						}
						var resultObj = {
							comment:comments[i],
							likes:likes[i],
							user:comments[i].get("userId"),
							atUser:atUser
						}
						results.hot[i] = resultObj;
					}
					var newQuery = new AV.Query('Comment');
					query.include("userId")
					query.limit(_count);
					query.descending("createdAt");
					query.equalTo("competitionId",competitionId);
					query.find({
						success:function(comments){
							results.recent = new Array();
							util.forEachComments(user,0,comments,0,function(likes,error){
								if(error){
									console.log(error);
									res.error();
									return;
								}
								else{

									for(var i = 0;i<comments.length;i++){
										var atUser;
										if(!comments[i].get("atUser")){
											atUser = "";
										}
										else{
											atUser = comments[i].get("atUser");
										}
										var resultObj = {
											comment:comments[i],
											likes:likes[i],
											user:comments[i].get("userId"),
											atUser:atUser
										}
										results.recent[i] = resultObj;
									}
									res.success(results);
									return;
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
}

exports.GetOldComment = function(req,res){
	var _maxTime = new Date(req.params.createdAt);

	var _count = new Number(req.params.count);
	var user = req.user;
	var _competitionId = req.params.competitionId;
	var Competition = AV.Object.extend('Competition');
	var competitionId = new Competition();
	competitionId.id = _competitionId; 
	var query = new AV.Query('Comment');
	query.limit(_count);
	query.include("userId");
	query.include("atUser");
	query.descending("createdAt");
	query.equalTo("competitionId",competitionId);
	query.lessThan("createdAt",_maxTime);
	query.find({
		success:function(comments){
			var results = new Array();
			util.forEachComments(user,0,comments,0,function(likes,error){
				if(error){
					console.log(error);
					return res.error();

				}
				else{
					
					for(var i = 0;i<comments.length;i++){
						var atUser;
						if(!comments[i].get("atUser")){
							atUser = "";
						}
						else{
							atUser = comments[i].get("atUser");
						}
						var resultObj = {
							comment:comments[i],
							likes:likes[i],
							user:comments[i].get("userId"),
							atUser:atUser
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
}

exports.TeamFollow = function(req,res){
	console.log(req);
	var user = req.user;
	if(typeof(user) == 'undefined'){
		res.error();
		return;
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
										return;
										
								}
								console.log(award);
								var awardLimit = competition.get('awardLimit');	
								
								//error happened ,fix it
								if(award > awardLimit){
									competition.set('award',awardLimit);
									competition.save();
									res.success(follow);
									return;
								}
								else if( awardLimit == 0 ){
									competition.save();
									res.success(follow);
									return;
								}
								else{
									if(award+1 >= awardLimit){
										competition.set('award',awardLimit);
										competition.save();
										res.success(follow);
										return;
									}
									else{
										console.log("here");
										competition.increment('award',1);
										competition.save();
										res.success(follow);
										return;
									}
								}
							
							},
							error:function(follow,error){
								console.log(error);
								res.error();
								return;
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
									return;
									
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
								return;
									
							}
				
							competition.save();
							res.success(follow);
						},function(follow,error){
							console.log(error);
							res.error();
							return;
						})
						
					}
				},
				error:function(error){
					console.log(error);
					res.error();
					return;
				}
			})

		},
		error:function(error){
			console.log(error);
			res.error();
			return;
		}
	})
	

}