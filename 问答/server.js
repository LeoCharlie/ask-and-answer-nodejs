var express = require("express"); //服务器模块
var bodyParser = require("body-parser"); //处理解析post请求数据模块
var multer = require("multer"); //处理formdata格式提交数据模块
var fs = require("fs"); //处理文件写入写出
var cookieParser = require("cookie-parser");//解析cookie模块

//创建服务器对象
var app = express();

//指定根目录文件夹
app.use(express.static("www"));

//解析请求数据
app.use(bodyParser.urlencoded({extended:true}));

//解析cookie数据
app.use(cookieParser());

//配置上传头像的存储
var storage = multer.diskStorage({
	destination:"www/upload",
	filename:function(req,res,cb){
		//cb:请求处理管线   
		var username = req.cookies.username;
		cb(null,username + ".jpg");
	}
})
var upload = multer({storage});

/************注册**************/
app.post("/user/register",function(req,res){
	//先判断用户是否已经被注册过
	var filePath = "users/" + req.body.username + ".json";
	fs.exists(filePath,function(exi){
	 console.log(arguments);
	 if (exi) {
	 	//用户存在
	 	res.status(200).json({code:2,msg:"Username Already Exists!"})
	 } else{
	 	//不存在
	 	//直接把注册信息写到本地
	 	//在body里添加注册时间和IP
	 	req.body.ip = req.ip;
	 	req.body.time = new Date();
		fs.writeFile(filePath,JSON.stringify(req.body),function(err){//把对象转化为字符串
			if(err){
				res.status(200).json({code:0,msg:"Writing file failed"})
			}
			else{
				res.status(200).json({code:1,msg:"Registration Success!"})
			}
		})
	 }
	})
	
});

/**************登陆*******************/
app.post("/user/login",function(req,res){
	//判断用户存在
	var filePath = "users/" + req.body.username + ".json";
	fs.exists(filePath,function(exi){
	 if (exi) {
	 	//用户存在，接着判断密码是否正确
	 	fs.readFile(filePath,function(err,data){
	 		if(err){
	 			//读取失败
	 			res.status(200).json({code:2,msg:"Failed to read file"})
	 		}else{
	 			//data是一个字符串
	 			var user = JSON.parse(data);//字符串转化为对象
	 			if(req.body.password == user.password){
	 				//把用户名存在响应报文cookie中(1.把用户名以cookie的形式保存在前端，
	 				//可以作为是否登陆的凭证，2.发送网络请求的时候，会把cookie带到后台)
	 				//cookie以域名为单位存储
	 				//param1 键 2值 3 过期时间 对象obj{expires}
	 				var time = new Date();
	 				time.setMonth(time.getMonth()+1);
	 				res.cookie("username",req.body.username,{expires:time});
	 				res.status(200).json({code:1,msg:"Landed Successfully"});
	 			}else{
	 				res.status(200).json({code:3,msg:"Wrong Password"});
	 			}
	 		}
	 	})
	 }
	 else{
	 	//不存在
	 	res.status(200).json({code:0,msg:"Username does not exist"})
	 }
	 })
})


/**************退出登陆*******************/
app.post("/user/logout",function(req,res){
	//清除cookie中的username(access_token、timestamp)
	res.clearCookie("username");
	res.status(200).json({code:1,msg:"退出登录"});
})


/****************上传头像***********************/
//upload.single("photo") ==upload.array("photo",1)
app.post("/user/upload",upload.single("photo"),function(req,res){
	res.status(200).json({code:1,msg:"上传头像成功"});
});

/*******************提问***********************/
app.post("/question/ask",function(req,res){
	//通过cookie中的username判断用户有没有登陆
	//进入了提问页面，说明已经登陆。1.在提问页面把cookie移除了；2.点击提问的时候，cookie存存储时间刚好到期被移除
	var username= req.cookies.username;
	if (!username) {
		res.status(200).json({code:0,msg:"Landing exception"});
		return;
	}
	//写入提问的问题
	//生成问题文件的文件名
	var filePath = "questions/" + new Date().getTime() + ".json";
	//组合完善存储数据
	req.body.content = req.body.content.replace(/</g ,"&lt;");
	req.body.content = req.body.content.replace(/>/g ,"&lt;");
	req.body.ip =req.ip;
	req.body.time = new Date();
	req.body.username = username;
	//写入文件
	fs.writeFile(filePath,JSON.stringify(req.body),function(err){
		if (!err) {
			res.status(200).json({code:1,msg:"提交问题成功"});
		} else{
			res.status(200).json({code:2,msg:"写入文件失败"});
		}
	});
});

/*****************获取首页数据*****************************/
app.get("/question/all",function(req,res){
	//返回所有问题(包含答案)
	//获取一个文件夹中所有的子文件
	fs.readdir("questions",function(err,files){
		if (err) {
			res.status(200).json({code:0,msg:"读取失败"});
		}else{
			//读取所有的子文件成功
			//数组逆序，目的：让最新的问题在上面
			files = files.reverse();
			//创建一个数组，存放所有的问题对象
			var allquestions = [];
			//方法一：用for循环遍历所有文件
	/*		for (var i = 0; i < files.length; i++) {
				var file = files[i];
				//拼接读取文件的文件路径
				var filePath = "questions/" +file;
				//读取文件
				//readFile()异步 ，拿不到数据，因为还没读取完数据就已经响应。 
//				fs.readFileSync(filePath,function(err,data){
//					var obj = JSON.parse(data);
//					allquestions.push(obj);
//				});

               //同步
               var data =fs.readFileSync(filePath);
               var obj = JSON.parse(data);
					allquestions.push(obj);
			}
			//响应
			res.status(200).json(allquestions);
	*/
	
	        //方法二： 使用递归来遍历，用异步读取数据
	        var i = 0;
	        function read(){
	        	if (i<files.length ) {
	        		//拼接路径
	        		var file = files[i];
	        		var filePath = "questions/" +file;
	        		fs.readFile(filePath,function(err,data){
	        			if (!err) {
	        				var obj = JSON.parse(data);
							allquestions.push(obj);
							i++;
							read();
	        			}
				});
	        	}else{
	        		//响应
	        		res.status(200).json(allquestions);
	        	}
	        }
	        read()
		}
	});
})

/*********************回答问题************************/
app.post("/question/answer",function(req,res){
    //判断登陆状态
    var username= req.cookies.username;
	if (!username) {
		res.status(200).json({code:0,msg:"Landing exception"});
		return;
	}
	
	//先根据req.cookies.question 读取响应的文件
	var filePath = "questions/" + req.cookies.question + ".json";
	fs.readFile(filePath,function(err,data){
		if (!err) {
			var dataObj = JSON.parse(data);
			//判断这个问题之前有没有被回答过
			if (!dataObj.answers) {
				dataObj.answers=[];
			}
			//将answer封装成一个对象
			req.body.time = new Date();
			req.body.ip = req.ip;
			req.body.username = username;
			//请回答的对象 放进answers数组中
			dataObj.answers.push(req.body);
			console.log(dataObj);
			//修改之后，重新写入文件
			fs.writeFile(filePath,JSON.stringify(dataObj),function(err){
				if (!err) {
					res.status(200).json({code:1,msg:"提交答案成功"});
				} else{
					res.status(200).json({code:2,msg:"提交失败"});
				}
			})
			
		}
	})
})


//监听
app.listen(3000,function(){
	console.log("server is running...")
})