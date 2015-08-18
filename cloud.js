
var AV = require('leanengine');


AV.Cloud.afterSave('TeamFollow',function(req,res){
	var query = new AV.Query('Competition');
	var competetionId = req.object.get('competitionId');
	query.get(competetionId,{
		success : function(competetion){
			var award = competetion.get('award');
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
				if(award+1 >= awardLimit){
					competetion.set('award',awardLimit);
					competetion.save();
					return;
				}
				else{
					competetion.increment('award',1);
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

AV.Cloud.afterSave('CompetitionShare',function(req,res){
	var query = new AV.Query('Competition');
	var competetionId = req.object.get('competitionId');
	query.get(competetionId,{
		success : function(competetion){
			var award = competetion.get('award');
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
});

module.exports = AV.Cloud;