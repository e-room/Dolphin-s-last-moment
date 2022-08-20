/**
 * Copyright (c) 2022 ZEP Co., LTD
 */

import "zep-script";


const TRASH_GENERATE_LEVEL = 5; // 숫자가 높을수록 쓰레기의 양이 줄어듬 (실수)
const TRASH_SPEED_LEVEL = 2; // 숫자가 높을수록 쓰레기의 이동속도가 느려짐 (정수)
let trashSpeedLevel = 1;



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

let tomb = ScriptApp.loadSpritesheet('tomb.png', 32, 48, {
    left: [0],  // defined base anim
    right: [0], // defined base anim
    up: [0],    // defined base anim
    down: [0],  // defined base anim
});

let dolphin = ScriptApp.loadSpritesheet('dolphin.png', 120, 80, {
    left: [0, 1, 2, 3], // left 라는 이미 정해진 왼쪽 방향으로 걸을 때의 애니메이션 이름
    up: [0, 1, 2, 3], // 그 이름에 쓰일 전체 파일에서의 인덱스 넘버들
    down: [0, 1, 2, 3],
    right: [0, 1, 2, 3],
}, 8);


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
let lastSurvivor;

let _state;
let _stateTImer;

// 체력바 표시 함수
function setHPgage(p, hp) {
    switch (hp) {
        case 3:
            p.title = "▮▮▮";
            break;
        case 2:
            p.title = "▮▮";
            break;
        case 1:
            p.title = "▮";
            break;
        default:
            p.title = null;
            break;
    }
}

function startScriptApp()
{
    _start = true;
    _stateTimer = 0;
    _genTime = 0;
    _dropTime = 0;
    _timer = 90;

    for(let i in _players) {
        let p = _players[i];
        // create and utilize option data using tags.
        p.tag = {
            alive : true,
            hp: 3, // 생명 개수 세팅
            shield: false,
            time: 1, // 부딪힌 후 1초간 무적 상태를 설정하기 위한 속성
        };

        setHPgage(p, p.tag.hp);
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
            ScriptApp.showCenterLabel("Game Start");
            break;
        case STATE_JUDGE:
            // todo : 여기서 오브젝트 날리기
            // for(let i in _trashs) {
            //     let b = _trashs[i];
            //     ScriptMap.putObject(b[1], b[0], null);
            // }
            break;
        case STATE_END:
            _start = false;
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
        if(!p.sprite) {
            lastSurvivor = p;
            ++alive;
        }
    }

    return alive;
}

ScriptApp.onStart.Add(function() {
    startState(STATE_INIT);
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
        p.moveSpeed = 20;

        // change sprite image
        // p.sprite = tomb;

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

        if(sender.tag.hp == 0) {
            sender.title = null;
            sender.tag.alive = false;
            sender.sprite = tomb;
            sender.moveSpeed = 40;
            sender.sendUpdated();
        } else {
            sender.tag.shield = true; // 부딪히면 1초간 무적이 됨
            setHPgage(sender, sender.tag.hp);
            sender.sendUpdated();
        }
    }


    // _live = checkSuvivors();
    //
    // if(_live == 1 || _live == 0)
    // {
    //     startState(STATE_JUDGE);
    // }
    // else
    // {
    //     if(_stateTimer >= 1)
    //     {
    //         _stateTimer = 0;
    //         _timer--;
    //         if(_timer <= 0)
    //         {
    //             startState(STATE_JUDGE);
    //         }
    //     }
    // }


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
function moveTrash(dt, trashType = 'trash', speed = 0.08) {

    if(trashSpeedLevel != TRASH_SPEED_LEVEL) return ;

    const trashList = `_${trashType}s`;
    _genTime -= dt;
    if(_genTime <= 0) {
        _genTime = Math.random() * (TRASH_GENERATE_LEVEL - (_level * 0.05)); //

        let b = [Math.floor((ScriptMap.height-8) * Math.random()) + 8,-1];

        eval(trashList).push(b);
        if(b[1] >= 0)
            ScriptMap.putObject(b[1], b[0], eval(trashType), { // put 쓰레기
                overlap: true,
            });


    }

    _dropTime -= dt;
    if(_dropTime <= 0) {
        _dropTime = Math.random() * (0.5 - (_level * speed)); // 속도 설정

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

// called every 20ms
// 20ms 마다 호출되는 업데이트
// param1 : deltatime ( elapsedTime )
ScriptApp.onUpdate.Add(function(dt) {
    if(!_start)
        return;

    _stateTimer += dt;
    switch(_state)
    {
        case STATE_INIT: // 게임 세팅
            ScriptApp.showCenterLabel(`돌고래를 살려줘!!`);
            for(let i in _players) {
                let p = _players[i];
                p.sprite = dolphin;
                p.sendUpdated();
            }

            if(_stateTimer >= 5)
            {
                startState(STATE_READY);
            }
            break;
        case STATE_READY: // 게임 시작
            ScriptApp.showCenterLabel(`곧 시작됩니다!`);

            if(_stateTimer >= 3)
            {
                startState(STATE_PLAYING);
            }
            break;
        case STATE_PLAYING: // 게임 중
            trashSpeedLevel++;
            if(trashSpeedLevel > TRASH_SPEED_LEVEL) trashSpeedLevel = 1;
            // todo : 여기서 단계 플래그 만들어서 적용하기
            moveTrash(dt, 'ancientBranchS', 0.08);
            moveTrash(dt, 'ancientBranchM', 0.15); // 0.08내외로 속도 조정하기

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
            break;
        case STATE_JUDGE: // 결과 판정
            if(_live == 1)
            {
                ScriptApp.showCenterLabel(`${lastSurvivor.name} is last suvivor`);
            }
            else if(_live == 0)
            {
                ScriptApp.showCenterLabel(`There are no survivors.`);
            }
            else
            {
                ScriptApp.showCenterLabel(`Final survivors : ` + _live);
            }

            if(_stateTimer >= 5)
            {
                startState(STATE_END);
            }
            break;
        case STATE_END:
            break;
    }
});