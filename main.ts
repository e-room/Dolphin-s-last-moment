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
