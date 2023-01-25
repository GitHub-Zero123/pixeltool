// By Zero123 QQ:913702423

let UseSize = 64;
let Direction = 0;
let UrlData = null;
// # 0: 白 
// # 8: 淡灰色
// # 7: 灰色
// # 15: 黑色
// # 12: 棕色
// # 14: 红色
// # 1: 橙色
// # 4: 黄色
// # 5: 黄绿色
// # 13: 绿色
// # 9: 青色
// # 3: 淡蓝色
// # 11: 蓝色
// # 10: 紫色
// # 2: 品红色
// # 6: 粉红色
let McColorsDic = {
    "14":[221, 0, 0],
    "13": [0, 170, 0],
    "0": [255, 255, 255],
    "8": [165, 165, 165],
    "7": [130, 130, 130],
    "15": [0, 0, 0],
    "12": [128, 42, 42],
    "1": [255, 97, 0],
    "4": [250, 250, 0],
    "5": [127, 255, 0],
    "9": [0, 205, 205],
    "3": [0, 245, 255],
    "11": [0, 0, 255],
    "10": [160, 32, 240],
    "2": [238, 17, 238],
    "6": [251, 140, 206]
}

function UpDateImage(){
    if(!UrlData){return}
    var img = new Image();
    img.src = URL.createObjectURL(UrlData);
    
    var canvas = document.getElementById("myCanvas");
    var ctx = canvas.getContext('2d', { willReadFrequently: true});
    ctx.clearRect(0,0,canvas.width,canvas.height);

    img.onload = function() {
        let w = img.width;
        let h = img.height;
        if(w>UseSize || h>UseSize){
            let bl = Math.max(w,h)/UseSize;
            w = parseInt(w/bl);
            h = parseInt(h/bl);
        }
        canvas.height = h;
        canvas.width = w;
        ctx.drawImage(img,0,0,w,h);
    }
}

function setImagePreview() {
    var imagechoose=document.getElementById("choose-img");
    var fileName = imagechoose.value;  
    if (!fileName.match(/.jpg|.jpeg|.gif|.png|.bmp/i)) {  
        if(!fileName){
            return false;
        }
        alert('上传的图片格式不正确，请从新选择！');  
        return false;  
    } 
    if(imagechoose.files && imagechoose.files[0]){
        UrlData = imagechoose.files[0];
        UpDateImage();
    }
}

function sendToGame() {
    // 发送数据到游戏
    const rgbaList = [];
    if(!UrlData){return}
    var canvas = document.getElementById("myCanvas");
    var ctx = canvas.getContext('2d', { willReadFrequently: true});
    var imageData = ctx.getImageData(0,0,canvas.width,canvas.height).data;
    for (let i = 0; i < imageData.length; i += 4) {
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];
        const a = imageData[i + 3];
        rgbaList.push(Number(GetColorType([r,g,b])));
    }

    try{
        let socket = new WebSocket("ws://localhost:24729");
        socket.onopen = function(event){
            socket.send("QUMODSERVER:PIXELTOOL$\n"+JSON.stringify({
                "Size": [canvas.width,canvas.height],
                "Direction": Direction,
                "Color": rgbaList,
                "BlockDic": {} // 存放 16及 以上数值的其他方块映射
            }));
            socket.close();
        }
        socket.onerror = function(event){
            alert("请求时发生了错误");
        }
        socket.onclose = function(event){
        }
    }catch(e){
        alert(e);
    }
}

function chformChange(events){
    for (let i = 0; i <events.length ; i++) {
        if(events[i].checked) Direction = Number(events[i].value);
    }
}

function SetSize(Size, Button){
    UseSize = Size;
    document.getElementById("SetSize").id = "";
    Button.id = "SetSize";
    UpDateImage();
}

window.onload = new function() {
    console.log("界面初始化");
}


// 色彩匹配 By antimatter15
function deltaE(rgbA, rgbB) {
    let labA = rgb2lab(rgbA);
    let labB = rgb2lab(rgbB);
    let deltaL = labA[0] - labB[0];
    let deltaA = labA[1] - labB[1];
    let deltaB = labA[2] - labB[2];
    let c1 = Math.sqrt(labA[1] * labA[1] + labA[2] * labA[2]);
    let c2 = Math.sqrt(labB[1] * labB[1] + labB[2] * labB[2]);
    let deltaC = c1 - c2;
    let deltaH = deltaA * deltaA + deltaB * deltaB - deltaC * deltaC;
    deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH);
    let sc = 1.0 + 0.045 * c1;
    let sh = 1.0 + 0.015 * c1;
    let deltaLKlsl = deltaL / (1.0);
    let deltaCkcsc = deltaC / (sc);
    let deltaHkhsh = deltaH / (sh);
    let i = deltaLKlsl * deltaLKlsl + deltaCkcsc * deltaCkcsc + deltaHkhsh * deltaHkhsh;
    return i < 0 ? 0 : Math.sqrt(i);
  }
  
  function rgb2lab(rgb) {
    let r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255, x, y, z;
    r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
    x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
    y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
    z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
    x = (x > 0.008856) ? Math.pow(x, 1/3) : (7.787 * x) + 16/116;
    y = (y > 0.008856) ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
    z = (z > 0.008856) ? Math.pow(z, 1/3) : (7.787 * z) + 16/116;
    return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)]
}


function GetColorType(RGB) {
    let colors = McColorsDic;
    let manhattan = function(x, y) {
        return deltaE(x, y);
    }
    let distances = {
    };
    for(let i in colors){
        distances[i] = manhattan(colors[i], RGB);
    }
    let colorDis = 1000;
    let UseKey = '0';
    for(let key in distances){
        let data = distances[key];
        if(data<colorDis){
            colorDis = data;
            UseKey = key;
        }
    }
    return UseKey;
}