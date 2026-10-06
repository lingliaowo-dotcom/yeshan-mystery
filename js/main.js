/**
 * 云岭迷踪 - 序章交互脚本
 */

// ===== 状态管理 =====
const GameState = {
    currentScene: 1,
    zoomed: false,
    typingSpeed: 50,
    isTyping: false
};

// ===== DOM 元素缓存 =====
const scenes = {
    1: document.getElementById('scene-1'),
    2: document.getElementById('scene-2'),
    3: document.getElementById('scene-3'),
    4: document.getElementById('scene-4'),
    5: document.getElementById('scene-5'),
    6: document.getElementById('scene-6'),
    7: document.getElementById('scene-7')
};

// ===== 场景切换 =====
function switchScene(from, to) {
    scenes[from].classList.remove('active');
    setTimeout(() => {
        scenes[to].classList.add('active');
        GameState.currentScene = to;
        runSceneEntry(to);
    }, 800);
}

// ===== 打字机效果 =====
function typeText(element, text, speed = GameState.typingSpeed, callback) {
    if (GameState.isTyping) return;
    GameState.isTyping = true;
    element.textContent = '';
    let i = 0;
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        } else {
            GameState.isTyping = false;
            if (callback) callback();
        }
    }
    type();
}

// ===== 各场景入场逻辑 =====
function runSceneEntry(sceneNum) {
    switch(sceneNum) {
        case 5:
            // 发现线索场景
            setTimeout(() => {
                const textEl = document.getElementById('clue-text');
                typeText(textEl, '这个身影……怎么有些熟悉？', 60, () => {
                    setTimeout(() => {
                        switchScene(5, 6);
                    }, 2000);
                });
            }, 1000);
            break;
            
        case 6:
            // 记忆闪回场景
            runFlashbackSequence();
            break;
            
        case 7:
            // 结尾场景
            runEndingSequence();
            break;
    }
}

// ===== 闪回序列 =====
function runFlashbackSequence() {
    const flashbackLayer = document.getElementById('flashback-layer');
    const memoryText = document.getElementById('memory-text');
    
    const memories = [
        '斑驳的围墙……',
        '吱呀作响的篮球架……',
        '还有……那个瘦弱的身影……',
        '「阿杰……？」'
    ];
    
    let memoryIndex = 0;
    
    function showNextMemory() {
        if (memoryIndex >= memories.length) {
            // 闪回结束，进入结尾
            setTimeout(() => {
                switchScene(6, 7);
            }, 2000);
            return;
        }
        
        typeText(memoryText, memories[memoryIndex], 80, () => {
            memoryIndex++;
            
            // 逐步清晰化
            if (memoryIndex === 2) {
                flashbackLayer.classList.add('clear');
            }
            
            setTimeout(showNextMemory, 1500);
        });
    }
    
    // 开始闪回
    setTimeout(() => {
        flashbackLayer.classList.remove('clear');
        showNextMemory();
    }, 500);
}

// ===== 结尾序列 =====
function runEndingSequence() {
    const whiteFade = document.getElementById('white-fade');
    const finalPhone = document.querySelector('.final-phone');
    const chatHistory = document.getElementById('chat-history');
    const typing = document.getElementById('typing');
    const finalChoice = document.getElementById('final-choice');
    
    const messages = [
        { text: '在吗', type: 'received', delay: 500 },
        { text: '有个事想跟你说', type: 'received', delay: 1500 },
        { text: '？？怎么了', type: 'sent', delay: 3000 },
        { text: '我要去云岭村一趟', type: 'received', delay: 4500 },
        { text: '那边有些事要处理', type: 'received', delay: 5500 },
        { text: '什么？？那个废弃的学校？', type: 'sent', delay: 7000 },
        { text: '嗯', type: 'received', delay: 8500 },
        { text: '别担心，很快回来', type: 'received', delay: 9500 }
    ];
    
    // 白色闪回
    setTimeout(() => {
        whiteFade.classList.add('active');
        setTimeout(() => {
            whiteFade.classList.remove('active');
            finalPhone.classList.add('show');
            
            // 逐条显示聊天记录
            messages.forEach((msg, index) => {
                setTimeout(() => {
                    if (index === messages.length - 1) {
                        typing.classList.add('show');
                        setTimeout(() => {
                            typing.classList.remove('show');
                            addMessage(msg);
                            
                            // 显示最终选择和悬念信息
                            setTimeout(() => {
                                finalChoice.style.display = 'block';
                                finalChoice.style.opacity = '0';
                                finalChoice.style.transition = 'opacity 1s';
                                setTimeout(() => {
                                    finalChoice.style.opacity = '1';
                                }, 100);
                            }, 2000);
                            
                        }, 2000);
                    } else {
                        addMessage(msg);
                    }
                }, msg.delay);
            });
            
        }, 2000);
    }, 500);
    
    function addMessage(msg) {
        const div = document.createElement('div');
        div.className = `chat-msg ${msg.type}`;
        div.textContent = msg.text;
        chatHistory.appendChild(div);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }
}

// ===== 事件绑定 =====
function initEvents() {
    // 场景1：点击微博图标
    document.getElementById('weibo-app').addEventListener('click', () => {
        switchScene(1, 2);
    });
    
    // 场景2：点击热搜第3条
    document.getElementById('target-news').addEventListener('click', () => {
        switchScene(2, 3);
    });
    
    // 场景3：点击新闻图片
    document.getElementById('news-img-container').addEventListener('click', () => {
        switchScene(3, 4);
    });
    
    // 场景3：返回按钮
    document.getElementById('back-to-hot').addEventListener('click', () => {
        switchScene(3, 2);
    });
    
    // 场景4：点击放大图片（角落）
    const zoomImage = document.getElementById('zoom-image');
    const redCircle = document.getElementById('red-circle');
    const zoomHint = document.getElementById('zoom-hint');
    
    zoomImage.addEventListener('click', () => {
        if (!GameState.zoomed) {
            GameState.zoomed = true;
            zoomImage.classList.add('zoomed');
            
            setTimeout(() => {
                redCircle.classList.add('visible');
                zoomHint.classList.add('show');
            }, 1500);
        }
    });
    
    // 点击红圈 → 进入线索场景
    redCircle.addEventListener('click', (e) => {
        e.stopPropagation();
        switchScene(4, 5);
    });
    
    // 关闭放大
    document.getElementById('close-zoom').addEventListener('click', () => {
        switchScene(4, 3);
        GameState.zoomed = false;
        zoomImage.classList.remove('zoomed');
        redCircle.classList.remove('visible');
        zoomHint.classList.remove('show');
    });
    
    // 场景7：选择按钮
    document.getElementById('btn-go').addEventListener('click', () => {
        document.body.style.transition = 'opacity 1.2s';
        document.body.style.opacity = '0';
        setTimeout(() => { location.href = 'chapter1.html'; }, 1200);
    });
    
    document.getElementById('btn-wait').addEventListener('click', () => {
        document.querySelector('.final-phone').classList.add('shake');
        setTimeout(() => {
            alert('你选择了等待。\n\n但阿杰已经三天没有消息了……');
        }, 500);
    });
}

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', () => {
    initEvents();
    
    // 防止右键菜单（增强游戏沉浸感）
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
});
