/**
 * 邺山迷踪 · 第一章 回村
 */

// ===== 游戏状态 =====
const State = {
    flashlight: false,
    key: false,
    photo: false,
    note: false,
    unlocked: false,
    hoopChecked: false,
    brickFound: false,
    wipes: 0,
    ending: false
};

// ===== 物品数据 =====
const ITEMS = {
    flashlight: { name: '老式手电筒', desc: '老板娘说，阿杰也买过一支一模一样的。按下开关，光柱昏黄，但还算亮。' },
    key: { name: '生锈的侧门钥匙', desc: '门卫室窗台底下压着的钥匙，挂着褪色的胶牌：「教学楼·侧门」。' },
    photo: { name: '半张合影', desc: '半张 1998 级 2 班的毕业合影。照片从中间被撕开——角落里那个瘦小的身影，只剩下半边肩膀。' },
    note: { name: '防水袋里的字条', desc: '「砖我放回去了。看到这张字条的人——别信村里穿蓝衣服的。三楼见。——杰」' }
};

// ===== 工具 =====
const $ = id => document.getElementById(id);
const captionEl = $('caption');
let capTimer = null;

function caption(text, hold = 0) {
    clearInterval(capTimer);
    captionEl.textContent = '';
    let i = 0;
    capTimer = setInterval(() => {
        captionEl.textContent = text.slice(0, ++i);
        if (i >= text.length) {
            clearInterval(capTimer);
            if (hold > 0) setTimeout(() => { captionEl.textContent = ''; }, hold);
        }
    }, 38);
}

// ===== 场景切换 =====
let currentStage = null;
function showStage(id) {
    if (currentStage) currentStage.classList.remove('active');
    const st = $(id);
    st.classList.add('active');
    currentStage = st;
}

// ===== 物品栏 =====
function addItem(id) {
    if (State[id]) return;
    State[id] = true;
    const chip = document.createElement('div');
    chip.className = 'inv-item';
    chip.textContent = ITEMS[id].name;
    chip.addEventListener('click', () => openItem(id));
    $('inventory').appendChild(chip);
}

function openItem(id) {
    $('item-name').textContent = ITEMS[id].name;
    $('item-desc').textContent = ITEMS[id].desc;
    $('item-modal').classList.add('open');
}

// ===== 弹窗 =====
function openModal(id) { $(id).classList.add('open'); }
function closeModal(id) { $(id).classList.remove('open'); }

// ===== 对话系统 =====
const DIALOGS = {
    greet: {
        sp: '小卖部老板娘',
        tx: '老板娘撩起门帘，上下打量你："后生，面生得很。走亲戚，还是路过？"',
        choices: [
            { t: '我找人。（递出阿杰的照片）', next: 'photo' },
            { t: '随便看看。（离开）', cap: '老板娘收回目光，继续拨她的算盘。' }
        ]
    },
    photo: {
        sp: '小卖部老板娘',
        tx: '她眯眼看了半天，忽然一拍柜台："哦！这个后生我记得——大半个月前，他在我这儿买了手电、电池，还有三天的水和干粮。"',
        choices: [
            { t: '他还说过什么？', next: 'said' },
            { t: '他后来去了哪儿？', next: 'went' }
        ]
    },
    said: {
        sp: '小卖部老板娘',
        tx: '"他问我，老学校的钥匙还在不在老地方。临走还念叨：三楼，西数第三扇窗……"她顿了顿，"后生，你脸色不太好。"',
        choices: [
            { t: '"老地方"是哪儿？', next: 'place' },
            { t: '（买一只手电筒 ¥10）', next: 'buy' },
            { t: '谢谢老板娘。（离开）', cap: '老板娘欲言又止，最终只是叹了口气。' }
        ]
    },
    went: {
        sp: '小卖部老板娘',
        tx: '"还能去哪儿，奔老学校去了呗。打那天起——再没人见过他。"她压低声音，"后生，听我一句劝，那地方，不干净。"',
        choices: [
            { t: '他还说过什么？', next: 'said' },
            { t: '（买一只手电筒 ¥10）', next: 'buy' },
            { t: '（离开）', cap: '风穿过货架，挂着的塑料袋哗哗作响。' }
        ]
    },
    place: {
        sp: '小卖部老板娘',
        tx: '"老辈人都晓得：门卫室的窗台底下，压着一把备用钥匙。十几年喽……你自己去找找吧。"',
        choices: [
            { t: '（买一只手电筒 ¥10）', next: 'buy' },
            { t: '多谢。（离开）', cap: '门卫室……窗台底下。你记住了。' }
        ]
    },
    buy: {
        sp: '小卖部老板娘',
        tx: State.flashlight
            ? '"你不是已经有一支了？"她狐疑地看着你。'
            : '"十块。"她从货架上取下一支手电，"喏——和你朋友那支，同款。"',
        choices: [
            { t: '（离开）', cap: State.flashlight ? '手电筒沉甸甸的，像一句没说出口的提醒。' : '' }
        ]
    }
};

function openDialog(nodeId) {
    const node = DIALOGS[nodeId];
    $('dialog-speaker').textContent = node.sp;
    const textEl = $('dialog-text');
    const choicesEl = $('dialog-choices');
    choicesEl.innerHTML = '';
    openModal('dialog-modal');

    // 打字机
    textEl.textContent = '';
    let i = 0;
    const timer = setInterval(() => {
        textEl.textContent = node.tx.slice(0, ++i);
        if (i >= node.tx.length) {
            clearInterval(timer);
            renderChoices();
        }
    }, 34);

    function renderChoices() {
        node.choices.forEach(c => {
            const btn = document.createElement('button');
            btn.textContent = c.t;
            btn.addEventListener('click', () => {
                if (nodeId === 'buy' && !State.flashlight) addItem('flashlight');
                if (c.next) {
                    openDialog(c.next);
                } else {
                    closeModal('dialog-modal');
                    if (c.cap) caption(c.cap);
                }
            });
            choicesEl.appendChild(btn);
        });
    }
}

// ===== 密码锁 =====
const LOCK_CODE = '2013';
let lockSuccess = false;

function initLock() {
    const digits = document.querySelectorAll('.lock-digit');
    digits.forEach((d, idx) => {
        d.addEventListener('input', () => {
            d.value = d.value.replace(/\D/g, '');
            if (d.value && idx < digits.length - 1) digits[idx + 1].focus();
        });
        d.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !d.value && idx > 0) digits[idx - 1].focus();
        });
    });

    $('lock-confirm').addEventListener('click', () => {
        const val = [...digits].map(d => d.value).join('');
        if (val === LOCK_CODE) {
            lockSuccess = true;
            closeModal('lock-modal');
            State.unlocked = true;
            $('hs-lock').classList.add('hidden');
            $('hs-enter-gate').classList.remove('hidden');
            caption('咔哒——锁开了。铁门在刺耳的摩擦声中，缓缓让开一条缝。');
        } else {
            $('lock-error').classList.add('show');
            document.querySelector('.lock-box').classList.add('shake');
            setTimeout(() => {
                $('lock-error').classList.remove('show');
                document.querySelector('.lock-box').classList.remove('shake');
            }, 1600);
            digits.forEach(d => d.value = '');
            digits[0].focus();
        }
    });

    $('lock-cancel').addEventListener('click', () => closeModal('lock-modal'));
}

// ===== 走廊手电 =====
function initFlashlight() {
    const corridor = $('stage-corridor');
    const mask = $('dark-mask');
    function move(x, y) {
        const r = corridor.getBoundingClientRect();
        mask.style.setProperty('--mx', ((x - r.left) / r.width * 100) + '%');
        mask.style.setProperty('--my', ((y - r.top) / r.height * 100) + '%');
    }
    corridor.addEventListener('mousemove', e => move(e.clientX, e.clientY));
    corridor.addEventListener('touchmove', e => move(e.touches[0].clientX, e.touches[0].clientY));
}

// ===== 三楼西窗 =====
function initWindow() {
    const dust = $('dust-layer');
    $('hs-window').addEventListener('click', () => {
        if (State.ending) return;
        State.wipes++;
        dust.style.opacity = String(1 - State.wipes / 3);

        if (State.wipes === 1) {
            caption('玻璃上糊着厚厚的灰。你用袖口抹开一小块——');
        } else if (State.wipes === 2) {
            caption('继续擦……灰层底下，好像有什么刻痕。');
        } else if (State.wipes === 3) {
            State.ending = true;
            $('hs-window').classList.add('hidden');
            $('hs-back-corridor').classList.add('hidden');
            $('carved-text').classList.add('show');
            caption('灰尘散尽，玻璃内侧，一行深深浅浅的刻字——', 2600);
            setTimeout(runEndingSequence, 4200);
        }
    });
}

// ===== 结局序列 =====
function runEndingSequence() {
    const blackout = $('blackout');
    const flash = $('rooftop-flash');

    // 脚步声
    blackout.innerHTML = '<p>身后，空无一人的走廊里——<br>响起了脚步声。</p>';
    blackout.classList.add('show');

    setTimeout(() => {
        blackout.classList.remove('show');
        // 蓝衣人影闪帧
        flash.classList.add('show');
        setTimeout(() => {
            flash.classList.remove('show');
            blackout.innerHTML = '<p>对面楼顶，一个穿蓝衣服的人影——<br>一闪而过。</p>';
            blackout.classList.add('show');
            setTimeout(() => {
                blackout.classList.remove('show');
                $('end-card').classList.add('show');
            }, 3600);
        }, 1200);
    }, 3200);
}

// ===== 热点绑定 =====
function initHotspots() {
    // --- 村口 ---
    $('hs-notice').addEventListener('click', () => openModal('notice-modal'));
    $('notice-close').addEventListener('click', () => {
        closeModal('notice-modal');
        if (!State.noticeRead) {
            State.noticeRead = true;
            caption('公告栏上，拆除公告旁边，贴着阿杰的寻人启事——那是你上周来贴的。');
        }
    });
    $('hs-store').addEventListener('click', () => openDialog('greet'));
    $('hs-to-school').addEventListener('click', () => {
        showStage('stage-gate');
        caption('沿着石板路往坡上走。雾气里，锈铁门静静立着，像已经等了你很久。');
    });

    // --- 大门 ---
    $('hs-guardhouse').addEventListener('click', () => {
        if (!State.key) {
            addItem('key');
            caption('门卫室的窗户破了。你伸手探向窗台底下——压着一把锈钥匙。');
        } else {
            caption('门卫室里空空如也。墙上的挂钟，停在三点零七。');
        }
    });
    $('hs-lock').addEventListener('click', () => {
        if (!State.unlocked) openModal('lock-modal');
    });
    $('hs-enter-gate').addEventListener('click', () => {
        showStage('stage-yard');
        caption('操场比记忆里小了很多。杂草没过脚踝，篮球架还立在那儿。');
    });
    $('hs-back-village').addEventListener('click', () => {
        showStage('stage-village');
        caption('');
    });

    // --- 操场 ---
    $('hs-hoop').addEventListener('click', () => {
        if (!State.hoopChecked) {
            State.hoopChecked = true;
            $('hs-brick').classList.remove('hidden');
            caption('篮球架锈得厉害。你蹲下身——从左数第三块砖，砖缝里的土，是新的。');
        } else if (!State.brickFound) {
            caption('第三块砖……最近被人动过。');
        } else {
            caption('篮球架静静立着，吱呀作响，像什么都没发生过。');
        }
    });
    $('hs-brick').addEventListener('click', () => {
        if (State.brickFound) return;
        State.brickFound = true;
        $('hs-brick').classList.add('hidden');
        addItem('photo');
        addItem('note');
        caption('砖下压着一个防水袋：半张老照片，一张字条。——是阿杰的字。');
    });
    $('hs-building').addEventListener('click', () => {
        if (!State.key) {
            caption('侧门挂着铁锁。这附近……也许有备用钥匙。');
        } else if (!State.flashlight) {
            caption('推开门缝，里面黑得像一口井。我需要一只手电筒。');
        } else {
            showStage('stage-corridor');
            caption('手电的光柱切开黑暗。墙皮剥落的味道，混着旧课本的霉味。');
        }
    });
    $('hs-back-gate').addEventListener('click', () => {
        showStage('stage-gate');
        caption('');
    });

    // --- 走廊 ---
    $('hs-board').addEventListener('click', () => {
        caption('「1998级2班·值日表」。最后一个名字被人用指甲抠掉了，只剩一个「周」字。');
    });
    $('hs-classroom').addEventListener('click', () => {
        caption('教室门被桌椅从里面顶死了。门缝里，飘出旧书本的霉味。');
    });
    $('hs-stairs').addEventListener('click', () => {
        showStage('stage-window');
        caption('你扶着墙，一级，一级……三楼。西数，第三扇窗。');
    });
    $('hs-back-yard').addEventListener('click', () => {
        showStage('stage-yard');
        caption('');
    });

    // --- 三楼回走廊 ---
    $('hs-back-corridor').addEventListener('click', () => {
        showStage('stage-corridor');
        caption('');
    });

    // --- 物品弹窗关闭 ---
    $('item-close').addEventListener('click', () => closeModal('item-modal'));
}

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', () => {
    initHotspots();
    initLock();
    initFlashlight();
    initWindow();

    // 标题卡 → 村口
    setTimeout(() => {
        $('title-card').classList.add('hide');
        showStage('stage-village');
        setTimeout(() => {
            caption('四个小时的长途车。山越来越近——邺山村，我回来了。阿杰，你说的"三楼窗户上有答案"，我来了。');
        }, 1200);
    }, 3000);

    document.addEventListener('contextmenu', e => e.preventDefault());
});
