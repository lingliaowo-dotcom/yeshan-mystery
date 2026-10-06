/**
 * 云岭迷踪 · 番外篇 2011 · 他没有转学
 * 玩家扮演周小树，亲手藏下正传中出现的所有线索
 */

const $ = id => document.getElementById(id);
const captionEl = $('caption');
let capTimer = null;

function caption(text) {
    clearInterval(capTimer);
    captionEl.textContent = '';
    let i = 0;
    capTimer = setInterval(() => {
        captionEl.textContent = text.slice(0, ++i);
        if (i >= text.length) clearInterval(capTimer);
    }, 38);
}

// 连续多段旁白
function captionSeq(texts, idx = 0, onDone) {
    if (idx >= texts.length) { if (onDone) onDone(); return; }
    caption(texts[idx]);
    setTimeout(() => captionSeq(texts, idx + 1, onDone), texts[idx].length * 38 + 1500);
}

// ===== 状态 =====
const State = {
    witnessed: false,
    compass: false,
    marble: false,
    nameScratched: false,
    letterDone: false,
    tinDone: false,
    engraved: false,
    xiaomanRead: false
};

// ===== 场景切换 =====
let currentStage = null;
function showStage(id) {
    if (currentStage) currentStage.classList.remove('active');
    const st = $(id);
    st.classList.remove('hidden');
    st.classList.add('active');
    currentStage = st;
}

// ===== 物品栏 =====
function addItem(id, name, desc) {
    if ($('inv-' + id)) return;
    const chip = document.createElement('div');
    chip.className = 'inv-item';
    chip.id = 'inv-' + id;
    chip.textContent = name;
    chip.addEventListener('click', () => caption(desc));
    $('inventory').appendChild(chip);
}
function removeItem(id) {
    const c = $('inv-' + id);
    if (c) c.remove();
}

function openModal(id) { $(id).classList.remove('hidden'); }
function closeModal(id) { $(id).classList.add('hidden'); }

function refreshClassroomNav() {
    if (State.witnessed && State.nameScratched && State.compass && State.marble)
        $('hs-to-corridor').classList.remove('hidden');
}

/* ===== 背景物：日记本（5 页） ===== */
const DIARY = [
    {
        date: '11月3日 · 阴',
        body: '爸妈打电话到村长家了。奶奶说，厂里忙，今年过年又不回来了。\n我把听筒贴在耳朵上，妈妈在那头哭。我说我没事，这次考试考了第三名。\n其实是第二名——可我怕他们追问奖状的事。'
    },
    {
        date: '11月7日 · 晴',
        body: '今天学校来了几个穿蓝衣服的叔叔，村主任陪着，在围墙根拉尺子，说是“加固围墙”。\n校长站在办公室门口看了很久，一句话没说。\n我头一回觉得，校长好像一下子老了。'
    },
    {
        date: '11月9日 · 小雨',
        body: '林小满三天没来上课了。老师说他转学去了县城。\n可昨天他还跟我借半块橡皮，说今天还。他的铅笔盒还在课桌里，里面有半块没吃完的水果糖。\n放学我去问校长。校长看了我很久很久，只说了一句：\n小树，以后放学早点回家，别留在学校。'
    },
    {
        date: '11月10日 · 夜',
        body: '昨晚我忘带作业本，回学校拿。\n三楼黑着灯。我看见几个蓝衣服抬着个长条的东西下楼，很沉。\n我躲在宣传栏后面，大气都不敢出。他们经过的时候，我闻见一股……\n土腥味。湿的。'
    },
    {
        date: '11月11日 · 周五（今天）',
        body: '今天轮到我值日，全班都走了。\n我把日记本带上了，摊在窗台上。\n不知道为什么，心里一直慌。窗外的天，快黑了。'
    }
];

let diaryN = 0;
function renderDiary() {
    $('diary-date').textContent = DIARY[diaryN].date;
    $('diary-body').textContent = DIARY[diaryN].body;
    $('diary-page').textContent = `${diaryN + 1} / ${DIARY.length}`;
    $('diary-prev').disabled = diaryN === 0;
    $('diary-next').disabled = diaryN === DIARY.length - 1;
}
$('hs-diary').addEventListener('click', () => {
    diaryN = 0;
    renderDiary();
    openModal('modal-diary');
});
$('diary-prev').addEventListener('click', () => { if (diaryN > 0) { diaryN--; renderDiary(); } });
$('diary-next').addEventListener('click', () => { if (diaryN < DIARY.length - 1) { diaryN++; renderDiary(); } });
$('diary-close').addEventListener('click', () => closeModal('modal-diary'));

/* ===== 背景物：书包·全家福 ===== */
$('hs-schoolbag').addEventListener('click', () => openModal('modal-schoolbag'));
$('schoolbag-close').addEventListener('click', () => closeModal('modal-schoolbag'));

/* ===== 支线：小满留下的蜡笔画与字条 ===== */
$('hs-xiaoman-desk').addEventListener('click', () => openModal('modal-xiaoman'));
$('xiaoman-close').addEventListener('click', () => {
    closeModal('modal-xiaoman');
    if (!State.xiaomanRead) {
        State.xiaomanRead = true;
        caption('纸角被攥得皱皱巴巴的。他走之前，就已经知道了……');
    }
});

/* ===== 谜题1：窗外目击 ===== */
$('hs-window-view').addEventListener('click', () => openModal('modal-view'));
document.querySelectorAll('#modal-view .modal-close').forEach(b =>
    b.addEventListener('click', () => {
        closeModal('modal-view');
        State.witnessed = true;
        caption('他们在第三棵槐树下埋东西……不能让他们知道我看见了。得把话留下来，留给以后能找到的人。');
        refreshClassroomNav();
    }));

/* ===== 谜题2：课桌拿圆规、弹珠 ===== */
$('hs-desk').addEventListener('click', () => openModal('modal-desk'));
$('desk-close').addEventListener('click', () => {
    closeModal('modal-desk');
    State.compass = true;
    State.marble = true;
    addItem('compass', '铁圆规', '尖尖的铁圆规，能在木头和玻璃上刻字。');
    addItem('marble', '红纹玻璃弹珠', '我最宝贝的弹珠，里面有一圈红纹，像一滴凝固的血。');
    caption('圆规和弹珠，都收进口袋里。');
    $('my-row').classList.add('scratchable');
    refreshClassroomNav();
});

/* ===== 谜题3：值日表刮名字 ===== */
$('hs-roster').addEventListener('click', () => {
    if (!State.compass) { caption('用指甲刮不掉……得先找个尖锐的东西。'); return; }
    openModal('modal-roster');
});

let scratchN = 0;
$('my-row').addEventListener('click', () => {
    if (State.nameScratched) return;
    scratchN++;
    if (scratchN >= 4) {
        $('my-row').innerHTML = '周<span class="gone">小树</span>　擦黑板';
        $('my-row').classList.add('done');
        State.nameScratched = true;
        caption('"小树"两个字刮花了，只剩一个"周"。他们会以为我转学了——可认识我的人，还能顺着找。');
        refreshClassroomNav();
    } else {
        caption('再用力刮几下……（' + scratchN + '/4）');
    }
});
$('roster-close').addEventListener('click', () => closeModal('modal-roster'));

/* ===== 走廊潜行 ===== */
let beamTimer = null;
let stealthProgress = 0;
let returnTrip = false;
const PLAYER_X = [6, 40, 74];

function startStealth(isReturn) {
    returnTrip = isReturn;
    stealthProgress = 0;
    $('player-mark').style.left = PLAYER_X[0] + '%';
    $('stealth-tip').textContent = isReturn
        ? '摸黑回三楼。等光圈离开，再移动。'
        : '灯在来回晃。趁光圈离开你这侧，再移动。';
    showStage('stage-stealth');
    let beamX = 0, dir = 1;
    clearInterval(beamTimer);
    beamTimer = setInterval(() => {
        beamX += dir * 0.9;
        if (beamX > 66) { beamX = 66; dir = -1; }
        if (beamX < 0) { beamX = 0; dir = 1; }
        $('beam').style.left = beamX + '%';
        $('beam').dataset.center = String(beamX + 17);
    }, 30);
}

$('btn-move').addEventListener('click', () => {
    const target = PLAYER_X[stealthProgress + 1];
    const beamCenter = parseFloat($('beam').dataset.center || 20);
    if (Math.abs(beamCenter - target) < 20) {
        stealthProgress = 0;
        $('player-mark').style.left = PLAYER_X[0] + '%';
        caption('光扫过来了！赶紧蹲下，贴住墙……');
        return;
    }
    stealthProgress++;
    $('player-mark').style.left = PLAYER_X[stealthProgress] + '%';
    if (stealthProgress >= 3) {
        clearInterval(beamTimer);
        caption(returnTrip ? '到了。三楼西侧，最末一扇窗。' : '楼梯口右拐，仓库门虚掩着。我溜了进去。');
        setTimeout(() => showStage(returnTrip ? 'stage-window-old' : 'stage-storage-old'), 700);
    }
});

$('hs-to-corridor').addEventListener('click', () => startStealth(false));

/* ===== 谜题4：拼"检讨书" ===== */
const EXPECTED = [0, 1, 2, 3, 4, 5, 8, 9, 10, 11, 12];
let wordProgress = 0;
const tiles = document.querySelectorAll('#word-tiles span');
tiles.forEach((sp, idx) => {
    sp.addEventListener('click', () => {
        if (State.letterDone) return;
        if (idx === EXPECTED[wordProgress]) {
            sp.classList.add('used');
            $('sentence-line').textContent += sp.textContent;
            wordProgress++;
            if (wordProgress >= EXPECTED.length) {
                State.letterDone = true;
                caption('折好，塞进生锈铁盒的最底下。看到的人会懂——我不是在认错，我是在留话。');
                refreshStorageNav();
            }
        } else {
            $('sentence-line').classList.remove('shake');
            void $('sentence-line').offsetWidth;
            $('sentence-line').classList.add('shake');
            tiles.forEach(t => t.classList.remove('used'));
            $('sentence-line').textContent = '';
            wordProgress = 0;
        }
    });
});
$('hs-ironbox').addEventListener('click', () => {
    if (State.letterDone) { caption('铁盒最底下，检讨书压得平平整整。'); return; }
    openModal('modal-ironbox');
});
$('ironbox-close').addEventListener('click', () => {
    closeModal('modal-ironbox');
    if (!State.letterDone) caption('话还没写完，不能走。');
});

/* ===== 谜题5：铁罐刻字、藏弹珠 ===== */
let tinN = 0;
$('hs-floorcrack').addEventListener('click', () => {
    if (State.tinDone) { caption('铁罐已经丢下去了。不知道以后谁会捡到。'); return; }
    if (!State.marble) { caption('空着手来这里干什么。'); return; }
    openModal('modal-crack');
});
$('tin-scratch').addEventListener('click', () => {
    tinN++;
    if (tinN >= 3) {
        $('tin-char').textContent = '树';
        $('btn-drop-tin').disabled = false;
        caption('罐底刻好了一个"树"字。');
    } else {
        caption('再刻深一点……（' + tinN + '/3）');
    }
});
$('btn-drop-tin').addEventListener('click', () => {
    State.tinDone = true;
    State.marble = false;
    removeItem('marble');
    closeModal('modal-crack');
    caption('铁罐顺着裂缝滚下去，在黑暗里叮当响了好几声。弹珠在里面，瓶底有我的名字。');
    refreshStorageNav();
});
$('crack-close').addEventListener('click', () => closeModal('modal-crack'));

function refreshStorageNav() {
    if (State.letterDone && State.tinDone)
        $('hs-to-third-floor').classList.remove('hidden');
}
$('hs-to-third-floor').addEventListener('click', () => startStealth(true));

/* ===== 谜题6：窗玻璃刻字 ===== */
const ENGRAVE = ['他', '没', '有', '转', '学', '。'];
let engraveN = 0;
$('hs-engrave').addEventListener('click', () => {
    if (State.engraved) return;
    caption('圆规尖在玻璃上吱呀作响——刻下：「' + ENGRAVE.slice(0, ++engraveN).join('') + '」');
    if (engraveN >= ENGRAVE.length) {
        State.engraved = true;
        setTimeout(() => {
            caption('最后歪歪扭扭补上日期：—— 2011.11');
            setTimeout(() => captionSeq([
                '小满，你留下的话，我看到了。',
                '你没有转学。我也不打算“转学”。',
                '这些字会记得。弹珠会记得。总会有一天，有人顺着它们，找到这里。'
            ], 0, finale), 2400);
        }, 1400);
    }
});

/* ===== 奶奶视角叙述卡 ===== */
const GRANNY_LINES = [
    '那天晚上，奶奶把红薯在锅里热了三遍。',
    '她拄着拐杖走到村口，在老槐树下站到后半夜。',
    '风把她的白头巾吹落在地上，她都没有发觉。',
    '后来的很多年，奶奶每天都要往村口望几回。',
    '她总跟小卖部老板娘念叨：我家树儿胆子小，走不远的。',
    '他会回来的。'
];

function typeInto(el, text, onDone) {
    el.textContent = '';
    let i = 0;
    const t = setInterval(() => {
        el.textContent = text.slice(0, ++i);
        if (i >= text.length) { clearInterval(t); onDone(); }
    }, 60);
}

function showGrannyCard(idx = 0) {
    if (idx === 0) $('granny-card').classList.remove('hidden');
    typeInto($('granny-text'), GRANNY_LINES[idx], () => {
        setTimeout(() => {
            if (idx < GRANNY_LINES.length - 1) {
                showGrannyCard(idx + 1);
            } else {
                setTimeout(() => {
                    $('granny-card').classList.add('hidden');
                    $('coda-card').classList.remove('hidden');
                }, 2800);
            }
        }, 2000);
    });
}

/* ===== 结局 ===== */
function finale() {
    $('hs-engrave').classList.add('hidden');
    caption('楼下传来脚步声。一级，一级，有人在上楼。');
    setTimeout(() => {
        caption('往楼下跑——后门，快——');
        setTimeout(() => {
            showStage('stage-wall-end');
            setTimeout(() => caption('墙根。第三棵槐树。树下的土是新的。他们……'), 1200);
            setTimeout(flashFrames, 3200);
        }, 1600);
    }, 2200);
}

function flashFrames() {
    const f = $('flash-frame');
    let n = 0;
    f.style.display = 'block';
    const timer = setInterval(() => {
        f.style.background = n % 2 === 0 ? '#000' : '#0a0a0a';
        f.querySelector('img').style.visibility = n % 2 === 0 ? 'visible' : 'hidden';
        n++;
        if (n >= 6) {
            clearInterval(timer);
            f.style.display = 'none';
            setTimeout(showGrannyCard, 900);
        }
    }, 180);
}

/* ===== 启动 ===== */
document.addEventListener('DOMContentLoaded', () => {
    $('title-card').addEventListener('click', function h() {
        this.classList.add('hide');
        showStage('stage-classroom');
        captionSeq([
            '2011 年 11 月，周五。我叫周小树，云岭小学六年级——全班最矮的那个。',
            '爸妈在广东的厂里打工，三年没回来了。我跟奶奶过，家里还有一只叫大黄的猫。',
            '今天轮到我值日。同学们都走了，教室空得能听见后山的风。窗外的天，快黑了。'
        ]);
        this.removeEventListener('click', h);
    });
});
