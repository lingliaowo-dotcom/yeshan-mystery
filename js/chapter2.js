/**
 * 邺山迷踪 · 第二章 村夜
 */

// ===== 游戏状态 =====
const State = {
    skey: false,        // 仓库钥匙
    crowbar: false,     // 撬棍
    letter: false,      // 检讨书
    notebook: false,    // 阿杰的笔记本
    marble: false,      // 玻璃弹珠
    trapOpen: false,
    chase: false
};

// ===== 物品数据 =====
const ITEMS = {
    skey: { name: '仓库钥匙', desc: '老校长给的黄铜钥匙，木牌上刻着「仓库」两个字。' },
    crowbar: { name: '撬棍', desc: '仓库墙角摸到的撬棍，一头扁，带着暗红色的锈。但愿那只是锈。' },
    letter: { name: '一叠旧纸', desc: '铁盒里整整齐齐码着纸。最上面是一页 2011 年的检讨书，笔迹稚嫩：「我不该看见。我不该说。」——落款：周小树。' },
    notebook: { name: '阿杰的笔记本', desc: '在背包夹层里。最后一页写着：「仓库的地板下面是后砌的。小树当年看见的，就在这下面。蓝衣服每晚都来。如果我出事——别信任何人。」' },
    marble: { name: '玻璃弹珠', desc: '小铁罐里有十几颗弹珠。最旧的那颗，里面有一道血丝般的红纹。' }
};

// ===== 工具 =====
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

let currentStage = null;
function showStage(id) {
    if (currentStage) currentStage.classList.remove('active');
    const st = $(id);
    st.classList.add('active');
    currentStage = st;
}

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

function openModal(id) { $(id).classList.add('open'); }
function closeModal(id) { $(id).classList.remove('open'); }

// ===== 对话：老校长 =====
const DIALOGS = {
    greet: {
        sp: '老校长',
        tx: '昏黄的油灯下，老人抬起浑浊的眼睛："后生……你就是白天在打听学校的那个人吧。"',
        choices: [
            { t: '我在找我的朋友，阿杰。', next: 'ajie' },
            { t: '您……知道"小树"的事？', next: 'shu' }
        ]
    },
    ajie: {
        sp: '老校长',
        tx: '"那后生有胆量，夜里进了学校——就没再出来。"老人摇摇头，"我劝过他。这村子，夜里不归活人管。"',
        choices: [
            { t: '什么叫"不归活人管"？', next: 'blue' },
            { t: '求您帮帮我。', next: 'help' }
        ]
    },
    shu: {
        sp: '老校长',
        tx: '老人的手猛地一抖，灯花"啪"地爆了。"……十五年了，没人敢提这个名字。"他盯着你，"那孩子，没有转学。他看见了不该看的东西。"',
        choices: [
            { t: '他看见了什么？', next: 'see' },
            { t: '求您帮帮我。', next: 'help' }
        ]
    },
    see: {
        sp: '老校长',
        tx: '"2011 年冬天，学校翻修院墙。那孩子放学晚，看见几个工人在墙根底下……埋东西。"老人闭上眼，"第二天，全村就都说他转学了。"',
        choices: [
            { t: '求您帮帮我。', next: 'help' }
        ]
    },
    blue: {
        sp: '老校长',
        tx: '"巡逻的、看场的，穿蓝衣服的……白天，他们是村主任家的人。"老人吹了吹灯芯，火苗缩成一点，"至于夜里——别让他们看见你。"',
        choices: [
            { t: '求您帮帮我。', next: 'help' }
        ]
    },
    help: {
        sp: '老校长',
        tx: '老人沉默了很久，从怀里摸出一把黄铜钥匙："学校仓库里，堆着当年没清走的东西。要去，就趁后半夜。天亮前——一定要回来。"',
        choices: [
            { t: '（接过仓库钥匙）', cap: '钥匙冰凉。老人的手，比钥匙更凉。' }
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

    textEl.textContent = '';
    let i = 0;
    const timer = setInterval(() => {
        textEl.textContent = node.tx.slice(0, ++i);
        if (i >= node.tx.length) {
            clearInterval(timer);
            node.choices.forEach(c => {
                const btn = document.createElement('button');
                btn.textContent = c.t;
                btn.addEventListener('click', () => {
                    if (nodeId === 'help' && !State.skey) {
                        addItem('skey');
                        $('hs-to-gate-night').classList.remove('hidden');
                    }
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
    }, 34);
}

// ===== 手电 =====
function initFlashlight(stageId, maskId) {
    const stage = $(stageId), mask = $(maskId);
    function move(x, y) {
        const r = stage.getBoundingClientRect();
        mask.style.setProperty('--mx', ((x - r.left) / r.width * 100) + '%');
        mask.style.setProperty('--my', ((y - r.top) / r.height * 100) + '%');
    }
    stage.addEventListener('mousemove', e => move(e.clientX, e.clientY));
    stage.addEventListener('touchmove', e => move(e.touches[0].clientX, e.touches[0].clientY));
}

// ===== 追逐桥段 =====
function startChase() {
    if (State.chase) return;
    State.chase = true;
    const blackout = $('blackout');
    const flash = $('chase-flash');

    blackout.innerHTML = '<p>头顶的地板——<br>传来了脚步声。</p>';
    blackout.classList.add('show');

    setTimeout(() => {
        blackout.innerHTML = '<p>手电光里，地下室的楼梯口，<br>立着一团蓝色的影子。</p>';
    }, 2800);

    setTimeout(() => {
        blackout.classList.remove('show');
        flash.classList.add('show'); // 跑！
        setTimeout(() => flash.classList.remove('show'), 900);
    }, 5200);

    setTimeout(() => {
        blackout.innerHTML = '<p>跑——！</p>';
        blackout.classList.add('show');
    }, 6200);

    setTimeout(() => {
        flash.classList.add('show');
        setTimeout(() => flash.classList.remove('show'), 700);
    }, 7800);

    setTimeout(() => {
        blackout.innerHTML = '<p>你撞开铁门，冲进夜雾里。<br>身后的脚步声，停了。<br><br>村口的方向，一盏盏灯，正在次第亮起。</p>';
    }, 9000);

    setTimeout(() => {
        blackout.classList.remove('show');
        $('end-card').classList.add('show');
    }, 13500);
}

// ===== 热点绑定 =====
function initHotspots() {
    // --- 村中夜路 ---
    $('hs-shop-night').addEventListener('click', () => {
        caption('小卖部锁着门。门板缝里，透出一点算盘珠子轻响——又停了。');
    });
    $('hs-elder-house').addEventListener('click', () => {
        showStage('stage-room');
        caption('全村只有这扇窗还亮着。你抬手敲门，门"吱呀"一声，自己开了。');
    });
    $('hs-to-gate-night').addEventListener('click', () => {
        showStage('stage-gate-night');
        caption('夜雾浓得化不开。铁门白天被你撬开的缝，像一只没有闭上的眼睛。');
    });

    // --- 老校长家 ---
    $('hs-elder').addEventListener('click', () => openDialog('greet'));
    $('hs-back-night').addEventListener('click', () => {
        showStage('stage-night-village');
        caption('');
    });

    // --- 夜里的学校大门 ---
    $('hs-gate-night').addEventListener('click', () => {
        showStage('stage-storage');
        caption('你侧身挤进铁门。操场左手边，低矮的仓库像一口趴着的水缸。');
    });
    $('hs-back-village-night').addEventListener('click', () => {
        showStage('stage-night-village');
        caption('');
    });

    // --- 仓库 ---
    $('hs-crowbar').addEventListener('click', () => {
        if (!State.crowbar) {
            addItem('crowbar');
            caption('墙角斜着一根撬棍，入手沉得意外。');
        } else {
            caption('墙角的灰印子，是撬棍留下的。');
        }
    });
    $('hs-ironbox').addEventListener('click', () => {
        if (!State.letter) {
            addItem('letter');
            caption('铁盒没锁。最上面那页检讨书的落款是：周小树，2011年11月。');
        } else {
            caption('铁盒空了。那些纸，此刻贴着你的胸口。');
        }
    });
    $('hs-trapdoor').addEventListener('click', () => {
        if (!State.crowbar) {
            caption('地板缝里透着凉气。边缘被撬过很多次——徒手，掰不开。');
        } else if (!State.trapOpen) {
            State.trapOpen = true;
            caption('撬棍插进缝隙，"咔"的一声，一整块地板翻了开来。下面，有台阶。');
            setTimeout(() => {
                showStage('stage-basement');
                caption('潮气混着土腥涌上来。你打开手电，一步一步走下去。');
            }, 2600);
        } else {
            showStage('stage-basement');
            caption('');
        }
    });
    $('hs-back-gate-night').addEventListener('click', () => {
        showStage('stage-gate-night');
        caption('');
    });

    // --- 地下室 ---
    $('hs-backpack').addEventListener('click', () => {
        if (!State.notebook) {
            addItem('notebook');
            caption('黑色双肩包——是阿杰的！夹层里，摸到一个硬壳笔记本。');
            setTimeout(startChase, 3000);
        } else {
            caption('背包里剩下的只有几瓶没开封的水，和一包压碎的饼干。');
        }
    });
    $('hs-wall-marks').addEventListener('click', () => {
        caption('手电扫过墙面——密密麻麻的"正"字，一笔一划，刻进砖里。有人在数日子。');
    });
    $('hs-jar').addEventListener('click', () => {
        if (!State.marble) {
            addItem('marble');
            caption('铁罐锈得厉害。晃了晃，里面是弹珠相撞的脆响。');
        } else {
            caption('空铁罐底上，歪歪扭扭刻着一个"树"字。');
        }
    });
    $('hs-back-storage').addEventListener('click', () => {
        if (State.chase) { caption('脚步声还在头顶。不能上去。'); return; }
        showStage('stage-storage');
        caption('');
    });

    $('item-close').addEventListener('click', () => closeModal('item-modal'));
}

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', () => {
    initHotspots();
    initFlashlight('stage-storage', 'mask-storage');
    initFlashlight('stage-basement', 'mask-basement');

    setTimeout(() => {
        $('title-card').classList.add('hide');
        showStage('stage-night-village');
        setTimeout(() => {
            caption('你几乎是退着离开教学楼的。等你绕回村里，天已经黑透——入夜，村民们早早熄了灯，只有村口那盏路灯，一闪，一闪。');
        }, 1200);
    }, 3000);

    document.addEventListener('contextmenu', e => e.preventDefault());
});
