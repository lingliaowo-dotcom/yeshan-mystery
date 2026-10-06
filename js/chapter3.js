/**
 * 云岭迷踪 · 第三章 墙里的人（最终章）
 */

const State = {
    crowbar: true,
    notebook: true,
    digCount: 0,
    bagFound: false,
    confronted: false,
    rescued: false
};

const AVATARS = {
    director: 'img/33.jpg',
    ajie: 'img/08.jpg'
};

const ITEMS = {
    crowbar: { name: '撬棍', desc: '仓库里带出来的撬棍，握了一整夜，已经不凉了。' },
    notebook: { name: '阿杰的笔记本', desc: '血渍浸透了最后一页。但倒数第三页，写着关键的位置。' },
    bag: { name: '儿童书包', desc: '蓝白相间的旧书包，从墙根里挖出来的。拉链上挂着半颗玻璃弹珠——和你铁罐里那颗，是一对。' },
    watch: { name: '旧手表', desc: '书包夹层里的男式手表，表背刻着一行小字：「奖给先进工作者，1998」。表带内侧，刻着一个「周」字。' }
};

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
    State[id] = true;
    if (document.querySelector('.inv-item[data-id="' + id + '"]')) return;
    const chip = document.createElement('div');
    chip.className = 'inv-item';
    chip.dataset.id = id;
    chip.textContent = ITEMS[id].name;
    chip.addEventListener('click', () => {
        if (id === 'notebook') { openModal('note-modal'); return; }
        openItem(id);
    });
    $('inventory').appendChild(chip);
}

function openItem(id) {
    $('item-name').textContent = ITEMS[id].name;
    $('item-desc').textContent = ITEMS[id].desc;
    openModal('item-modal');
}

function openModal(id) { $(id).classList.add('open'); }
function closeModal(id) { $(id).classList.remove('open'); }

// ===== 对话 =====
const DIALOGS = {
    d1: {
        sp: '村主任', avatar: AVATARS.director,
        tx: '雾里走出三个穿蓝衣服的人。为首的中年人笑着，眼睛却没有笑："后生，把你怀里的东西，交出来。"',
        choices: [
            { t: '"……什么东西？"', next: 'd2' },
            { t: '（抱紧书包，后退）', next: 'd2b' }
        ]
    },
    d2: {
        sp: '村主任', avatar: AVATARS.director,
        tx: '"十五年前的事，翻出来对谁都不好。"他朝前走了一步，"你朋友昨晚也很不老实。听话，跟我们走一趟，大家都体面。"',
        choices: [
            { t: '（举起手机）"我已经报警了。"', next: 'd3' },
            { t: '"你们把我朋友关在哪？！"', next: 'd2c' }
        ]
    },
    d2b: {
        sp: '村主任', avatar: AVATARS.director,
        tx: '"跑？"他冷笑一声，抬了抬下巴，"这村子就这么大。你朋友现在就在我家柴房里躺着，你想让他多躺几天吗？"',
        choices: [
            { t: '（举起手机）"我已经报警了，全程直播。"', next: 'd3' }
        ]
    },
    d2c: {
        sp: '村主任', avatar: AVATARS.director,
        tx: '"在我家柴房里。"他居然笑了，"放心，人活着。只要你们懂事，天亮就能走。"',
        choices: [
            { t: '（举起手机）"我已经报警了，全程直播。"', next: 'd3' }
        ]
    },
    d3: {
        sp: '村主任', avatar: AVATARS.director,
        tx: '他的笑容僵在脸上。远处，隐约传来了警笛声——由远及近。三个蓝衣服的人，慢慢散开了。',
        choices: [
            { t: '（冲向村主任家的柴房）', cap: '警笛声撕开晨雾。你朝着那栋最气派的二层小楼跑去。', goto: 'stage-shed' }
        ]
    },
    ajie: {
        sp: '阿杰', avatar: AVATARS.ajie,
        tx: '撬开第三下，锁"啪"地掉了。角落里的人缓缓抬起头——是阿杰。他瘦了一圈，嘴唇干裂，却咧开嘴笑了："……我就知道，你会来。"',
        choices: [
            { t: '"走，天亮了。"', cap: '你把他架起来。他怀里的东西硌了你一下——是那半罐弹珠。', goto: 'stage-dawn' }
        ]
    }
};

function openDialog(nodeId) {
    const node = DIALOGS[nodeId];
    $('dialog-speaker').textContent = node.sp;
    $('dialog-avatar').src = node.avatar;
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
                    closeModal('dialog-modal');
                    if (c.next) openDialog(c.next);
                    else {
                        if (c.cap) caption(c.cap);
                        if (c.goto) setTimeout(() => {
                            showStage(c.goto);
                            if (c.goto === 'stage-dawn') startEnding();
                        }, 1800);
                    }
                });
                choicesEl.appendChild(btn);
            });
        }
    }, 34);
}

// ===== 结局 =====
function startEnding() {
    const seq = [
        '警车碾过村口的碎石路，蓝红交替的光第一次照进这个从不在夜里亮灯的村子。门缝里，有村民悄悄掀开窗帘，又迅速放下。',
        '取证员在第三棵槐树下支起帐篷，一小铲、一小铲地清理墙根。那块刻着1998年的手表，被装进透明物证袋时，红绳上的土还湿着。',
        '蓝白相间的儿童书包被捧了出来，拉链上那半颗弹珠，和阿杰铁罐里的那颗，在晨雾里并到了一起——中间的红纹，正好接上。',
        '仓库、地下室，手电一道道扫过墙面。六十七个"正"字被逐一拍照编号，每一横、每一竖，都是一个孩子独自数过的白天。',
        '你从贴身口袋里掏出那张检讨书——从仓库逃离到现在，它跟着你走了一整夜，折痕深得快要断开。技术员用镇纸小心压平，拍下最后一张物证照：「我不该看见。我不该说。」铅笔字迹淡得像一口气，却一笔都没连错。原件封进卷宗，复印件轻轻折好，放进了那只蓝白书包的夹层——他当年没能说出口的话，由他自己带走。',
        '村主任被带上警车时，抬头看了一眼老槐树。树影落在他脸上，像一只摊开的、再无法收回的手。',
        '老校长在笔录上按了手印，手抖得按了两次才按实。他沉默了十五年的那件事，此刻一页一页，终于有人肯听了。回家路上，他把那盏昏黄的油灯擦干净，端端正正放在了教室的讲台上——灯芯挑得很亮，好像怕谁再摸黑走一回。',
        '救护车上，阿杰攥着那颗弹珠睡着了，指节却始终没松开。护士掰了两下没掰开，给他盖上毯子，没再动。',
        '村口小卖部的老板娘把电话打去了广东。电话那头，一个母亲的哭声盖过了机器声。她说：树儿要是还在，今年该上初中了，个子肯定蹿过他爸肩膀了。',
        '消息传到村口老槐树时，奶奶正把第三遍热好的红薯盛进碗里。她怔了很久，解下白头巾，慢慢盖在碗上，像哄一个睡着的孩子。风穿过空荡荡的巷子，这一回，她没有再往路上望——因为她知道，树儿是真的要回来了。',
        '太阳升过山脊，压了村子十五年的雾，一层一层散开。篮球架不响了，围墙根的野草上结着白霜，校门大敞着，光从一楼一直照到三楼，照见窗玻璃上那行被人擦了又擦、却始终没被磨掉的小字。',
        '周小树，1998年生，2011年冬失踪。今天，他终于可以"转学"回家了——而这一回，全班最矮的那个孩子，不用再一个人留在教室里。'
    ];
    let i = 0;
    caption(seq[0]);
    function nextLine() {
        i++;
        if (i >= seq.length) {
            setTimeout(() => $('end-card').classList.add('show'), 4200);
            return;
        }
        caption(seq[i]);
        setTimeout(nextLine, seq[i].length * 70 + 2600);
    }
    setTimeout(nextLine, seq[0].length * 70 + 2600);
}

// ===== 热点 =====
function initHotspots() {
    // --- 牛棚 ---
    $('hs-notebook').addEventListener('click', () => openModal('note-modal'));
    $('hs-outside').addEventListener('click', () => {
        caption('板缝外，蓝衣服的人影一趟一趟地巡。村子静得像一口井。');
    });
    $('hs-to-wall').addEventListener('click', () => {
        showStage('stage-wall');
        caption('晨雾是你最好的掩护。旗杆还在操场中央，哑着嗓子晃。一、二、三——第三棵槐树。');
    });

    // --- 后墙 ---
    $('hs-trees').addEventListener('click', () => {
        caption('一排老槐树，树皮裂得像老人的手背。只有第三棵，树下的土比别处黑。');
    });
    $('hs-dig').addEventListener('click', () => {
        if (State.bagFound) { caption('坑已经挖开了。剩下的，交给警察。'); return; }
        State.digCount++;
        if (State.digCount === 1) {
            caption('撬棍插进墙根的浮土——下面的砖，果然是新砌的，缝隙还带着潮气。');
        } else if (State.digCount === 2) {
            caption('又一块砖松动了。土里混进了一截蓝白色的布条，和一小截锈铁丝。');
        } else if (State.digCount === 3) {
            State.bagFound = true;
            addItem('bag');
            addItem('watch');
            caption('砖倒了。墙洞里，是一个小小的书包。和一块用红绳拴着的、大人的手表。');
            setTimeout(() => {
                showStage('stage-confront');
                setTimeout(() => {
                    if (!State.confronted) {
                        State.confronted = true;
                        openDialog('d1');
                    }
                }, 1600);
            }, 3800);
        }
    });
    $('hs-back-hide').addEventListener('click', () => {
        if (State.bagFound) {
            caption('来不及了。雾里射来几道手电的光——他们围过来了。');
            return;
        }
        showStage('stage-hide');
        caption('');
    });

    // --- 对质（对话已由挖墙触发，此处兜底） ---
    $('hs-director').addEventListener('click', () => {
        if (!State.confronted) {
            State.confronted = true;
            openDialog('d1');
        }
    });

    // --- 柴房 ---
    $('hs-ajie').addEventListener('click', () => {
        if (!State.rescued) { State.rescued = true; openDialog('ajie'); }
    });

    $('note-close').addEventListener('click', () => {
        closeModal('note-modal');
        // 无论从场景热点还是物品栏打开，合上笔记本都解锁后墙
        if (!State.noteRead) {
            State.noteRead = true;
            $('hs-to-wall').classList.remove('hidden');
            caption('第三棵槐树，正对着的墙根。天蒙蒙亮了——该动手了。');
        }
    });
    $('item-close').addEventListener('click', () => closeModal('item-modal'));
}

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', () => {
    initHotspots();
    addItem('crowbar');
    addItem('notebook');

    setTimeout(() => {
        $('title-card').classList.add('hide');
        showStage('stage-hide');
        setTimeout(() => {
            caption('昨晚从地下室连滚带爬逃出来，你躲进村口的牛棚。草垛冰凉，手电不敢开，只有笔记本，在黑暗里硌着胸口。');
        }, 1200);
    }, 3000);

    document.addEventListener('contextmenu', e => e.preventDefault());
});
