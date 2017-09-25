

//取出本地存储cookie中的username
/*var username = document.cookie;
username = window.decodeURIComponent(username);
username = username.split("=")[1];
console.log(username);
*/

var username = $.cookie("username");
//判断username有没有值，改变user的样式和行为
 if (username) {
 	$("#user").find("span").last().text(username);
 } else{
 	$("#user").find("span").last().text("login").end().end()
 	.removeAttr("data-toggle").click(function(){
 		location.href="login.html";
 	});
 	
 }

//点击提问按钮
$("#ask").click(function(){
	if (username) {
		location.href="ask.html";
	} else{
		location.href="login.html";
	}
})

//退出登录
$("#logout").click(function(){
	$.post("/user/logout",function(resData){
		//如果正常退出登录，刷新下本页面
		if (resData.code == 1) {
			location.reload();
		}
	})
})

//获取首页数据
$.get("/question/all",function(resData){
	//遍历所有问题
	var htmlStr= "";
	for (var i = 0; i < resData.length; i++) {
		var question = resData[i];
		htmlStr +='<div class="media question" data-time="'+ new Date(question.time).getTime()+'">';
		//内层第一块(处理用户头像)
		htmlStr +='<div class = "pull-left"><a>';
		htmlStr +='<img class="media-object" src="../upload/' + question.username + 
		'.jpg"onerror="defaultHeaderImage(this)">';  //this.src=\'../images/user.png\'
		htmlStr +="</a></div>";
		//内层第二块(处理提问人，内容，时间，ip)
		htmlStr +='<div class="media-body">';
		htmlStr +='<h4 class="media-heading">' + question.username + '</h4>'
		htmlStr +='<p>' + question.content + '</p>'
		htmlStr +='<div class="media-bottom">' + formatTime(question.time) + '&ensp;'+ formatIp(question.ip) + '</div>'
		
		//判断是否有答案
		if (question.answers) {
			//遍历question的answers属性
			for (var j = 0; j < question.answers.length; j++) {
				var answer = question.answers[j];
				 // 外层（每个答案的父标签）
                htmlStr += '<div class="media answer">'
                    // 第一个内层（头像）
                htmlStr += '<div class="pull-right"><a>'
                htmlStr += '<img class="media-object" src="../uploads/' + answer.username + '.jpg" onerror="defaultHeaderImage(this)">'
                htmlStr += '</a></div>'
                    // 第二个内层（答案、时间、ip）
                htmlStr += '<div class="media-body">'
                htmlStr += '<h4 class="media-heading">' + answer.username + '</h4>';
                htmlStr += '<p>' + answer.content + '</p>';
                htmlStr += '<div class="media-bottom">' + formatTime(answer.time) + '&#x3000;' + formatIp(answer.ip) + '</div>';
                htmlStr += '</div>'
                htmlStr += '</div>'
			}
		}
		
		htmlStr +='</div>';
		htmlStr +="</div>";
		
		htmlStr +='<hr>';
	}
	$("#questions").html(htmlStr);
})

// 时间格式器
function formatTime(time){
	time = new Date(time);
	var y = time.getFullYear();
	var M = time.getMonth() + 1;
	var d = time.getDate();
	var h = time.getHours();
	var m = time.getMinutes();
	var s = time.getSeconds();
	
	M = M < 10 ? "0"+M : M;
	d = d < 10 ? "0"+d : d;
	h = h < 10 ? "0"+h : h;
	m = m < 10 ? "0"+m : m;
	//s = s < 10 ? "0"+s : s;
	
	return y+"-"+M+"-"+d+" "+h+":"+m;
}

// ip 格式器
function formatIp(ip){
//	if (ip.startsWith("::1")) {
//		return "127.0.0.1";
//	}else if(ip.startsWith("::ffff:")){
//		return ip.substr(7);
//	}
	
	var regExg = /::1/ig;
	if (ip.match(regExg)) {
		return"127.0.0.1";
	} else{
		return ip.substr(7);
	}
}

//如果没有图像，那么加载默认头像
function defaultHeaderImage(img){
	img.src = "../images/user.png";
}

//点击某个问题，跳转到回答问题页面
$("#questions").on("click",".question",function(){
	if (username) {
		location.href = "answer.html";
		//存放到cookie中，目的是下次发送请求时带到后台(找到对应问题文件)
		$.cookie("question",$(this).data("time"));
	} else{
		location.href = "login.html";
	}
})
