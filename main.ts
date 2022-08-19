/**
 * Copyright (c) 2022 ZEP Co., LTD
 */

import "zep-script";

ScriptApp.showCenterLabel("Hello World");

let zepLogo = ScriptApp.loadSpritesheet("zep_logo.png");

ScriptMap.putObject(0, 0, zepLogo, { overlap: true });

ScriptApp.onDestroy.Add(function () {
    ScriptMap.clearAllObjects();
});

// Player
ScriptApp.onObjectAttacked.Add(function (sender, x, y) {
    ScriptApp.showCenterLabel(
        `${sender.name}님이 좌표: (${x}, ${y}) 에서 쓰레기를 공격!!`
    )
})

// Trash object
let trash = ScriptApp.loadSpritesheet("trash.png");

ScriptApp.onStart.Add(function () {
    ScriptMap.putObject(5, 5, trash, {overlap: true});
    ScriptMap.putObject(10, 10, trash, {overlap: true});
    ScriptMap.putObject(20, 20, trash, {overlap: true});
});

let _players = ScriptApp.players;
ScriptApp.onJoinPlayer.Add(function (p) {
    p.tag = {
        sturn: false,
        sTime: 2,
    };
    _players = ScriptApp.players;
});

ScriptApp.onUnitAttacked.Add(function (sender, x, y, target){
    if(!target.tag.sturn){
        target.tag.sturn = true;
        target.moveSpeed = 0;
        target.sendUpdated();
    }
})

ScriptApp.onUpdate.Add(function (dt) {
    for(let i in _players){
        let p = _players[i];
        if(p.tag.sturn){
            p.tag.sTime -= dt;
            if(p.tag.sTime <=0){
                p.tag.sturn = false;
                p.tag.sTime = 2;
                p.moveSpeed = 80;
                p.sendUpdated();
            }
        }
    }
});

ScriptApp.onLeavePlayer.Add(function (p) {
    p.moveSpeed = 80;
    p.sendUpdated();
    _players = ScriptApp.players;
})

