exports.transferStateToUrl = function(state){
              var urlParams = decodeURIComponent(state);
              urlParams = urlParams.replace(new RegExp("{","gm"),"");
              urlParams = urlParams.replace(new RegExp("}","gm"),"");

              urlParams = urlParams.replace(new RegExp("@","gm"),"?");
              urlParams = urlParams.replace(new RegExp("~","gm"),"=");
              urlParams = urlParams.replace(new RegExp(",","gm"),"&");
              var reUrl = "/"+urlParams;
              return reUrl;
}

 function transferUrlToState(url){
	var state = url.replace("/","");
	state = "{"+state+"}";
	state = state.replace(new RegExp("\\?","gm"),"@");
	state = state.replace(new RegExp("=","gm"),"~");
	state = state.replace(new RegExp("&","gm"),",");
	return encodeURIComponent(state);
}
exports.checkWx = function(req,res,next){
	var requestUrl = req.url;
	//no login
	if(!req.AV.user){
		//
		if(!req.query.checked){
			var state = transferUrlToState(requestUrl);
			res.redirect("https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx8fb97e6277001984&redirect_uri="+
				"http://basketball.avosapps.com/authorize&response_type=code&scope=snsapi_userinfo&state="+state+"#wechat_redirect");
			return;
		}
		next();
	}
	next();

} 