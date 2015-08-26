
var AV = require('leanengine');
var util = require('./control/cloudUtil');
var hook = require('./control/hook');
var functions = require('./control/cloudfunction');




//cloud functions
AV.Cloud.define('teamfollow',functions.TeamFollow);
AV.Cloud.define('commentInit',functions.CommentInit);
AV.Cloud.define('getOldComment',functions.GetOldComment);


//hook functions
AV.Cloud.afterSave('CompetitionShare',hook.CompetitionShareAfterSave);
AV.Cloud.afterSave('Competition',hook.CompetitionAfterSave);
AV.Cloud.afterSave('CommentLike',hook.CommentLikeAfterSave);
AV.Cloud.afterDelete('CommentLike',hook.CommentLikeAfterDelete);
AV.Cloud.beforeSave('CommentLike',hook.CommentLikeBeforeSave);
AV.Cloud.beforeDelete('CommentLike',hook.CommentLikeBeforeDelete);
AV.Cloud.afterSave("GameFollow",hook.GameFollowAfterSave);
AV.Cloud.afterDelete('GameFollow',hook.GameFollowAfterDelete);
AV.Cloud.afterUpdate('Competition',hook.CompetitionAfterUpdate);
AV.Cloud.afterUpdate("Game",hook.GameAfterUpdate);





module.exports = AV.Cloud;