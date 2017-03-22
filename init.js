# xiaxia
融云+requirejs模块加载web2.0
/**
 * 皮皮虾
 */
define(['RongIMLib','jquery','mui','init','b'],function(RongIMLib,$,mui,init,b){
    function init(){
        RongIMClient = RongIMLib.RongIMClient;
        RongIMClient.init("xxxxx");
        //RongIMLib.RongIMVoice.init("xxxxx"); //具体的融云appid
        console.log('初始化成功');
        b.conn();
    };

    return {
        init: init
    };
});
