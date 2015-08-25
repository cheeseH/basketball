var express = require('express');
var router = express.Router();
var realtime = require('leancloud-realtime');
var  AV = require('leanengine');
var livert = require('../control/livert');
/* GET home page. */



router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});



router.get('/authorize',function(req,res,next){
        console.log('authorize');
        if(req.query.code){
                var code = req.query.code;
                var request = require('request');
                var url = 'https://api.weixin.qq.com/sns/oauth2/access_token?appid=wx8fb97e6277001984&secret=b08e0393a891b19fe8cabfd1a1ba3139'+
                '&code='+code+'&grant_type=authorization_code';
                var options =
                {
                        method : 'GET',
                        url : url
                };
                var callback = function(err,response,body){
                        if(err){
                                next(err);
                        }
                        if(response.statusCode != 200){
                              
                                render('index',statusCode);
                        }

                        var result = JSON.parse(body);
                        var token = result.access_token;
                        var openId = result.openid;
                        var httpsUrl = 'https://api.weixin.qq.com/sns/userinfo?access_token='+token+'&openid='+openId+'&lang=zh_CN';
                        var httpsOptions = {
                                url: httpsUrl,
                                method:'GET'

                        }
                        request(httpsUrl,httpsOptions,function(err,response,body){
                                if(err){
                                        next(err);
                                 }
                                if(response.statusCode != 200){
                                        console.log(statusCode);
                                        render('index',statusCode);
                                }
                                console.log(body);
                                var userinfo = JSON.parse(body);
                                var query =  new AV.Query(AV.User);
                                query.equalTo('wechatId',userinfo.unionid);
                                query.find({
                                    success:function(users){
                                        //no user exist
                                        //add
                                        if(users.length == 0){
                                          console.log('authorize 0');
                                            var wechatId = userinfo.unionid;
                                            var user = new AV.User();
                                            user.set('username',wechatId);
                                            user.set('password',wechatId);
                                            user.set('wechatId',wechatId);
                                            user.set('avatorUrl',userinfo.headimgurl);
                                            user.set('gender',userinfo.sex);
                                            user.set('nickname',userinfo.nickname);
                                            user.signUp(null,{
                                                success:function(user){
                                                  var urlParams = decodeURIComponent(req.query.state);
                                                  urlParams = urlParams.replace(new RegExp("{","gm"),"");
                                                  urlParams = urlParams.replace(new RegExp("}","gm"),"");

                                                  urlParams = urlParams.replace(new RegExp("@","gm"),"?");
                                                  urlParams = urlParams.replace(new RegExp("~","gm"),"=");
                                                  urlParams = urlParams.replace(new RegExp(",","gm"),"&");
                                                  var reUrl = "/"+urlParams;


                                                  res.redirect(reUrl);
                                                },
                                                error:function(user,error){
                                                    console.log(error);

                                                    //
                                                }
                                            })
                                        }
                                        //login
                                        else if(users.length == 1){
                                          var wechatId = userinfo.unionid;
                                          console.log(wechatId);
                                            AV.User.logIn(wechatId,wechatId,{
                                              success:function(user){
                                                  var urlParams = decodeURIComponent(req.query.state);
                                                  urlParams = urlParams.replace(new RegExp("{","gm"),"");
                                                  urlParams = urlParams.replace(new RegExp("}","gm"),"");

                                                  urlParams = urlParams.replace(new RegExp("@","gm"),"?");
                                                  urlParams = urlParams.replace(new RegExp("~","gm"),"=");
                                                  urlParams = urlParams.replace(new RegExp(",","gm"),"&");
                                                  var reUrl = "/"+urlParams;


                                                    res.redirect(reUrl);
                                              },
                                              error:function(user,error){
                                                console.log("error2");
                                                console.log(error);
                                              }
                                            });
                                        }else{
                                            //error
                                            console.log('what?');

                                        }
                                    },
                                    error:function(error){
                                        console.log(error);
                                    }
                                })


                        })
                }
                request(url,options,callback);
        }
})


router.get('/testUser',function(req,res,next){
  console.log('come to testUser');
  var user = AV.User.current();
  console.log(user);
  res.render('index', { title: 'Express' });
})
router.get('/logout',function(req,res,next){
  AV.User.logOut();
    res.render('index', { title: 'Express' });
})


router.get('/livert',function(req,res,next){
  var _conversationId = req.query.conversationId;
  //var _time = new Number(req.query.time);
  var _time = new Number(req.query.time);
  var baseData = {
        conversationId : _conversationId,
        time : _time
  }
  var httpData = {
        res : res,
        req : req,
        next : next
  }
 livert.scoreNotify(baseData,httpData);

});


router.get('/followteam',function(req,res,next){
      console.log('aaaa');
      console.log(req.query);
      var competitionId = req.query.competitionId;
      var team = new Number(req.query.team);
      var user = req.AV.user;
      var options = {
          competitionId:competitionId,
          team:Number(team)
      };
      AV.Cloud.run('teamfollow',options,{
          success:function(result){
            console.log('success');

            res.json(result);
            res.end();
          },
          error:function(error){
            console.log('failed');

            res.json(error);
            res.end();
          }
        })
  
})


// router.get("/commentLikeCancel",function(req,res,next){
//   var _commentId = req.query.commentId;
//   var query = new AV.Query('commentLike');
//   var Comment =  AV.Object.extend('Comment');
//   var commentId = new Comment();
//   commentId.id = _commentId;
//   query.equalTo('commentId',commentId);
//   query.euqalTo('userId',user);
//   query.find({
//       success:function(likes){
//         if(likes.length == 0){
//           res.end();
//         }
//         else{
//           var like = likes[0];
//             like.destroy({
//               success:function(like){
//                 res.end();
//               },
//               error:function(like,error){
//                 console.log(error);
//                 res.end();
//               }
//             });
//           }
//       },
//       error:function(error){
//         console.log(error);
//         res.end();
//       }
//     }
//   })
// })

module.exports = router;