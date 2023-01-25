// By Zero123 QQ:913702423

let UseSize = 64;
let Direction = 0;
let UrlData = null;


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
        let CaMap = ctx.getImageData(0,0,canvas.width,canvas.height)
        let imageData = CaMap.data;
        RGBaster({data: imageData, lenth: 16}, color => {
            
        })
    
        // RGBaster({data: ctx.getImageData(0,0,canvas.width,canvas.height).data, lenth: 16}, color => {
        //     console.log(color);
        // });
        // console.log("ok");

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
        // rgbaList.push([r,g,b]);
    }

    try{
        let socket = new WebSocket("ws://localhost:24729");
        socket.onopen = function(event){
            socket.send(JSON.stringify({
                "Size": [canvas.width,canvas.height],
                "Direction": Direction,
                "Color": rgbaList
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


function rgb2hsv(rgb) {
    var rr, gg, bb,
    r = parseInt(rgb[0]) / 255,
    g = parseInt(rgb[1]) / 255,
    b = parseInt(rgb[2]) / 255,
    h, s,
    v = Math.max(r, g, b),
    diff = v - Math.min(r, g, b),
    diffc = function(c){
        return (v - c) / 6 / diff + 1 / 2;
    };
    if (diff == 0) {
        h = s = 0;
    } else {
        s = diff / v;  rr = diffc(r); gg = diffc(g); bb = diffc(b);
        if (r === v) {
            h = bb - gg;
        }else if (g === v) {
            h = (1 / 3) + rr - bb;
        }else if (b === v) {
            h = (2 / 3) + gg - rr;
        }
        if (h < 0) {
            h += 1;
        }else if (h > 1) {
            h -= 1;
        }
    }
    return [Math.round(h * 360),Math.round(s * 100),Math.round(v * 100)];
}

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
function GetColorType(RGB) {
    let colors = {
        "14":[255, 0, 0],
        "13": [0, 255, 0],
        "0": [255, 255, 255],
        "8": [220, 220, 220],
        "7": [192, 192, 192],
        "15": [0, 0, 0],
        "12": [128, 42, 42],
        "1": [255, 97, 0],
        "4": [255, 255, 0],
        "5": [127, 255, 0],
        "9": [0, 255, 255],
        "3": [193, 210, 240],
        "11": [0, 0, 255],
        "10": [160, 32, 240],
        "2": [230, 30, 70],
        "6": [255, 128, 128]
    }
    let manhattan = function(x, y) {
        return Math.abs(x[0] - y[0]) + Math.abs(x[1] - y[1]) + Math.abs(x[2] - y[2])
    }
    let distances = [];
    for(let i in colors){
        distances.push(manhattan(colors[i],RGB));
    }
    let colorDis = distances[0];
    let UsePos = 0;
    for(var pos in distances){
        let data = distances[pos];
        if(data<colorDis){
            colorDis = data;
            UsePos = pos;
        }
    }
    return UsePos;
}