/**
 * Created by byq on 2017/3/2.
 */
define(['RongIMLib','Libamr','RongIMVoice','init'],function(RongIMLib,libamr,RongIMVoice,init){
    function connect(){
        var discussionId    = document.getElementById('discussionId').value;
        var head_portrait   = document.getElementById('head_portrait').value;
        var doctor_portrait = document.getElementById('logo').value;
        var token           = init.token();
        sessionStorage.setItem("discussionId", discussionId);//存储讨论组Id
        RongIMClient = RongIMLib.RongIMClient;
        RongIMClient.setConnectionStatusListener({
            onChanged: function (status) {
                switch (status) {
                    case RongIMLib.ConnectionStatus.CONNECTED:
                        console.log('链接成功');
                        break;
                    case RongIMLib.ConnectionStatus.CONNECTING:
                        console.log('正在链接');
                        break;
                    case RongIMLib.ConnectionStatus.DISCONNECTED:
                        console.log('断开连接');
                        break;
                    case RongIMLib.ConnectionStatus.KICKED_OFFLINE_BY_OTHER_CLIENT:
                        console.log('其他设备登录');
                        break;
                    case RongIMLib.ConnectionStatus.DOMAIN_INCORRECT:
                        console.log('域名不正确');
                        break;
                    case RongIMLib.ConnectionStatus.NETWORK_UNAVAILABLE:
                        console.log('网络不可用');
                        break;
                }
            }
        });
        $("#test").change(function(e){
            var discussionId = sessionStorage.getItem('discussionId');
            if (discussionId == null || discussionId == undefined || discussionId == '') {
                //1,创建讨论组 2,发送ajax请求存入信息内容 3,在讨论组中发送信息
                var discussionName = "妇儿优医"; // 名称自定义
                var userIds = ['paretion_'+userid,'doctor_'+doctorid];//讨论组初始成员。
                console.log('userIds',userIds);
                RongIMClient.getInstance().createDiscussion(discussionName,userIds,{
                    onSuccess:function(discussionId){
                        //创建讨论组的id
                        var url = init.getInterface()+'/m/user/insertAppUserQuestion';
                        sessionStorage.setItem("discussionId",discussionId);//存储讨论组Id
                        imgRongyun(discussionId);
                        var postData = {
                            doctorId:doctorid,
                            patientId:patientId,
                            symptom:'',
                            questionContent:'',
                            discussionId:discussionId,
                            type:0,//付费咨询
                            city:'杭州'
                        };
                        console.log('postData',postData);
                        $.post(url,postData,function(data){
                            groupId = data.result.discussionId;
                            console.log('创建成功咯',discussionId);
                        });
                    }
                });
            }else{
                imgRongyun(discussionId);
            }
        });
        function imgRongyun(){
            //图片压缩
            var data = new FormData($('#form1')[0]);
            $.ajax({
                url: init.getInterfaceBaseUrl()+'/upload.php',  //处理图片文件
                type: 'POST',
                data: data,
                dataType: 'JSON',
                cache: false,
                processData: false,
                contentType: false,
                success: function(data) {
                    console.log('data',data);
                    if(data.message == 1 || data.message == 5){
                        var imageUri = data.data; // 上传到自己服务器的 URL。
                        var Base64Img = data.data2; //转成的Base64的值
                        console.log('PHP图片压缩',Base64Img);
                        //var conversationtype = RongIMLib.ConversationType.PRIVATE; // 私聊,其他会话选择相应的消息类型即可。
                        //var targetId = "xxx"; // 目标 Id
                        var discussionId = sessionStorage.getItem('discussionId');
                        imgRongIM(imageUri,discussionId,Base64Img);
                    }
                }
            });
        }
        function imgRongIM(b,c,d){
            var discussionId = sessionStorage.getItem('discussionId');//创建讨论组
            console.log('discussionId',discussionId);
            console.log('base64Str',d);
            if(discussionId){
                if(d){
                    var base64Str = d.trim();
                    //todo图片大小只能小于30KB,融云规定
                    var msg = new RongIMLib.ImageMessage({content:base64Str,imageUri:b});
                    RongIMClient.getInstance().sendMessage(2,c, msg, {
                            onSuccess: function (message) {
                                //message 为发送的消息对象并且包含服务器返回的消息唯一Id和发送消息时间戳
                                content.innerHTML += '<div class="msg-item msg-item-self">' +
                                    '<img class="msg-user-img" style="float: right" src="'+head_portrait+'" alt="" />' +
                                    '<div class="msg-content">' +
                                    '<div class="msg-content-inner"><img style="width: 200px;" src="'+
                                            message.content.imageUri +'">' +
                                    '</div><div class="msg-content-arrow"></div></div>' +
                                    '<div class="mui-item-clear"></div></div>';
                                // 内容过多时,将滚动条放置到最底端
                                content.scrollTop=content.scrollHeight;
                                //message 为发送的消息对象并且包含服务器返回的消息唯一Id和发送消息时间戳
                                console.log("发送成功ok");
                            },
                            onError: function (errorCode,message) {
                                var info = '';
                                switch (errorCode) {
                                    case RongIMLib.ErrorCode.TIMEOUT:
                                        info = '超时';
                                        break;
                                    case RongIMLib.ErrorCode.UNKNOWN_ERROR:
                                        info = '未知错误';
                                        break;
                                    case RongIMLib.ErrorCode.REJECTED_BY_BLACKLIST:
                                        info = '在黑名单中，无法向对方发送消息';
                                        break;
                                    case RongIMLib.ErrorCode.NOT_IN_DISCUSSION:
                                        info = '不在讨论组中';
                                        break;
                                    case RongIMLib.ErrorCode.NOT_IN_GROUP:
                                        info = '不在群组中';
                                        break;
                                    case RongIMLib.ErrorCode.NOT_IN_CHATROOM:
                                        info = '不在聊天室中';
                                        break;
                                    default :
                                        info = x;
                                        break;
                                }
                                console.log('发送失败:' + info);
                            }
                        }
                    );
                }
            }
        }
        var content    = document.getElementById('msg-list');
        var questionId = document.getElementById('questionId').value;
        var history  = document.getElementById('history');
        var doctorid = document.getElementById('doctorId').value;
        var userid   = document.getElementById('userid').value;
        var type     = document.getElementById('type').value;
        var patientId = document.getElementById('patientId').value;
        //获取历史消息
        if(questionId){
            var xhr = new XMLHttpRequest();
            var url = init.getInterface()+'/m/user/getConsultRecordList';
            var postData = {
                questionId:questionId
            };
            mui.post(url,postData,function(data){
                console.log('历史纪录',data);
                var data = data.result.dataList;
                var dataList = data.length;
                for(i=0;i<dataList;i++){
                    if(data[i].replyFrom == 0){//是患者
                        var http = data[i].replyContent;
                        var imgHttp = http.substr(0, 4);
                        if(imgHttp == 'http'){
                            content.innerHTML += '<div class="msg-item msg-item-self">' +
                                '<img class="msg-user-img" style="float: right" src="'+head_portrait+'" alt="" />' +
                                '<div class="msg-content">' +
                                '<div class="msg-content-inner" style="width: 200px;"><img style="width: 200px;" src="'+data[i].replyContent+'">'+
                            '</div><div class="msg-content-arrow"></div></div>' +
                                '<div class="mui-item-clear"></div></div>';
                        }else{
                            content.innerHTML += '<div class="msg-item msg-item-self">' +
                                '<img class="msg-user-img" style="float: right" src="'+head_portrait+'" alt="" />' +
                                '<div class="msg-content">' +
                                '<div class="msg-content-inner" style="width: 200px;">' +
                                data[i].replyContent +
                                '</div><div class="msg-content-arrow"></div></div>' +
                                '<div class="mui-item-clear"></div></div>';
                        }
                        // 内容过多时,将滚动条放置到最底端
                        content.scrollTop=content.scrollHeight;
                    }else{
                        var http = data[i].replyContent;
                        var imgHttp = http.substr(0, 4);
                        if(imgHttp == 'http'){
                            content.innerHTML += '<div class="msg-item">' +
                                '<img class="msg-user-img" src="'+head_portrait+'" alt="" />' +
                                '<div class="msg-content">' +
                                '<div class="msg-content-inner" style="width: 200px;"><img style="width: 200px;" src="'+data[i].replyContent+'">'+
                                '</div><div class="msg-content-arrow"></div></div>' +
                                '<div class="mui-item-clear"></div></div>';
                        }else{
                            content.innerHTML += '<div class="msg-item">' +
                                '<img class="msg-user-img" src="'+head_portrait+'" alt="" />' +
                                '<div class="msg-content">' +
                                '<div class="msg-content-inner" style="width: 200px;">' +
                                data[i].replyContent +
                                '</div><div class="msg-content-arrow"></div></div>' +
                                '<div class="mui-item-clear"></div></div>';
                        }
                        // 内容过多时,将滚动条放置到最底端
                        content.scrollTop=content.scrollHeight;
                    }
                }
                console.log('历史消息',data);
            });
        }
        //历史消息结束
        RongIMClient.setOnReceiveMessageListener({
            onReceived:function(message){
                // 判断消息类型
                switch(message.messageType){
                    case RongIMClient.MessageType.TextMessage:
                        if(message.content.content !== undefined){
                            content.innerHTML += '<div class="msg-item">' +
                                '<img class="msg-user-img" src="'+doctor_portrait+'" alt="" />' +
                                '<div class="msg-content">' +
                                '<div class="msg-content-inner" style="width: 200px;">' +
                                message.content.content +
                                '</div><div class="msg-content-arrow"></div></div>' +
                                '<div class="mui-item-clear"></div></div>';
                            // 内容过多时,将滚动条放置到最底端
                            content.scrollTop=content.scrollHeight;
                        }
                        // message.content.content => 消息内容
                        break;
                    case RongIMClient.MessageType.VoiceMessage:
                        // 对声音进行预加载
                        var base64Str = message.content.content;

                            //var base64Str = message.content.content;
                        //RongIMLib.RongIMVoice.play(base64Str);
                        //console.log('语音播放',base64Str);
                        //var snd = new Audio("data:audio/wav;base64," + base64Str);
                        //snd.play();
                        //return false;
                        content.innerHTML += '<div class="msg-item">' +
                            '<img class="msg-user-img" src="'+doctor_portrait+'" alt="" />' +
                            '<div class="msg-content">' +
                            '<div class="msg-content-inner"><span class="mui-icon mui-icon-mic" style="font-size: 18px;font-weight: bold;"></span>'
                            +'<span id="play-state">点击播放</span></div><div class="msg-content-arrow"></div></div>' +
                            '<div class="mui-item-clear"></div></div>';
                        playDog(base64Str);
                        // 内容过多时,将滚动条放置到最底端
                        content.scrollTop=content.scrollHeight;
                        //console.log('声音文件1234',base64Str);
                        // message.content.content 格式为 AMR 格式的 base64 码
                        break;
                    case RongIMClient.MessageType.ImageMessage:
                        if(message.content.content !== undefined){
                            content.innerHTML += '<div class="msg-item">' +
                                '<img class="msg-user-img" src="'+doctor_portrait+'" alt="" />' +
                                '<div class="msg-content">' +
                                '<div class="msg-content-inner"><img style="width:200px;" src="' +
                                message.content.imageUri +
                                '"></div><div class="msg-content-arrow"></div></div>' +
                                '<div class="mui-item-clear"></div></div>';
                            // 内容过多时,将滚动条放置到最底端
                            content.scrollTop=content.scrollHeight;
                        }
                        break;
                    case RongIMClient.MessageType.DiscussionNotificationMessage:
                        // message.content.extension => 讨论组中的人员。
                        break;
                    case RongIMClient.MessageType.LocationMessage:
                        // message.content.latiude => 纬度。
                        // message.content.longitude => 经度。
                        // message.content.content => 位置图片 base64。
                        break;
                    case RongIMClient.MessageType.RichContentMessage:
                        // message.content.content => 文本消息内容。
                        // message.content.imageUri => 图片 base64。
                        // message.content.url => 原图 URL。
                        break;
                    case RongIMClient.MessageType.InformationNotificationMessage:
                        // do something...
                        break;
                    case RongIMClient.MessageType.ContactNotificationMessage:
                        // do something...
                        break;
                    case RongIMClient.MessageType.ProfileNotificationMessage:
                        // do something...
                        break;
                    case RongIMClient.MessageType.CommandNotificationMessage:
                        // do something...
                        break;
                    case RongIMClient.MessageType.CommandMessage:
                        // do something...
                        break;
                    case RongIMClient.MessageType.UnknownMessage:
                        // do something...
                        break;
                    default:
                    // do something...
                }
            }
        });;

        //var playState = document.querySelectorAll('play-state');
        //console.log(playState);
        function playDog(base64Str){
            console.log('base64Str',base64Str);
            var duration = base64Str.length/1024;
            RongIMLib.RongIMVoice.play(base64Str,duration);
            //RongIMLib.RongIMVoice.preLoaded(base64Str, function() {
            //    var duration = base64Str.length/1024;
            //    RongIMLib.RongIMVoice.play(base64Str,duration);
            //});
        };
        //console.log('playState',playState);
        //if(playState != null){
        //
        //}
        //console.log(playState);

        RongIMClient.connect(token, {
            onSuccess: function (x) {
                console.log("用户的id＝" + x);
                self = x;
            },
            onError: function (x) {
                window.console.log(x.getMessage())
            }
        });
        history.addEventListener("click", function() {
            var questionContent = document.getElementById('msg-text').value;
            console.log('questionContent',questionContent);
            if (questionContent == null || questionContent == undefined || questionContent == '') {
                return false;
            }
            //判断是否已经创建过讨论组
            console.error('length',typeof sessionStorage.length);
            var length = sessionStorage.length;
            var discussionId = sessionStorage.getItem('discussionId');
            console.log('discussionId',discussionId);
            if(length == 0 || discussionId == ''){
                console.log('创建讨论组开始');
                //1,创建讨论组 2,发送ajax请求存入信息内容 3,在讨论组中发送信息
                var discussionName = "妇儿优医"; // 名称自定义
                var userIds = ['paretion_'+userid,'doctor_'+doctorid];//讨论组初始成员。
                console.log('userIds',userIds);
                RongIMClient.getInstance().createDiscussion(discussionName,userIds,{
                    onSuccess:function(discussionId){
                        //创建讨论组的id
                        var url = init.getInterface()+'/m/user/insertAppUserQuestion';
                        RongIMClient.getInstance().createDiscussion(discussionName,userIds,{
                            onSuccess:function(discussionId){
                                sessionStorage.setItem("discussionId", discussionId);//存储讨论组Id
                                //存储讨论组的id
                                var url = init.getInterface()+'/m/user/insertAppUserQuestion';
                                // discussionId => 讨论组 Id。
                                var postData = {
                                    doctorId:doctorid,
                                    patientId:patientId,
                                    symptom:'',
                                    questionContent:questionContent,
                                    discussionId:discussionId,
                                    type:type,
                                    city:'杭州'
                                };
                                mui.post(url,postData,function(data){
                                    if(data.message == '创建成功'){
                                        var msg = new RongIMLib.TextMessage({content:questionContent,extra:"附加信息"});
                                        //var conversationtype = RongIMLib.ConversationType.PRIVATE; // 私聊,其他会话选择相应的消息类型即可。
                                        RongIMClient.getInstance().sendMessage(2, discussionId, msg, {
                                                onSuccess: function (message) {
                                                    //message 为发送的消息对象并且包含服务器返回的消息唯一Id和发送消息时间戳
                                                    console.log('发送消息成功');
                                                    content.innerHTML += '<div class="msg-item msg-item-self">' +
                                                        '<img class="msg-user-img" style="float: right" src="'+head_portrait+'" alt="" />' +
                                                        '<div class="msg-content">' +
                                                        '<div class="msg-content-inner">' +
                                                        message.content.content +
                                                        '</div><div class="msg-content-arrow"></div></div>' +
                                                        '<div class="mui-item-clear"></div></div>';
                                                    // 内容过多时,将滚动条放置到最底端
                                                    content.scrollTop=content.scrollHeight;
                                                    //message 为发送的消息对象并且包含服务器返回的消息唯一Id和发送消息时间戳
                                                    console.log("发送成功ok");
                                                    //清空Input的值
                                                    document.getElementById('msg-text').value = '';
                                                },
                                                onError: function (errorCode,message) {
                                                    var info = '';
                                                    switch (errorCode) {
                                                        case RongIMLib.ErrorCode.TIMEOUT:
                                                            info = '超时';
                                                            break;
                                                        case RongIMLib.ErrorCode.UNKNOWN_ERROR:
                                                            info = '未知错误';
                                                            break;
                                                        case RongIMLib.ErrorCode.REJECTED_BY_BLACKLIST:
                                                            info = '在黑名单中，无法向对方发送消息';
                                                            break;
                                                        case RongIMLib.ErrorCode.NOT_IN_DISCUSSION:
                                                            info = '不在讨论组中';
                                                            break;
                                                        case RongIMLib.ErrorCode.NOT_IN_GROUP:
                                                            info = '不在群组中';
                                                            break;
                                                        case RongIMLib.ErrorCode.NOT_IN_CHATROOM:
                                                            info = '不在聊天室中';
                                                            break;
                                                        default :
                                                            info = x;
                                                            break;
                                                    }
                                                    console.log('发送失败:' + info);
                                                }
                                            }
                                        );
                                    }
                                });
                            },
                            onError:function(error){
                                // error => 创建讨论组失败错误码。
                            }
                        });
                        // discussionId => 讨论组 Id。
                    },
                    onError:function(error){
                        // error => 创建讨论组失败错误码。
                    }
                });
            }else{
                console.log('聊天开始');
                var discussionId = sessionStorage.getItem('discussionId');
                console.log('discussionId2',discussionId);
                var msg = new RongIMLib.TextMessage({content:questionContent,extra:"附加信息"});
                //var conversationtype = RongIMLib.ConversationType.PRIVATE; // 私聊,其他会话选择相应的消息类型即可。
                RongIMClient.getInstance().sendMessage(2, discussionId, msg, {
                        onSuccess: function (message) {
                            console.log('发送消息成功');
                            content.innerHTML += '<div class="msg-item msg-item-self">' +
                                '<img class="msg-user-img" style="float: right" src="'+head_portrait+'" alt="" />' +
                                '<div class="msg-content">' +
                                '<div class="msg-content-inner">' +
                                message.content.content +
                                '</div><div class="msg-content-arrow"></div></div>' +
                                '<div class="mui-item-clear"></div></div>';
                            // 内容过多时,将滚动条放置到最底端
                            content.scrollTop=content.scrollHeight;
                            //message 为发送的消息对象并且包含服务器返回的消息唯一Id和发送消息时间戳
                            console.log("发送成功ok");
                        },
                        onError: function (errorCode,message) {
                            var info = '';
                            switch (errorCode) {
                                case RongIMLib.ErrorCode.TIMEOUT:
                                    info = '超时';
                                    break;
                                case RongIMLib.ErrorCode.UNKNOWN_ERROR:
                                    info = '未知错误';
                                    break;
                                case RongIMLib.ErrorCode.REJECTED_BY_BLACKLIST:
                                    info = '在黑名单中，无法向对方发送消息';
                                    break;
                                case RongIMLib.ErrorCode.NOT_IN_DISCUSSION:
                                    info = '不在讨论组中';
                                    break;
                                case RongIMLib.ErrorCode.NOT_IN_GROUP:
                                    info = '不在群组中';
                                    break;
                                case RongIMLib.ErrorCode.NOT_IN_CHATROOM:
                                    info = '不在聊天室中';
                                    break;
                                default :
                                    info = x;
                                    break;
                            }
                            console.log('发送失败:' + info);
                        }
                    }
                );
            }
            return false;
        });

    };
    return {
        conn: connect
    };
});
