//返回上一页
$("#goBack").click(function(){
	history.go(-1);
})
//回到首页
$("#home").click(function(){
	location.href = "index.html";
}) 
//提交
$("form").submit(function(event){
	//阻止默认事件
	event.preventDefault();
	//判断密码和确认密码是否一致
	var pwdInputs = $("input[type=password]");
	//pwdInputs[]是获取jQuery对象里面的原生标签对象
	if (pwdInputs[0].value != pwdInputs[1].value) {
		//弹出模态框给用户提示,修改内容
		$(".modal-body").text("Two password entries are inconsistent");
		$("#myModal").modal("show");
		return;
	} 
	//发送注册请求
    //var data = new  FormData(this);//用formdata获取表单数据
    //将表单数据编译成字符串
    var data = $(this).serialize();
    //console.log(data);
    $.post('/user/register',data,function(resData){
    	$(".modal-body").text(resData.msg);
    	$("#myModal").modal("show").on("hide.bs.modal",function(){
    		if (resData.code == 1) {
    			//注册成功后跳转到登陆页面,否则留在本页面继续注册
    			location.href = "/login.html";
    		}
    	});
    })
})


