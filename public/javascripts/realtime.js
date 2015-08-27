
// 请将 AppId 改为你自己的 AppId，否则无法本地测试
var appId = "n4ibkpr4z9d8tkdlg7k0j6xywwwb28k2jw8fzmj5vrxeve4c";

// 请换成你自己的一个房间的 conversation id（这是服务器端生成的）
var roomId = ""+conversationId;

// 每个客户端自定义的 id
var clientId="LeanCloud9";

// 用来存储 realtimeObject
var rt;

// 用来存储创建好的 roomObject
var room;

// 监听是否服务器连接成功
var firstFlag = roomId=="" ? false : true;

// 用来标记历史消息获取状态
var logFlag = false;

var score = $(".game_info .score");


if (!firstFlag) {
  rt.close();
}
  // 创建实时通信实例
  rt = AV.realtime({
    appId: appId,
    clientId: clientId,

    // 请注意，这里关闭 secure 完全是为了 Demo 兼容范围更大些
    // 具体请参考实时通信文档中的「其他兼容问题」部分
    // 如果真正使用在生产环境，建议不要关闭 secure，具体阅读文档
    // secure 设置为 true 是开启
    secure: true
  });

  // 监听连接成功事件
  rt.on('open', function() {
    firstFlag = false;

    // 获得已有房间的实例
    rt.room(roomId, function(object) {

      // 判断服务器端是否存在这个 room，如果存在
      if (object) {
        room = object;

        // 当前用户加入这个房间
        room.join(function() {

          // 获取成员列表
          room.list(function(data) {

            var l = data.length;

          });

        });

        // 房间接受消息
        room.receive(function(data) {
         score.text(data.msg.scoreA+" : "+data.msg.scoreB);
        });
      } else {
        // 如果服务器端不存在这个 conversation
      }
    });
  });

  // 监听服务情况
  rt.on('reuse', function() {
  });

  // 监听错误
  rt.on('error', function() {
  });