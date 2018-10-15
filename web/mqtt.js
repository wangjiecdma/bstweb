document.addEventListener('readystatechange',function(){
    if(document.readyState=="interactive"){
        var pic = document.getElementById("img");
        var divmanage=document.getElementById("divmanage");
        pic.style.display="block";
        divmanage.style.display="none";
    }
    if(document.readyState=="complete"){
        var pic = document.getElementById("img");
        var divmanage=document.getElementById("divmanage");
        pic.style.display="none";
        divmanage.style.display="block";
    }
})
document.addEventListener('DOMContentLoaded',function(){

})
	var mapVersion  = {};
    var mapSystemVersion ={};
	var mapDevice = {};
	date = new Date();
	var server_id = "20000_"+date.getMinutes() +date.getSeconds();
	var client = new Paho.MQTT.Client("192.168.168.166",61623 , server_id);//建立客户端实例
        client.connect({onSuccess:onConnect ,
        					  userName:"admin",
            				  password:"password"});//连接服务器并注册连接成功处理事件
        function onConnect() {
	        console.log("onConnected");
	        client.subscribe("counter");//订阅主题
			client.subscribe(server_id);
            client.subscribe("bst_fae");
        }
        client.onConnectionLost = onConnectionLost;//注册连接断开处理事件
        client.onMessageArrived = onMessageArrived;//注册消息接收处理事件
        function onConnectionLost(responseObject) {
            if (responseObject.errorCode !== 0) {
                console.log("onConnectionLost:"+responseObject.errorMessage);
                console.log("连接已断开");
             }
        }
        function onMessageArrived(message) {
		  console.log("收到消息:"+message.payloadString);
		  if(message.destinationName == 'counter'){
		  		item = JSON.parse(message.payloadString);
		  		mapVersion[item.id] = item.version;
		  		var timestamp = (new Date()).getTime()/1000;
		  		mapDevice[item.id] = timestamp;
		  		mapSystemVersion[item.id]=item.version_system;

		  }else if(message.destinationName ==server_id ){
		  		
		  		item = JSON.parse(message.payloadString);
		  		if(item.msg_type == "bst_fae"){
		  			if(item.cmd_type == "result_screen"){

		  				$("#image_screen").attr('src',item.download_url.replace("rtc/uploadche-tomcat-8.5.31/webapps/ROOT/",""));
		  				date = new Date();
		  				time  = "    "+date.getMonth()+"-" +date.getDay()+ "   "+ date.getHours()+ ":"+date.getMinutes()+":"+date.getSeconds();


		  				$("#screen_time").html("截屏时间:"+ time);

		  			}else if(item.cmd_type == "result_syncdata"){
		  				updateStatus(item);
                    }else if(item.cmd_type == "result_readsetting"){
		  				updateSettting(item);
					}else if(item.cmd_type == "result_writesetting"){
					layer.alert("设置参数成功");
                    
                    }
		  		}
		  		
		  }
		  
		}

function getConnectedDevice(){
	
	var timestamp = (new Date()).getTime()/1000;
	var  list = [];	  		
	for(key in mapDevice){  
    		lastTime = mapDevice[key];
    		if((timestamp - lastTime)>20 ){
    				list.push(key);
    		}
	}

	for(key in list){
		delete mapDevice[key];
	}
	
	var list =  Object.keys(mapDevice);
	console.log("list value :"+list);
	return list;
}

function sendMqttMessage (  id , data  ){
		message = new Paho.MQTT.Message(data);
		message.destinationName = id;
		client.send(message);
}
		
		
function onClickScreen(){
	console.log("screen button click ");

    downloadDeviceFile("screen");

    //var path = "http://192.168.168.166:8900/videocallfile/u/0/0/201810/o/750b31e4e0a347e09a7e5a7870e78f05.jpg";
	// $("#image_screen").attr('src',path);
    //window.open(path,'_blank');

    //downloadFile(path);
}



//列表　刷新
function onClickUpdate(){
	
	var list  = getConnectedDevice();
	dojo.empty("device_list");
	
	sel = document.getElementById('device_list');
	var  fillter = $('#fillter').val();
	console.log("update button click fillter :  "+fillter);
	for (index  in list){
		if(fillter != ''){
			if(list[index].indexOf(fillter) == -1){
				continue;
			}
		}

		var c = dojo.doc.createElement('option');
                 c.innerHTML = list[index] +"	, app:"+ mapVersion[list[index]];
                 c.value = list[index];
                 sel.appendChild(c);
	}

}

var realTimeClData = setInterval(getSyncData, 1000);
var TimeCounter = 0;
var Device_ID ;

function rnd(n, m){
        var random = Math.floor(Math.random()*(m-n+1)+n);
        return random;
}

function onClickSyncData(){
	var data = $("#device_list ").val();
	if(data.length != 1){
		 layer.alert("请选择一个设备");
		return;
	}
	Device_ID = data[0];
	
	var time =  $("#synctime ").val();
	if(time == '5分钟'){
		TimeCounter = 5*60;
	}else if(time == '30分钟'){
		TimeCounter = 30*60;
	}else if(time == '60分钟'){
		TimeCounter = 60*60;
	}
	console.log("onClickSyncData : "+Device_ID);
	
	//for test
	var  data = { bst_fae:true , arrow:'up',current:'42',status:'超载' , register:[1,2,4,5]};
	index =  rnd(0,4);

	if (index ==0){
		data.arrow = 'up';
	} else if (index == 1){
		data.arrow = 'down';
	} else if(index == 2){
		data.arrow = "uprun";
	}else {
		data.arrow = "downrun";
	}
	updateStatus(data);
}

function updateStatus(item ){
			var arrow = item.arrow;
		  	var current = item.current;
		  	var status = item.status;
		  	var register = item.register;
		  			
		  	if(arrow == "up"){
		  		$('#arrow_image').attr("src","img/up.png");

            }else if(arrow == 'down'){
                $('#arrow_image').attr("src","img/down.png");

            }else if(arrow == 'downrun'){
                $('#arrow_image').attr("src","img/downrun.gif");

            }else if(arrow == 'uprun'){
                $('#arrow_image').attr("src","img/uprun.gif");
            }
            else {
                $('#arrow_image').attr("src","img/none.png");
		  	}
		  	if(current != undefined){
                $("#current_floor").html(''+current);
			}
    		if(register != undefined){
                $("#register_floor").html('已登记：'+register);
			}
    		if(status != undefined){
        		$("#status_label").html(status);
    		}
}

function getSyncData() {
	if(TimeCounter > 0){
		var  data = {   bst_fae:true,
						msg_type:"bst_fae",
						cmd_type: "syncdata",
						server_id:server_id} ;
		sendMqttMessage(Device_ID, JSON.stringify(data));
		console.log("sync data to : "+Device_ID);
		TimeCounter --;
		console.log("getSyncData call  :"+Device_ID);
	}
}
var FILE_UPLOAD_URI="http://192.168.168.166:8900/upload/UploadServlet";

var resource_name;
var resource_type;
var resource_url;
function onClickUploadFile() {
	
	var path =  $('#file').val();
	
	if(path.length <=0){
        //alert("请先选择资源文件!");
        //window.alert("欢迎访问我们的 Web 页！");
        //window.parent.alert("请先选择资源文件!");
        layer.alert("请选择资源文件");
        return ;
	}
	
	name =$('#resource_name').val();
	if(name.length ==0 ){
			layer.alert("资源名称不能为空");
			return ;
	}

    resource_name = name;
	file_type = $('#file_type').val();

	resource_type = file_type;
	console.log("select file : "+path + "　名称　:"+name + "  type :"+file_type);
	
	var fileObj = document.getElementById("file").files[0]; // js 获取文件对象
               if (typeof (fileObj) == "undefined" || fileObj.size <= 0) {
                   layer.alert("请选择资源文件");
                   return;
               }
      var formData = new FormData();
      formData.append('video-blob', fileObj);
    // file name
     formData.append('video-filename', fileObj.fileObj);
     formData.append('video-duration', 0);
    
    $.ajax({
        url: FILE_UPLOAD_URI, // replace with your own server URL
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        type: 'POST',
        success: function(response) {
            console.log(response);
            result =  JSON.parse(response);
            if (result.resultCode == 1) {
            	fileurl = result.data.others[0].oUrl;
            	fileurl =  fileurl.replace("rtc/uploadche-tomcat-8.5.31/webapps/ROOT/","");
                addResource(resource_name,fileurl,resource_type);
            } else {
                   layer.alert("上传文件失败");
            }
        }
    });
	
}

function addResource(name , url, type) {
	var data = {
		cmd:"add",
		name:name,
		url:url,
		type:type
	};
    var xhrArgs = {
        url: "resource",
        postData: JSON.stringify(data),
        handleAs: "text",
        load: function(data){
            console.log("get response :"+data);
            layer.alert("上传文件成功");
            updateResourceList();
        },
        error: function(error){        // We'll 404 in the demo, but that's okay.  We don't have a 'postIt' service on the        // docs server.
            console.log("post error ");
        }
    }
    var deferred = dojo.xhrPost(xhrArgs);
}

function onUpdateResource() {
    //updateResourceList();

    var value = $("#resource_list").val();
    if(value.length  != 1){
    
	layer.alert("请选择一个APK资源");
        return ;
    }

    var device = $("#device_list").val();

    if (device.length ==0){
    layer.alert("请在设备部列表中选择需要升级的设备(可多选)");
		return;
    }


    var  data = {
        bst_fae: true,
        msg_type: "bst_fae",
        cmd_type: "updateui",
        server_id: server_id,
        download_url:value[0]};

    var jsonstr = JSON.stringify(data);

    for (index in device){
        sendMqttMessage(device[index], jsonstr);
        console.log("update resource for "+device[index] +"    send data :"+jsonstr);

    }
}
function  onUpdateAPK(){

    var value = $("#resource_list").val();
    if(value.length  != 1){
    layer.alert("请选择一个APK资源");
		return ;
    }

      var  data = {
          bst_fae: true,
          msg_type: "bst_fae",
          cmd_type: "updateapk",
          server_id: server_id,
		  download_url:value[0]};

    sendMqttMessage("bst_fae", JSON.stringify(data));
    console.log("onUpdateAPK : "+data);
}

function  onUpdateVideo()
{

    var value = $("#resource_list").val();
    if(value.length  != 1){
    layer.alert("请选择一个视频资源");
        return ;
    }

    var device = $("#device_list").val();

    if (device.length ==0){
    layer.alert("请在设备部列表中选择需要升级的设备(可多选)");
        return;
    }


    var  data = {
        bst_fae: true,
        msg_type: "bst_fae",
        cmd_type: "updatevideo",
        server_id: server_id,
        download_url:value[0]};

    var jsonstr = JSON.stringify(data);
    for (index in device){
        sendMqttMessage(device[index], jsonstr);
        console.log("update video for "+device[index] +"    send data :"+jsonstr);
    }
}


function onUpdateOTA(){

    var value = $("#resource_list").val();
    if(value.length  != 1){
    layer.alert("请选择一个OTA资源");
        return ;
    }

    var  data = {
        bst_fae: true,
        msg_type: "bst_fae",
        cmd_type: "updateota",
        server_id: server_id,
        download_url:value[0]};

    sendMqttMessage("bst_fae", JSON.stringify(data));
    console.log("onUpdateOTA : "+data);

}


    $(document).ready(function(){
        setTimeout(function () {
            updateResourceList();
		},1000);

        // setTimeout(function () {
        //     onClickUpdate();
        // },6000);
    });


function updateResourceList() {
    var data = {
        cmd:"query"
    };
    var xhrArgs = {
        url: "resource",
        postData: JSON.stringify(data),
        handleAs: "text",
        load: function(data){
            console.log("get response :"+data);
            var obj = JSON.parse(data);
            console.log("get resource  list ok :"+obj.data);
            sel = document.getElementById('resource_list');
            dojo.empty("resource_list");
            var strhtml = [];
            for (index in obj.data){
            	item = obj.data[index];
                let tr = "<tr><td><input type='checkbox' onclick='test(this);'/></td><td>" + item.date + "</td>" + "<td>" + item.type + "</td>" + "<td>" + item.name + "</td>" + "<td>" + item.url + "</td></tr>";
                strhtml.push(tr);
                console.log("tr："+tr);
                document.getElementById('resource_list').innerHTML = strhtml.join('');
			}
        },
        error: function(error){        // We'll 404 in the demo, but that's okay.  We don't have a 'postIt' service on the        // docs server.
            console.log("get resource list error  ");
        }
    }
    dojo.xhrPost(xhrArgs);
}

var str=new Array();

function test(o) {
    if(str.length>0){
        str=new Array();
    }
    if (!o.checked) {
        return;
    }
    var tr = o.parentNode.parentNode;
    var tds = tr.cells;
    var d = "";
    for (var i = 0; i < tds.length; i++) {
        if (i < 5) {
            d = d + tds[i].innerHTML + "|";
        }
    }
    var b=d.substring(d.indexOf("|")+1,d.length-1);
    str = b.split('|');
}

function deleteResource() {
    if (str.length != 4) {
        layer.alert("请选择一条数据");
        return;
    }
    layer.confirm("确认删除资源？",function (i) {
        layer.close(i);
        deleteResourceFunc();
    })
}

function deleteResourceFunc(){

    var value = $("#resource_list").val();

    var data = {
        cmd:"delete",
		url:value[3]
    };
 var xhrArgs = {      
 			url: "resource",
 			postData: JSON.stringify(data),
 			handleAs: "text",      
 			load: function(data){
 				console.log("get response :"+data);
                updateResourceList();
                //$.MsgBox.Alert("消息", "成功!");
 			},      
 			error: function(error){        // We'll 404 in the demo, but that's okay.  We don't have a 'postIt' service on the        // docs server.        
 				console.log("post error ");
                layer.alert("删除失败");
 			}    
 			}  
 			
 var deferred = dojo.xhrPost(xhrArgs);


}

function downloadLOG()
{
    downloadDeviceFile("log");
}
function downloadDeviceFile(type) {
    array =  $("#device_list ").val();
    if(array.length != 1){
        layer.alert("请选择一个设备");
        return;
    }
    client_id = array[0];

    var  data = { bst_fae:true,
        msg_type:"bst_fae",
        cmd_type: type,
        upload_url:"http://192.168.168.166:8900/upload/UploadServlet" ,
        server_id:server_id} ;

    console.log(" device id :"+client_id);
    sendMqttMessage(client_id, JSON.stringify(data));

}
function downloadData() {
    downloadDeviceFile("data");


}
function downloadError () {
    downloadDeviceFile("error");
}

function deleteError () {

}

function onClickNetTime() {

    	if(dijit.byId("set_autotime").checked){
    		dijit.byId("set_date").disabled = false;
            dijit.byId("set_time").disabled = false;

        }else{
            dijit.byId("set_date").disabled = true;
            dijit.byId("set_time").disabled = true;
		}

    	console.log("net time :"+dijit.byId("set_autotime").checked);
}

function getValue(id) {
	return $("#"+id).val();
}

function loadSetting ()
{

	list = $("#device_list ").val();
    if(list.length != 1){
        layer.alert("请选择一个设备");
        return;
    }
    Device_ID = list[0];

    var  data = {   bst_fae:true,
        msg_type:"bst_fae",
        cmd_type: "readsetting",
        server_id:server_id} ;
    sendMqttMessage(Device_ID, JSON.stringify(data));
    console.log("loadSetting : "+Device_ID);

}

function setSelect(view, value)
{
	var id = "#"+view;
	var option = "option[value = '" + value +"']";
    $(id).find(option).attr("selected","selected");
}


function updateSettting(data)
{

    //方向
    $("#set_deriction").val(data.direction);
    //分辨率
    $("#set_res").val(data.resolution);


    if(data.language == "ch"){
        $("#set_lan").val("中文");
    }else{
        $("#set_lan").val("英文");
    }

    //正常亮度
    $("#set_nomal_light").val(data.normalLight);
    //待机亮度
    $("#set_idle_light").val(data.idleLight);

    //报站音量
    $("#set_come_voice").val(data.reportingVolume);
    //视频音量
    $("#set_video_voice").val(data.videoVolume);

    //待机时间
    if(data.standbyTime<=5){
        $("#set_standby").val("5分钟");
    }else if(data.standbyTime<=15){
        $("#set_standby").val("15分钟");
    }else if(data.standbyTime<=30){
        $("#set_standby").val("30分钟");
    }else if(data.standbyTime<=45){
        $("#set_standby").val("45分钟");
    }else {
        $("#set_standby").val("60分钟");
    }

   // $("#set_standby").val("60分钟");


    //网络自动校准时间
    if(data.autotime){
        dijit.byId("set_date").disabled = true;
        dijit.byId("set_time").disabled = true;
    }else{
        dijit.byId("set_date").disabled = false;
        dijit.byId("set_time").disabled = false;
    }
    dijit.byId('set_autotime').attr('checked',!data.autotime);

    $("#set_welcome").html ( data.welcome);

    $("#set_device_id").html("设备ID:"+data.app_id);

    $("#set_version").html("软件版本号:"+ mapVersion[data.app_id] +"    "+mapSystemVersion[data.app_id]);




}

function saveSetting()
{

    list = $("#device_list ").val();
    if(list.length != 1){
        layer.alert("请选择一个设备");
        return;
    }
    Device_ID = list[0];


    var date = new Date();
    var datestr = $("#set_date").val();

    if (datestr==""){
        datestr=""+date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate();
    }
    var timestr = $("#set_time").val();

    if(timestr==""){
        timestr=""+date.getHours()+":"+date.getMinutes();
    }else{

        if(timestr.indexOf("上午")==0){
            timestr = timestr.replace("上午","");
        }else{
            timestr = timestr.replace("下午","");
            var value = timestr.split(":");
            var hour=  parseInt(value[0]);
            if(hour == 12){
                hour = 12;
            }else {
                hour = hour + 12;
            }
            timestr = ""+hour+":"+value[1];
        }

    }



	var data = {
        bst_fae:true,
        msg_type:"bst_fae",
        cmd_type: "writesetting",
        server_id:server_id,
        language:getValue("set_lan")=="中文"?"ch":"en",
        resolution:getValue("set_res"),
        direction:getValue("set_deriction"),
        auto_time:!(dijit.byId("set_autotime").checked),
        dateTime:datestr,
		clockTime:timestr,
        normalLight:getValue("set_nomal_light"),
        idleLight:getValue("set_idle_light"),
        reportingVolume:getValue("set_come_voice"),
        videoVolume:getValue("set_video_voice"),
		standbyTime:getValue("set_standby_time"),
		welcome:getValue("set_welcome")
    };




	console.log("save settting :"+JSON.stringify(data));
    sendMqttMessage(Device_ID, JSON.stringify(data));

}


var error_list ;


    function updateResourceList() {
        var data = {
            cmd:"queryError"
        };
        var xhrArgs = {
            url: "resource",
            postData: JSON.stringify(data),
            handleAs: "text",
            load: function(data){
                console.log("get response :"+data);

                var obj = JSON.parse(data);
                console.log("get resource  list ok :"+obj.data);
                sel = document.getElementById('log_list');
                dojo.empty("log_list");

                error_list = obj.data;
                for (index in obj.data){
                    item = obj.data[index];


                    var c = dojo.doc.createElement('option');
                    str = item.date + "  |  "+item.error;
                    c.innerHTML =str;
                    c.value =item.date ;
                    sel.appendChild(c);
                }

            },
            error: function(error){        // We'll 404 in the demo, but that's okay.  We don't have a 'postIt' service on the        // docs server.
                console.log("get resource list error  ");
            }
        }
        dojo.xhrPost(xhrArgs);
    }

