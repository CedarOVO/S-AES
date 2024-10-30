
<html>
<head>
    <title>AES</title>
    <link rel="stylesheet" href="/AES/web/css/index.css">
    <script src="/AES/web/js/jquery-3.7.1.js"></script>
    <script src="/AES/web/js/aes.js"></script>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>

<script>
    //CBC和ECB模式切换
    let currentMode = 'ECB'; // 默认模式
    function change() {
        const button = $("#change");
        const container = $("#container");

        const optionsDiv = document.getElementById('options');

        if (currentMode === 'ECB') {
            currentMode = 'CBC';
            optionsDiv.textContent = "注：密钥长度为16bit";
            document.getElementById('iv_1').value = ''; // 清空iv值
            document.getElementById('iv_2').value = ''; // 清空iv值
            document.getElementById('plaintext').value = ''; // 清空明文
            document.getElementById('result').value = ''; // 清空密文
            document.getElementById('key').value = ''; // 清空密钥
            button.text('CBC');
            button.animate({left: '+=50'}, 200); // 向右滑动
            button.css("background-color", "#4f7162");
            container.css("background-color", "rgba(60, 99, 81, 0.5)"); // 改变颜色

            $('#btn1').show();
            $('#btn2').show();
            $('#btn3').hide();
            $('#btn4').hide();
            $('#btn5').hide();
            $('#btn6').hide();
            $('#btn7').hide();

            $('#select').hide();

            $('#mode-container').hide();

            $('#iv_1').show();
            $('#iv_2').show();
        } else {
            currentMode = 'ECB';
            optionsDiv.textContent = "注：密钥长度为16bit";
            document.getElementById('plaintext').value = ''; // 清空明文
            document.getElementById('result').value = ''; // 清空密文
            document.getElementById('key').value = ''; // 清空密钥
            button.text('ECB');
            button.animate({left: '-=50'}, 200); // 向左滑动
            button.css("background-color", "#87A368"); // 回到初始位置
            container.css("background-color", "rgba(100, 122, 70, 0.6)"); // 改变颜色

            $('#iv_1').hide();
            $('#iv_2').hide();
            $('#mode-container').show();
            $('#select').val('common');
            $('#select').show();
        }
    }

    //加密按钮的点击事件
    function encrypt() {
        const mode = document.getElementById('mode-select').value;
        const plaintext = document.getElementById('plaintext').value;
        const key = document.getElementById('key').value;
        const type = currentMode;
        const iv = document.getElementById('iv_1').value;

        // 验证密钥长度
        if (key.length !== 16) {
            alert('密钥长度必须为16bit');
            return;
        }

        // 验证明文格式
        if (type === 'ECB'){
            if (mode === 'binary') {
                if (plaintext.length !== 16 || !/^[01]+$/.test(plaintext)) {
                    alert('明文必须是16位二进制数');
                    return;
                }
            } else if (mode === 'ascii') {
                if (plaintext.length !== 2) {
                    alert('明文必须是2字符的ASCII码');
                    return;
                }
            }
        } else if (type === 'CBC') {
            if (mode === 'binary') {
                if (plaintext.length % 16!== 0 || !/^[01]+$/.test(plaintext)) {
                    alert('明文长度必须是16的倍数');
                    return;
                }
            } else if (mode === 'ascii') {
                if (plaintext.length % 2 !== 0) {
                    alert('明文长度必须是2的倍数');
                    return;
                }
            }
        }

        let cipherText;
        if (type === 'ECB') {
            if (mode === 'binary') {
                cipherText = Encrypt(plaintext, key);
            } else if (mode === 'ascii') {
                cipherText = asciiEncrypt(plaintext, key);
            }
        } else if (type === 'CBC') {
            if (iv === '') {
                alert('请输入iv值');
                return;
            }
            cipherText = cbcEncrypt(plaintext, key, iv);
        }

        document.getElementById('result').value = cipherText;
    }

    //解密按钮的点击事件
    function decrypt() {
        const mode = document.getElementById('mode-select').value;
        const cipherText = document.getElementById('result').value;
        const key = document.getElementById('key').value;
        const type = currentMode;
        const iv = document.getElementById('iv_2').value;

        // 验证密钥长度
        if (key.length !== 16) {
            alert('密钥长度必须为16bit');
            return;
        }

        // 验证密文和格式
        if (type === 'ECB') {
            if (mode === 'binary') {
                if (cipherText.length !== 16 || !/^[01]+$/.test(cipherText)) {
                    alert('密文必须是16位二进制数');
                    return;
                }
            } else if (mode === 'ascii') {
                if (cipherText.length !== 2) {
                    alert('密文必须是2字符的ASCII码');
                    return;
                }
            }
        } else if (type === 'CBC') {
            if (mode === 'binary') {
                if (cipherText.length % 16 !== 0 || !/^[01]+$/.test(cipherText)) {
                    alert('密文长度必须是16的倍数');
                    return;
                }
            } else if (mode === 'ascii') {
                if (cipherText.length % 2 !== 0) {
                    alert('密文长度必须是2的倍数');
                    return;
                }
            }
        }

        let plainText;
        if (type === 'ECB') {
            if (mode === 'binary') {
                plainText = Decrypt(cipherText, key);
            } else if (mode === 'ascii') {
                plainText = asciiDecrypt(cipherText, key);
            }
        } else if (type === 'CBC') {
            if (iv === '') {
                alert('请输入iv值');
                return;
            }
            plainText = cbcDecrypt(cipherText, key, iv);
        }

        document.getElementById('plaintext').value = plainText;
    }


    //二进制数和ASCII码的模式切换
    function updateInputPlaceholders() {
        const mode = document.getElementById('mode-select').value;
        const plaintextInput = document.getElementById('plaintext');
        if (mode === 'binary') {
            plaintextInput.placeholder = '输入16位二进制';
        } else if (mode === 'ascii') {
            plaintextInput.placeholder = '输入2字符ASCII';
        }
    }

    function update_select() {
        const select = document.getElementById('select').value;
        const optionsDiv = document.getElementById('options');
        if (select === 'common') {
            $('#btn1').show();
            $('#btn2').show();
            $('#btn3').hide();
            $('#btn4').hide();
            $('#btn5').hide();
            $('#btn6').hide();
            $('#btn7').hide();
            optionsDiv.textContent = "注：密钥长度为16bit";
        } else if (select === 'double') {
            $('#btn1').hide();
            $('#btn2').hide();
            $('#btn3').show();
            $('#btn4').show();
            $('#btn5').show();
            $('#btn6').hide();
            $('#btn7').hide();
            optionsDiv.textContent = "注：密钥长度为32bit";
        } else if (select === 'triple') {
            $('#btn1').hide();
            $('#btn2').hide();
            $('#btn3').hide();
            $('#btn4').hide();
            $('#btn5').hide();
            $('#btn6').show();
            $('#btn7').show();
            optionsDiv.textContent = "注：密钥长度为48bit";
        }
    }
</script>

<body>
<div id="text1">S-AES</div>

<div id="screen">
    <select id="select" class="form-control-select" onclick="update_select()">
        <option value="common">普通加密</option>
        <option value="double">双重加密</option>
        <option value="triple">三重加密</option>
    </select>
    <button id="btn1" onclick="encrypt()">加 密</button>
    <button id="btn2" onclick="decrypt()">解 密</button>
    <button id="btn3" onclick="doubleEncrypt()">双重加密</button>
    <button id="btn4" onclick="doubleDecrypt()">双重解密</button>
    <button id="btn5" onclick="meetInTheMiddleAttack()">中间相遇攻击</button>
    <button id="btn6" onclick="tripleEncrypt()">三重加密</button>
    <button id="btn7" onclick="tripleDecrypt()">三重解密</button>
    <div id="container">
        <button id="change" onclick="change()">ECB</button>
    </div>

    <div id="src1">
        <div class = "text">明文</div>
        <label for="plaintext"></label>
        <input type="text" id="plaintext" placeholder="请输入明文" />
        <div id ="mode-container">
            <label for="mode-select">明文类型:</label>
            <select id="mode-select" class="form-control">
                <option value="binary">二进制</option>
                <option value="ascii">ASCII码</option>
            </select>
        </div>
        <label for="iv_1"></label>
        <input class="iv_input" id="iv_1" placeholder="请输入iv值" style="display:none" />
    </div>

    <div id="src2">
        <div class = "text">密钥</div>
        <label for="key"></label>
        <input type="text" id="key" placeholder="请输入密钥" />
        <div id = "options">注：密钥长度为16bit</div>
    </div>

    <div id="src3">
        <div class = "text">密文</div>
        <label for="result">
        </label><input type="text" id="result" placeholder="请输入密文" />
        <label for="iv_2"></label>
        <input class="iv_input" id="iv_2" placeholder="请输入iv值" style="display:none" />
    </div>
</div>

<div id="text2">
    ——————————S-AES对称加密解密系统——————————<br>
    <span>
        <a href="http://www.cse.cqu.edu.cn/">重庆大学软件学院</a>
        软件工程杜瑞杰，邓湘，王舟颖制作<br>
    </span>
    如遇问题，请联系我们：2661697757@qq.com
</div>
</body>
</html>
