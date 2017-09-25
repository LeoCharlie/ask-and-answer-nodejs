//返回上一页
$("#goBack").click(function(){
	history.go(-1);
});
//跳转注册
$("#register").click(function(){
	location.href = "register.html";
}); 

//发送登陆请求
$("form").submit(function(event){
	event.preventDefault();
	//获取表单数据，拼接成字符串(不是formdata格式)
	var data = $(this).serialize();
	//发送网络请求
	$.post("/user/login",data,function(resData){
		$(".modal-body").text(resData.msg);
		$("#myModal").modal("show").on("hide.bs.modal",function(){
    		if (resData.code == 1) {
    			location.href = "/index.html";
    		}
    		
    	});
	})
})

