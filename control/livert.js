var realtime = require('leancloud-realtime');
realtime.config({
  WebSocket: require('ws')
});
var AV = require('leanengine');
var appId = 'n4ibkpr4z9d8tkdlg7k0j6xywwwb28k2jw8fzmj5vrxeve4c';

var convArray = new Object();
var Scores = new Object();
var LatestTimes = new Object();

var testA;
var testB;


exports.scoreNotify = function(baseData,httpData){
			var _conversationId = baseData.conversationId,
			_time = baseData.time,
			res = httpData.res,
			req = httpData.req,
			next = httpData.next;
			var _scoreId = req.query.scoreId;
			var _scoreA = new Number(req.query.scoreA);
			var _scoreB = new Number(req.query.scoreB);
			var scoreObj;
			var query = new AV.Query('Score');
			var roomObj;
			var addScoreA;
			var addScoreB;
			
			if(!LatestTimes[_conversationId]){
				LatestTimes[_conversationId] = _time;
			}

			if(LatestTimes[_conversationId]>_time){
				res.send("the data is old");
				return;
			}
			if(!Scores[_conversationId]){
				Scores[_conversationId]=new Array(2);
				Scores[_conversationId][0] = 0;
				Scores[_conversationId][1] = 0;
			
			}

			addScoreA = _scoreA - Scores[_conversationId][0];
			addScoreB = _scoreB  - Scores[_conversationId][1];
			console.log(_scoreA);
			console.log(_scoreB);
			console.log(Scores[_conversationId][0]);
			console.log(Scores[_conversationId][1]);
			console.log("------");
			Scores[_conversationId][0] = _scoreA;
			Scores[_conversationId][1] = _scoreB;
	

			query.get(_scoreId,{
				success:function(score){
					var roomObj;
					var newScore = score;
					var clientId = "serverAdmin";
					if(!convArray[_conversationId] || !convArray[_conversationId]['roomObj']){
						convArray[_conversationId] = new Object();
						var conv = convArray[_conversationId];
						score.fetchWhenSave(true);
						score.increment("scoreA",addScoreA);
						score.increment("scoreB",addScoreB); 
						score.save().then(function(score){
							clientId = "serverAdmin";
							var realtimeObj = realtime({
								appId: appId,
								clientId: clientId,
								 // 是否开启 HTML 转义，SDK 层面开启防御 XSS
								encodeHTML: true,
								 // 是否开启服务器端认证
								// auth: authFun
							});
							realtimeObj.on('open',function(){
								realtimeObj.conv(_conversationId,function(room){
									if(room){
										roomObj = room;
										conv.realtimeObj = realtimeObj;
										conv.roomObj = roomObj;
										roomObj.send({
											 scoreA : newScore.get('scoreA'),
										 	 scoreB : newScore.get('scoreB')
										},function(data){
											         res.send('mmm');
										})
									
									}else{
										

									}
								})
							});
						},function(score,error){
							
							console.log(error);
							res.send('ccccccc');
						})

					
					
					
					}
					else{
						score.fetchWhenSave(true);
						score.increment("scoreA",addScoreA);
						score.increment("scoreB",addScoreB); 
						score.save().then(function(score){
							roomObj = convArray[_conversationId]['roomObj'];
							roomObj.send({
								scoreA : newScore.get('scoreA'),
								scoreB : newScore.get('scoreB')
							},function(data){
								         res.send('success');
							})
						})
					}	
						
			
			},
			error:function(error){
				console.log(error);
				res.send('error');
			}
			})
			//judge the time
			
		
		
		}


exports.scoreInit = function(conversationId,scoreA,scoreB){
	if(!Scores[conversationId]){
		Scores[conversationId] = new Array(2);
	}
	Scores[conversationId][0] = scoreA;
	Scores[conversationId][1] = scoreB;
}