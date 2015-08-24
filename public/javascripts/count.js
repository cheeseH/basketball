var conversationId = #{conversationId};
var scoreId = #{scoreId};
function add(score,team){
	var newScore;
	if(team=="1"){
		newScore = parseInt($("#scoreA").text())+parseInt(score);
		$("#scoreA").text(newScore);
	}else{
		newScore = parseInt($("#scoreB").text())+parseInt(score);
		$("#scoreB").text(newScore);
	}
	
	var url = "/livert?conversationId="+coversationId+"&scoreA="+$("#scoreA").text()+"&scoreB="+$("#scoreB").text()+"&scoreId="+scoreId;
	$.ajax({
		url:url,
		type:"GET",
		dataType:"json",
		error:function(data){
			
		}

	});

}