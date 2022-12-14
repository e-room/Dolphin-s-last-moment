/**
 * Copyright (c) 2022 ZEP Co., LTD
 */

import "zep-script";
import {Script} from "vm";

const TRASH_SPEED_LEVEL = 4; // 숫자가 높을수록 쓰레기의 이동속도가 느려짐 (정수)
let isStageReady = true;

const stageClearMessage = ScriptApp.loadSpritesheet('toast-message.png', 639, 144);

/**
 * 게임시간
 */
let _currentSecond = 0;

/**
 * 토스트 스타일
 */
let toastStyle =
    `
    display: inline-block; 
    text-align: center; 
    width: 100%;
    color: blue; 
    font-size: 80px;
    `;

/**
 * ANCIENT, MEDIEVAL, INDUST, MODERN
 */
let currentStageLevel = 'ANCIENT';
let trashSpeedLevel = 1;

/**
 * 시대에 따른 건물
 */
let ancientBuilding = ScriptApp.loadSpritesheet('ancient.png', 700, 700);
let medievalBuilding = ScriptApp.loadSpritesheet('medieval.png', 700, 700);
let industBuilding = ScriptApp.loadSpritesheet('indust.png', 700, 700);
let modernBuilding = ScriptApp.loadSpritesheet('modern.png', 700, 700);

/**
 * 돌고래
 */
let dolphinThreeLife = ScriptApp.loadSpritesheet('dolphin-3life.png', 120, 80, {
    left: [0, 1, 2, 3], // left 라는 이미 정해진 왼쪽 방향으로 걸을 때의 애니메이션 이름
    up: [0, 1, 2, 3], // 그 이름에 쓰일 전체 파일에서의 인덱스 넘버들
    down: [0, 1, 2, 3],
    right: [7, 6, 5, 4],
}, 8);

let dolphinTwoLife = ScriptApp.loadSpritesheet('dolphin-2life.png', 120, 80, {
    left: [0, 1, 2, 3], // left 라는 이미 정해진 왼쪽 방향으로 걸을 때의 애니메이션 이름
    up: [0, 1, 2, 3], // 그 이름에 쓰일 전체 파일에서의 인덱스 넘버들
    down: [0, 1, 2, 3],
    right: [7, 6, 5, 4],
}, 8);

let dolphinOneLife = ScriptApp.loadSpritesheet('dolphin-1life.png', 120, 80, {
    left: [0, 1, 2, 3], // left 라는 이미 정해진 왼쪽 방향으로 걸을 때의 애니메이션 이름
    up: [0, 1, 2, 3], // 그 이름에 쓰일 전체 파일에서의 인덱스 넘버들
    down: [0, 1, 2, 3],
    right: [7, 6, 5, 4],
}, 8);

let dolphinDead = ScriptApp.loadSpritesheet('dolphin-dead.png', 120, 81);


/**
 * Trash Objects
 * 고대 : 나뭇가지
 */
// 고대
let trash = ScriptApp.loadSpritesheet('poop.png', 48, 43, [0], 16);
let _trashs = [];
let ancientBranchS = ScriptApp.loadSpritesheet('ancient-branch-s.png', 65, 40);
let _ancientBranchSs = [];
let ancientBranchM = ScriptApp.loadSpritesheet('ancient-branch-m.png', 75, 50);
let _ancientBranchMs = [];

const ancientTrashNameList = ['ancientBranchS', 'ancientBranchM'];

// 중세
let medievalPaperS = ScriptApp.loadSpritesheet('medieval-paper-s.png', 30, 30);
let _medievalPaperSs = [];
let medievalPaperM = ScriptApp.loadSpritesheet('medieval-paper-m.png', 30, 30);
let _medievalPaperMs = [];
let medievalSteel = ScriptApp.loadSpritesheet('medieval-steel.png', 40, 30);
let _medievalSteels = [];

const medievalTrashNameList = ['medievalPaperS', 'medievalPaperM', 'medievalSteel'];

// 산업화
let industCoalS = ScriptApp.loadSpritesheet('indust-coal-s.png', 30, 30);
let _industCoalSs = [];
let industCoalM = ScriptApp.loadSpritesheet('indust-coal-m.png', 35, 35);
let _industCoalMs = [];
let industCoalL = ScriptApp.loadSpritesheet('indust-coal-l.png', 40, 40);
let _industCoalLs = [];
let industOilS = ScriptApp.loadSpritesheet('indust-oil-s.png', 241, 161);
let _industOilSs = [];
let industOilM = ScriptApp.loadSpritesheet('indust-oil-m.png', 120, 80);
let _industOilMs = [];
let industOilL = ScriptApp.loadSpritesheet('indust-oil-l.png', 120, 100);
let _industOilLs = [];

const industTrashNameList = ['industCoalS', 'industCoalM', 'industCoalL', 'industOilS', 'industOilM', 'industOilL'];

// 현대
let modernCan = ScriptApp.loadSpritesheet('modern-can.png', 45, 30);
let _modernCans = [];
let modernPlastic = ScriptApp.loadSpritesheet('modern-plastic.png', 45, 55);
let _modernPlastics = [];
let modernVinyl = ScriptApp.loadSpritesheet('modern-vinyl.png', 54, 56);
let _modernVinyls = [];

const modernTrashNameList = ['modernCan', 'modernPlastic', 'modernVinyl'];

const STATE_INIT = 3000;
const STATE_READY = 3001;
const STATE_PLAYING = 3002;
const STATE_JUDGE = 3004;
const STATE_END = 3005;

let _level = 1;
let _levelTimer = 15;
let _levelAddTimer = 0;

let _start = false;
let _timer = 90;

let _stateTimer = 0;

let _genTime = 0;
let _dropTime = 0;

let _live = 0;

let _players = ScriptApp.players; // ScriptApp.players : get total players

let _state;
let _stateTImer;

// 체력바 표시 함수
function setHPgage(p, hp) {
    switch (hp) {
        case 3:
            p.title = "❤❤❤";
            break;
        case 2:
            p.title = "❤❤";
            break;
        case 1:
            p.title = "❤";
            break;
        default:
            p.title = null;
            break;
    }
}

function clearAllList() {
    // 고대
    _trashs = [];
    _ancientBranchSs = [];
    _ancientBranchMs = [];

    // 중세
    _medievalPaperSs = [];
    _medievalPaperMs = [];
    _medievalSteels = [];

    // 산업화
    _industCoalSs = [];
    _industCoalMs = [];
    _industCoalLs = [];
    _industOilSs = [];
    _industOilMs = [];
    _industOilLs = [];

    // 현대
    _modernCans = [];
    _modernPlastics = [];
    _modernVinyls = [];
}

function startScriptApp()
{
    _start = true;
    _stateTimer = 0;
    _genTime = 0;
    _dropTime = 0;
    _timer = 90;

    ScriptMap.putObject(0, 0, ancientBuilding);

    for(let i in _players) {
        let p = _players[i];
        // create and utilize option data using tags.
        p.tag = {
            alive : true,
            hp: 3, // 생명 개수 세팅
            shield: false,
            time: 1, // 부딪힌 후 1초간 무적 상태를 설정하기 위한 속성
        };
        p.sendUpdated();
    }
}

function startState(state)
{
    _state = state;
    _stateTImer = 0;
    switch(_state)
    {
        case STATE_INIT:
            startScriptApp();
            break;
        case STATE_READY:
            break;
        case STATE_PLAYING:
            // Show Label
            ScriptApp.showCenterLabel("GAME START!");
            break;
        case STATE_JUDGE:
            // todo : 여기서 오브젝트 날리기
            ScriptMap.clearAllObjects();
            break;
        case STATE_END:
            _start = false;
            _currentSecond = 0;
            currentStageLevel = 'ANCIENT';
            for(let i in _players) {
                let p = _players[i];
                p.sprite = null;
                p.moveSpeed = 80;
                p.sendUpdated();
            }
            break;
    }
}

function checkSuvivors() {
    if(!_start)
        return;
    let alive = 0;
    for(let i in _players) {
        let p = _players[i];
        if(p.tag.alive) ++alive;
    }
    return alive;
}

ScriptApp.onStart.Add(function() {
    // startState(STATE_INIT);
});

// when player join the space event
// 플레이어가 스페이스에 입장 했을 때 이벤트
ScriptApp.onJoinPlayer.Add(function(p) {
    // create and utilize option data using tags.

    if(_start)
    {
        p.tag = {
            alive : false,
            hp: 3,
            shield: false,
            time: 1
        };

        // change move speed
        p.moveSpeed = 40;

        // change sprite image
        p.sprite = dolphinDead;

        // when player property changed have to call this method
        // 플레이어 속성 변경 시 반드시 호출하여 업데이트 한다.
        p.sendUpdated();
    } else {
        p.tag = {
            alive : true,
            hp: 3,
            shield: false,
            time: 1
        };

        // change move speed
        p.moveSpeed = 80;

        // change sprite image
        p.sprite = dolphinDead;

        // when player property changed have to call this method
        // 플레이어 속성 변경 시 반드시 호출하여 업데이트 한다.
        p.sendUpdated();
    }
    _players = ScriptApp.players;
});

// when player leave the space event
// 플레이어가 스페이스를 나갔을 때 이벤트
ScriptApp.onLeavePlayer.Add(function(p) {
    p.title = null;
    p.sprite = null;
    p.moveSpeed = 80;
    p.sendUpdated();

    _players = ScriptApp.players; // ScriptApp.players : get total players
});

// when player touched objects event
// 플레이어가 오브젝트와 부딪혔을 때
ScriptApp.onObjectTouched.Add(function(sender, x, y, tileID) {
    if(!_start) // 시작하지 않았을 때
        return;

    if(!sender.tag.alive) // 이미 죽은 플레이어 일 때
        return;

    if (sender.tag.alive && !sender.tag.shield) {
        sender.tag.hp--;

        if(sender.tag.hp == 2) {
            sender.sprite = dolphinTwoLife;
            sender.sendUpdated();
        }

        if(sender.tag.hp == 1) {
            sender.sprite = dolphinOneLife;
            sender.sendUpdated();
        }

        if(sender.tag.hp == 0) {
            sender.title = null;
            sender.tag.alive = false;
            sender.sprite = dolphinDead;
            sender.moveSpeed = 40;
            sender.sendUpdated();
        } else {
            sender.tag.shield = true; // 부딪히면 1초간 무적이 됨
            setHPgage(sender, sender.tag.hp);
            sender.sendUpdated();
        }
    }

});

// when the game block is pressed event
// 게임 블록을 밟았을 때 호출되는 이벤트
ScriptApp.onDestroy.Add(function() {
    // for(let i in _trashs) {
    //     let b = _trashs[i];
    //     ScriptMap.putObject(b[1], b[0], null);
    // }
});

/**
 *
 * @param dt
 * @param trashType 쓰레기종류 문자열
 * @param speed 속도
 */
function moveTrash(dt, trashType = 'trash', speed = 0.08, generateLevel = 5) {

    // if(trashSpeedLevel != TRASH_SPEED_LEVEL) return ;

    const trashList = `_${trashType}s`;
    _genTime -= dt;
    if(_genTime <= 0) { // 시대별로 generateLevel 조정해주면 될 듯
        _genTime = Math.random() * (generateLevel - (1 * 0.05)); //1을 _level로 두면 레벨올라갈수록 많이 생성

        let b = [Math.floor((ScriptMap.height-8) * Math.random()) + 8,-1];

        eval(trashList).push(b);
        if(b[1] >= 0)
            ScriptMap.putObject(b[1], b[0], eval(trashType), { // put 쓰레기
                overlap: true,
            });


    }

    _dropTime -= dt;
    if(_dropTime <= 0) {
        _dropTime = Math.random() * (0.5 - (1 * speed)); // 속도 설정, 1을 _level로 두면 레벨올라갈수록 빨라짐

        for(let i in eval(trashList)) {
            let b = eval(trashList)[i];
            ScriptMap.putObject(b[1], b[0], null);

            b[1]++;
            if(b[1] < ScriptMap.width) {
                ScriptMap.putObject(b[1], b[0], eval(trashType), { // put 쓰레기
                    overlap: true,
                });
            }
        }

        for(let k = eval(trashList).length - 1;k >= 0;--k) {
            let b = eval(trashList)[k];
            if(b[1] >= ScriptMap.width)
                eval(trashList).splice(k, 1);
        }
    }

    _levelAddTimer += dt;
    if(_levelAddTimer >= _levelTimer)
    {
        _level++;
        _levelAddTimer = 0;

        if(_level > 6)
        {
            _level = 6;
        }
    }
}

function batchMoveTrash(dt, stageLevel) {
    switch (stageLevel) {
        case 'ANCIENT':
            moveTrash(dt, 'ancientBranchS', 0.08, 10);
            moveTrash(dt, 'ancientBranchM', 0.07, 10); // 0.08내외로 속도 조정하기
            break;
        case 'MEDIEVAL':
            moveTrash(dt, 'medievalPaperS', 0.08, 12);
            moveTrash(dt, 'medievalPaperM', 0.09, 12);
            moveTrash(dt, 'medievalSteel', 0.09, 12);
            break;
        case 'INDUST':
            moveTrash(dt, 'industCoalS', 0.15, 15);
            moveTrash(dt, 'industCoalM', 0.15, 15);
            moveTrash(dt, 'industCoalL', 0.15, 15);
            moveTrash(dt, 'industOilS', 0.15, 15);
            moveTrash(dt, 'industOilM', 0.15, 15);
            moveTrash(dt, 'industOilL', 0.15, 15);
            break;
        case 'MODERN':
            moveTrash(dt, 'modernCan', 0.2, 17);
            moveTrash(dt, 'modernPlastic', 0.2, 17);
            moveTrash(dt, 'modernVinyl', 0.2, 17);
            break;
        default:
            break;
    }
}


// called every 20ms
// 20ms 마다 호출되는 업데이트
// param1 : deltatime ( elapsedTime )
ScriptApp.onUpdate.Add(function(dt) {
    if(!_start) {
        if(ScriptApp.players.length >= 2) {
            _start = true;
            startState(STATE_INIT);
            return;
        }
        ScriptApp.showCenterLabel(`The game starts when more than one player is gathered!`);
        return;
    }


    _stateTimer += dt;
    if(_stateTimer >= 1) {
        _stateTimer = 0;
        _currentSecond += 1;

        ScriptApp.showCenterLabel(`${currentStageLevel == 'INDUST' ? 'INDUSTRIALIZATION' : currentStageLevel } AGE`);

        switch (_currentSecond) {
            case 75:
                isStageReady = true;
                ScriptMap.putObject(18, 13, null);
                break;

            case 70:
                currentStageLevel = 'MODERN';
                ScriptMap.clearAllObjects();
                clearAllList();
                ScriptMap.putObject(0, 0, modernBuilding);
                isStageReady = false;
                ScriptMap.putObject(18, 13, stageClearMessage);
                break;

            case 50:
                isStageReady = true;
                ScriptMap.putObject(18, 13, null);
                break;

            case 45:
                currentStageLevel = 'INDUST';
                ScriptMap.clearAllObjects();
                clearAllList();
                ScriptMap.putObject(0, 0, industBuilding);
                isStageReady = false;
                ScriptMap.putObject(18, 13, stageClearMessage);
                break;

            case 25:
                isStageReady = true;
                ScriptMap.putObject(18, 13, null);
                break;

            case 20:
                currentStageLevel = 'MEDIEVAL';
                ScriptMap.clearAllObjects();
                clearAllList();
                ScriptMap.putObject(0, 0, medievalBuilding);
                isStageReady = false;
                ScriptMap.putObject(18, 13, stageClearMessage);
                break;

            default:
                break;
        }


    }

    switch(_state)
    {
        case STATE_INIT: // 게임 세팅
            ScriptApp.showCenterLabel(`Dolphin's last moment!`);
            for(let i in _players) {
                let p = _players[i];
                p.tag = {
                    alive : true,
                    hp: 3, // 생명 개수 세팅
                    shield: false,
                    time: 1, // 부딪힌 후 1초간 무적 상태를 설정하기 위한 속성
                };
                p.sprite = dolphinThreeLife;
                setHPgage(p, 3);
                p.sendUpdated();
            }

            if(_currentSecond >= 5)
            {
                startState(STATE_READY);
            }
            break;
        case STATE_READY: // 게임 시작
            ScriptApp.showCenterLabel(`IT WILL START SOON!`);

            if(_currentSecond >= 3)
            {
                startState(STATE_PLAYING);
            }
            break;
        case STATE_PLAYING: // 게임 중
            trashSpeedLevel++;
            if(trashSpeedLevel > TRASH_SPEED_LEVEL) trashSpeedLevel = 1;
            if(isStageReady) {
                switch (currentStageLevel) {
                    case 'ANCIENT':
                        batchMoveTrash(dt, 'ANCIENT');
                        break;
                    case 'MEDIEVAL':
                        batchMoveTrash(dt, 'ANCIENT');
                        batchMoveTrash(dt, 'MEDIEVAL');
                        break;
                    case 'INDUST':
                        batchMoveTrash(dt, 'ANCIENT');
                        batchMoveTrash(dt, 'MEDIEVAL');
                        batchMoveTrash(dt, 'INDUST');
                        break;
                    case 'MODERN':
                        batchMoveTrash(dt, 'ANCIENT');
                        batchMoveTrash(dt, 'MEDIEVAL');
                        batchMoveTrash(dt, 'INDUST');
                        batchMoveTrash(dt, 'MODERN');
                        break;
                    default:
                        break;
                }
            }
            for (let i in _players) {
                let p = _players[i];

                // 플레이어가 죽은 상태라면 건너뜀
                if (!p.tag.alive) continue;

                // 피격 후 1초가 지나면 shield 속성을 false로 변경
                if (p.tag.shield) {
                    p.tag.time -= dt;
                    if (p.tag.time <= 0) {
                        p.tag.shield = false;
                        p.tag.time = 1; // shield 지속시간 1초로 초기화
                    }
                }
            }

            _live = checkSuvivors();

            if(_live == 0) startState(STATE_JUDGE);
            break;
        case STATE_JUDGE: // 결과 판정
            if(_live == 0) {
                ScriptApp.showCenterLabel(`ALL THE DOLPHINS ARE DEAD..`);
                startState(STATE_END);
            }
            break;
        case STATE_END:
            break;
    }
});