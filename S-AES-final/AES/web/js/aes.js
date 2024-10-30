// S盒和逆S盒
const S = [
    [9, 4, 10, 11],
    [13, 1, 8, 5],
    [6, 2, 0, 3],
    [12, 14, 15, 7]
];

const IS = [
    [10, 5, 9, 11],
    [1, 7, 8, 15],
    [6, 0, 2, 3],
    [12, 4, 13, 14]
];

// 轮常数
const RCON1 = '10000000';
const RCON2 = '00110000';

// 异或运算
function XOR(bits1, bits2) {
    let newBits = '';
    for (let i = 0; i < bits1.length; i++) {
        newBits += (parseInt(bits1[i], 2) ^ parseInt(bits2[i], 2)).toString(2);
    }
    return newBits;
}

// 密钥加
function AddRoundKey(bits1, bits2) {
    return XOR(bits1, bits2);
}

// 半字节代替
function SubNib(bits) {
    let newBits = '';
    for (let i = 0; i < bits.length; i += 4) {
        const row = parseInt(bits.slice(i, i + 2), 2);
        const col = parseInt(bits.slice(i + 2, i + 4), 2);
        newBits += S[row][col].toString(2).padStart(4, '0');
    }
    return newBits;
}

// 逆半字节代替
function InvSubNib(bits) {
    let newBits = '';
    for (let i = 0; i < bits.length; i += 4) {
        const row = parseInt(bits.slice(i, i + 2), 2);
        const col = parseInt(bits.slice(i + 2, i + 4), 2);
        newBits += IS[row][col].toString(2).padStart(4, '0');
    }
    return newBits;
}

// 行移位
function ShiftRows(bits) {
    return bits.slice(0, 4) + bits.slice(12, 16) + bits.slice(8, 12) + bits.slice(4, 8);
}

// 列混淆
function MixColumns(bits) {
    return XOR(bits.slice(0, 4), GF('0100', bits.slice(4, 8))) +
        XOR(GF('0100', bits.slice(0, 4)), bits.slice(4, 8)) +
        XOR(bits.slice(8, 12), GF('0100', bits.slice(12, 16))) +
        XOR(GF('0100', bits.slice(8, 12)), bits.slice(12, 16));
}

// 逆列混淆
function InvMixColumns(bits) {
    return XOR(GF('1001', bits.slice(0, 4)), GF('0010', bits.slice(4, 8))) +
        XOR(GF('0010', bits.slice(0, 4)), GF('1001', bits.slice(4, 8))) +
        XOR(GF('1001', bits.slice(8, 12)), GF('0010', bits.slice(12, 16))) +
        XOR(GF('0010', bits.slice(8, 12)), GF('1001', bits.slice(12, 16)));
}

// GF(2^4)上的乘法
function GF(a, b) {
    const mulTable = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
        [0, 2, 4, 6, 8, 10, 12, 14, 3, 1, 7, 5, 11, 9, 15, 13],
        [0, 3, 6, 5, 12, 15, 10, 9, 11, 8, 13, 14, 7, 4, 1, 2],
        [0, 4, 8, 12, 3, 7, 11, 15, 6, 2, 14, 10, 5, 1, 13, 9],
        [0, 5, 10, 15, 7, 2, 13, 8, 14, 11, 4, 1, 9, 12, 3, 6],
        [0, 6, 12, 10, 11, 13, 7, 1, 5, 3, 9, 15, 14, 8, 2, 4],
        [0, 7, 14, 9, 15, 8, 1, 6, 13, 10, 3, 4, 2, 5, 12, 11],
        [0, 8, 3, 11, 6, 14, 5, 13, 12, 4, 15, 7, 10, 2, 9, 1],
        [0, 9, 1, 8, 2, 11, 3, 10, 4, 13, 5, 12, 6, 15, 7, 14],
        [0, 10, 7, 13, 14, 4, 9, 3, 15, 5, 8, 2, 1, 11, 6, 12],
        [0, 11, 5, 14, 10, 1, 15, 4, 7, 12, 2, 9, 13, 6, 8, 3],
        [0, 12, 11, 7, 5, 9, 14, 2, 10, 6, 1, 13, 15, 3, 4, 8],
        [0, 13, 9, 4, 1, 12, 8, 5, 2, 15, 11, 6, 3, 14, 10, 7],
        [0, 14, 15, 1, 13, 3, 2, 12, 9, 7, 6, 8, 4, 10, 11, 5],
        [0, 15, 13, 2, 9, 6, 4, 11, 1, 14, 12, 3, 8, 7, 5, 10]
    ];
    const resultInt = mulTable[parseInt(a, 2)][parseInt(b, 2)];
    return resultInt.toString(2).padStart(4, '0');
}

// 实现左移，输入一个8位字符串，输出一个8位字符串
function RotNib(bits) {
    return bits.slice(4) + bits.slice(0, 4);
}

// 密钥扩展
function KeyExpansion(key) {
    const w0 = key.slice(0, 8);
    const w1 = key.slice(8, 16);
    const w2 = XOR(w0, XOR(RCON1, SubNib(RotNib(w1))));
    const w3 = XOR(w2, w1);
    const w4 = XOR(w2, XOR(RCON2, SubNib(RotNib(w3))));
    const w5 = XOR(w4, w3);
    return [w0 + w1, w2 + w3, w4 + w5];
}

// 加密
function Encrypt(plainText, key) {
    const expandedKey = KeyExpansion(key);
    let cipherText = AddRoundKey(plainText, expandedKey[0]);
    cipherText = SubNib(cipherText);
    cipherText = ShiftRows(cipherText);
    cipherText = MixColumns(cipherText);
    cipherText = AddRoundKey(cipherText, expandedKey[1]);
    cipherText = SubNib(cipherText);
    cipherText = ShiftRows(cipherText);
    cipherText = AddRoundKey(cipherText, expandedKey[2]);
    return cipherText;
}

// 解密
function Decrypt(cipherText, key) {
    const expandedKey = KeyExpansion(key);
    let plainText = AddRoundKey(cipherText, expandedKey[2]);
    plainText = ShiftRows(plainText);
    plainText = InvSubNib(plainText);
    plainText = AddRoundKey(plainText, expandedKey[1]);
    plainText = InvMixColumns(plainText);
    plainText = ShiftRows(plainText);
    plainText = InvSubNib(plainText);
    plainText = AddRoundKey(plainText, expandedKey[0]);
    return plainText;
}

// S盒和逆S盒（省略前面的S盒和逆S盒定义以及S-AES算法相关代码）

// 将ASCII字符串转换为二进制字符串
function asciiToBinary(asciiText) {
    let binaryText = '';
    for (let i = 0; i < asciiText.length; i++) {
        let binaryChar = asciiText[i].charCodeAt(0).toString(2).padStart(8, '0');
        binaryText += binaryChar;
    }
    return binaryText;
}

// 将二进制字符串转换为ASCII字符串
function binaryToAscii(binaryText) {
    let asciiText = '';
    for (let i = 0; i < binaryText.length; i += 8) {
        let asciiChar = String.fromCharCode(parseInt(binaryText.slice(i, i + 8), 2));
        asciiText += asciiChar;
    }
    return asciiText;
}

// 扩展加密功能，输入是ASCII编码字符串，密钥是16位二进制字符串，输出是加密后的ASCII字符串
function asciiEncrypt(plainText, key) {
    let cipherText = '';
    for (let i = 0; i < plainText.length; i += 2) {
        // 将明文的每两个字符转换为二进制字符串
        let charBinary = asciiToBinary(plainText[i]) + asciiToBinary(plainText[i + 1]);
        // 执行加密操作
        let encryptedBinary = Encrypt(charBinary, key);
        // 将密文二进制转换为ASCII字符
        cipherText += binaryToAscii(encryptedBinary);
    }
    return cipherText;
}

// 扩展解密功能，输入是加密后的ASCII字符串，密钥是16位二进制字符串，输出是解密后的ASCII字符串
function asciiDecrypt(cipherText, key) {
    let decryptedText = '';
    for (let i = 0; i < cipherText.length; i += 2) {
        // 将密文的每两个字符转换为二进制字符串
        let charBinary = asciiToBinary(cipherText[i]) + asciiToBinary(cipherText[i + 1]);
        // 执行解密操作
        let decryptedBinary = Decrypt(charBinary, key);
        // 将解密后的二进制字符串转换回ASCII字符
        decryptedText += binaryToAscii(decryptedBinary);
    }
    return decryptedText;
}

// 双重加密
function doubleEncrypt() {
    const plainText = document.getElementById('plaintext').value;
    const key = document.getElementById('key').value;
    const mode = document.getElementById('mode-select').value;
    if (mode === 'binary') {
        if (plainText.length !== 16) {
            alert('明文长度必须为16位');
            return;
        } else if (key.length !== 32) {
            alert('密钥长度必须为32位');
            return;
        } else {
            let firstEncryption = Encrypt(plainText, key.slice(0, 16));
            let secondEncryption = Encrypt(firstEncryption, key.slice(16, 32));
            document.getElementById('result').value = secondEncryption;
        }
    } else if (mode === 'ascii') {
        if (plainText.length !== 2) {
            alert('明文必须是2字符的ASCII码');
            return;
        } else if (key.length !== 32) {
            alert('密钥长度必须为32位');
            return;
        } else {
            let firstEncryption = asciiEncrypt(plainText, key.slice(0, 16));
            let secondEncryption = asciiEncrypt(firstEncryption, key.slice(16, 32));
            document.getElementById('result').value = secondEncryption;
        }
    }
}

function doubleDecrypt() {
    const cipherText = document.getElementById('result').value;
    const key = document.getElementById('key').value;
    const mode = document.getElementById('mode-select').value;
    if (mode === 'binary') {
        if (cipherText.length !== 16) {
            alert('密文长度必须为16位');
            return;
        } else if (key.length !== 32) {
            alert('密钥长度必须为32位');
            return;
        } else {
            let firstDecryption = Decrypt(cipherText, key.slice(16, 32));
            let secondDecryption = Decrypt(firstDecryption, key.slice(0, 16));
            document.getElementById('plaintext').value = secondDecryption;
        }
    } else if (mode === 'ascii') {
        if (cipherText.length !== 2) {
            alert('密文必须是2字符的ASCII码');
            return;
        } else if (key.length !== 32) {
            alert('密钥长度必须为32位');
            return;
        } else {
            let firstDecryption = asciiDecrypt(cipherText, key.slice(16, 32));
            let secondDecryption = asciiDecrypt(firstDecryption, key.slice(0, 16));
            document.getElementById('plaintext').value = secondDecryption;
        }
    }
}

function generateKeyOptions() {
    let keyOptions = [];

    // 生成所有 16 位二进制数
    for (let i = 0; i < 65536; i++) { // 0 到 65535
        // 转换为二进制并填补前导零，确保长度为16
        let binaryKey = i.toString(2).padStart(16, '0');
        keyOptions.push(binaryKey);
    }

    return keyOptions;
}


// 中间相遇攻击
// function meetInTheMiddleAttack() {
//     let plainText = document.getElementById('plaintext').value;
//     let cipherText = document.getElementById('result').value;
//     let keyOptions = generateKeyOptions();
//     let encryptMap = new Map();
//     let decryptMap = new Map();
//     let results = []; // 用于存储找到的所有密钥组合
//
//     // 加密过程
//     for (let key1 of keyOptions) {
//         encryptMap.set(Encrypt(plainText, key1), key1);
//     }
//
//     // 解密过程
//     for (let key2 of keyOptions) {
//         decryptMap.set(Decrypt(cipherText, key2), key2);
//     }
//
//     // 查找所有可能的密钥组合
//     for (let [intermediate, key1] of encryptMap.entries()) {
//         if (decryptMap.has(intermediate)) {
//             let key2 = decryptMap.get(intermediate);
//             results.push(key1 + key2); // 存储每对找到的密钥组合
//         }
//     }
//
//     // 如果找到结果，使用逗号连接返回
//     if (results.length > 0) {
//         document.getElementById('key').value = results.join(', '); // 用逗号隔开返回所有结果
//     } else {
//         document.getElementById('key').value = '没有找到匹配的密钥'; // 如果没有结果，给出提示
//     }
//
//     return null;
// }

function meetInTheMiddleAttack() {
    let plainText = document.getElementById('plaintext').value;
    let cipherText = document.getElementById('result').value;
    let keyOptions = generateKeyOptions();
    let encryptMap = new Map();
    let decryptMap = new Map();
    let results = []; // 用于存储找到的所有密钥组合
    const maxResults = 20; // 设置最大结果数
    const mode = document.getElementById('mode-select').value;
    if (mode === 'binary') {
        if (plainText.length !== 16) {
            alert('明文必须是16位二进制数');
            return;
        } else if (plainText.length !== 16) {
            alert('密文必须是16位二进制数');
            return;
        } else {
            // 加密过程
            for (let key1 of keyOptions) {
                let encryptedText = Encrypt(plainText, key1);
                encryptMap.set(encryptedText, key1);

                // 提前退出如果已找到所需个数
                if (results.length >= maxResults) {
                    break;
                }
            }

            // 解密过程
            for (let key2 of keyOptions) {
                let decryptedText = Decrypt(cipherText, key2);
                decryptMap.set(decryptedText, key2);

                // 提前退出如果已找到所需个数
                if (results.length >= maxResults) {
                    break;
                }
            }

            // 查找所有可能的密钥组合
            for (let [intermediate, key1] of encryptMap.entries()) {
                if (decryptMap.has(intermediate)) {
                    let key2 = decryptMap.get(intermediate);
                    results.push(key1 + key2); // 存储每对找到的密钥组合

                    // 提前退出如果已找到所需个数
                    if (results.length >= maxResults) {
                        break;
                    }
                }
            }

            // 如果找到结果，使用逗号连接返回
            if (results.length > 0) {
                document.getElementById('key').value = results.join(', '); // 用逗号隔开返回所有结果
            } else {
                document.getElementById('key').value = '没有找到匹配的密钥'; // 如果没有结果，给出提示
            }
        }
    } else if (mode === 'ascii') {
        if (plainText.length !== 2) {
            alert('明文必须是2字符的ASCII码');
            return;
        } else if (cipherText.length !== 2) {
            alert('密文必须是2字符的ASCII码');
            return;
        } else {
            // 加密过程
            for (let key1 of keyOptions) {
                let encryptedText = asciiEncrypt(plainText, key1);
                encryptMap.set(encryptedText, key1);

                // 提前退出如果已找到所需个数
                if (results.length >= maxResults) {
                    break;
                }
            }

            // 解密过程
            for (let key2 of keyOptions) {
                let decryptedText = asciiDecrypt(cipherText, key2);
                decryptMap.set(decryptedText, key2);

                // 提前退出如果已找到所需个数
                if (results.length >= maxResults) {
                    break;
                }
            }

            // 查找所有可能的密钥组合
            for (let [intermediate, key1] of encryptMap.entries()) {
                if (decryptMap.has(intermediate)) {
                    let key2 = decryptMap.get(intermediate);
                    results.push(key1 + key2); // 存储每对找到的密钥组合

                    // 提前退出如果已找到所需个数
                    if (results.length >= maxResults) {
                        break;
                    }
                }
            }

            // 如果找到结果，使用逗号连接返回
            if (results.length > 0) {
                document.getElementById('key').value = results.join(', '); // 用逗号隔开返回所有结果
            } else {
                document.getElementById('key').value = '没有找到匹配的密钥'; // 如果没有结果，给出提示
            }
        }
    }
    return null;
}



// 三重加密
function tripleEncrypt() {
    const plainText = document.getElementById('plaintext').value;
    const key = document.getElementById('key').value;
    const mode = document.getElementById('mode-select').value;
    if (mode === 'binary'){
        if (plainText.length !== 16) {
            alert('明文必须是16位二进制数');
            return;
        } else if (key.length !== 48) {
            alert('密钥长度必须为48位');
            return;
        } else {
            let firstEncryption = Encrypt(plainText, key.slice(0, 16));
            let secondEncryption = Encrypt(firstEncryption, key.slice(16, 32));
            let thirdEncryption = Encrypt(secondEncryption, key.slice(32, 48));
            document.getElementById('result').value = thirdEncryption;
        }
    } else if (mode === 'ascii'){
        if (plainText.length !== 2) {
            alert('明文必须是2字符的ASCII码');
            return;
        } else if (key.length !== 48) {
            alert('密钥长度必须为48位');
            return;
        } else {
            let firstEncryption = asciiEncrypt(plainText, key.slice(0, 16));
            let secondEncryption = asciiEncrypt(firstEncryption, key.slice(16, 32));
            let thirdEncryption = asciiEncrypt(secondEncryption, key.slice(32, 48));
            document.getElementById('result').value = thirdEncryption;
        }
    }
}

function tripleDecrypt() {
    const cipherText = document.getElementById('result').value;
    const key = document.getElementById('key').value;
    const mode = document.getElementById('mode-select').value;
    if (mode === 'binary'){
        if (cipherText.length !== 16) {
            alert('密文长度必须为16的倍数');
            return;
        } else if (key.length !== 48) {
            alert('密钥长度必须为48位');
            return;
        } else {
            let firstDecryption = Decrypt(cipherText, key.slice(32, 48));
            let secondDecryption = Decrypt(firstDecryption, key.slice(16, 32));
            let thirdDecryption = Decrypt(secondDecryption, key.slice(0, 16));
            document.getElementById('plaintext').value = thirdDecryption;
        }
    } else if (mode === 'ascii'){
        if (cipherText.length !== 2) {
            alert('密文必须是2字符的ASCII码');
            return;
        } else if (key.length !== 48) {
            alert('密钥长度必须为48位');
            return;
        } else {
            let firstDecryption = asciiDecrypt(cipherText, key.slice(0, 16));
            let secondDecryption = asciiDecrypt(firstDecryption, key.slice(16, 32));
            let thirdDecryption = asciiDecrypt(secondDecryption, key.slice(32, 48));
            document.getElementById('plaintext').value = thirdDecryption;
        }
    }


}


// CBC模式
function cbcEncrypt(plainText, key, iv) {
    let previousBlock = iv;
    let cipherText = '';

    for (let i = 0; i < plainText.length; i += 16) {
        let block = plainText.slice(i, i + 16);
        let xoredBlock = XOR(block, previousBlock);
        let encryptedBlock = Encrypt(xoredBlock, key);
        cipherText += encryptedBlock;
        previousBlock = encryptedBlock;
    }

    return cipherText;
}

function cbcDecrypt(cipherText, key, iv) {
    let previousBlock = iv;
    let decryptedText = '';

    for (let i = 0; i < cipherText.length; i += 16) {
        let block = cipherText.slice(i, i + 16);
        let decryptedBlock = Decrypt(block, key);
        let xoredBlock = XOR(decryptedBlock, previousBlock);
        decryptedText += xoredBlock;
        previousBlock = block;
    }

    return decryptedText;
}

// 测试扩展加密功能
function testAsciiEncryption() {
    const plainText = prompt("请输入明文：");
    const key = prompt("请输入16位二进制密钥：");

    const cipherText = asciiEncrypt(plainText, key);
    console.log("加密密文：", cipherText);

    const decryptedText = asciiDecrypt(cipherText, key);
    console.log("解密明文：", decryptedText);

    if (decryptedText === plainText) {
        console.log("扩展加密解密成功");
    } else {
        console.log("扩展加密解密失败");
    }
}
