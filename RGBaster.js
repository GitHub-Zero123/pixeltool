
var reducible = [];
var leafNum = 0;  //叶子节点数
 
// 八叉树节点 
/**
  * #FF7800
  * R: 1111 1111
  * G: 0111 1000
  * B: 0000 0000
  * RGB 通道逐列黏合之后的值就是其在某一层节点的子节点编号了。
  * 每一列一共是三位，那么取值范围就是 0 ~ 7 也就是一共有八种情况。
  * 这就是为什么这种算法要开八叉树来计算的原因了。
  * 上述颜色的第一位黏合起来是100(2)，转化为十进制就是 4，所以这个颜色在第一层是放在根节点的第五个子节点当中；
  * 第二位是 110(2) 也就是 6，那么它就是根节点的第五个儿子的第七个儿子。
  */
class OctreeNode {
    constructor() {
        this.isLeaf = false; // 表明该节点是否为叶子节点。
        this.pixelCount = 0; //在该节点的颜色一共插入了几次。
        this.red = 0; //该节点 R 通道累加值。
        this.green = 0; //G 累加值。
        this.blue = 0; // B 累加值。

        this.children = new Array(8); // 八个子节点指针。
        for (var i = 0; i < this.children.length; i++)
            this.children[i] = null;

        // 这里的 next 不是指兄弟链中的 next 指针
        // 而是在 reducible 链表中的下一个节点
        this.next = null;
        // 注意：我们将会把该颜色的 RGB 分量分别累加到该节点的各分量值中，以便最终求平均数。
    }
}
 
for (var i = 0; i < 7; i++) reducible.push(null);
 
var root = new OctreeNode();
 
/**
  * 创建节点
  * createNode
  *
  * @param {OctreeNode} parent the parent node of the new node
  * @param {Number} idx child index in parent of this node
  * @param {Number} level node level
  * @return {OctreeNode} the new node  
  */
function createNode(parent, idx, level) {
    var node = new OctreeNode();
    //根据层数level判断当前节点是否是叶子节点  是则isLeaf为true，leafNum叶子节点数
    if (level === 7) {
        node.isLeaf = true;
        leafNum++;
    } else {
        // 将其丢到第 level 层的 reducible 链表中
        node.next = reducible[level];
        reducible[level] = node;
    }
     
    return node;
}
 
/**
  * addColor
  *  插入某种颜色
  * @param {OctreeNode} node the octree node
  * @param {Object} color color object
  * @param {Number} level node level
  * @return {undefined}
  */
function addColor(node, color, level) {
    // 判断是否是叶子节点
    if (node.isLeaf) {
        node.pixelCount++;
        node.red += color.r;
        node.green += color.g;
        node.blue += color.b;
    } else {
        // 由于 js 内部都是以浮点型存储数值，所以位运算并没有那么高效
        // 在此使用直接转换字符串的方式提取某一位的值
        var str = '';
        var r = color.r.toString(2);
        var g = color.g.toString(2);
        var b = color.b.toString(2);

        while (r.length < 8) r = '0' + r;
        while (g.length < 8) g = '0' + g;
        while (b.length < 8) b = '0' + b;
 
        str += r[level];
        str += g[level];
        str += b[level];
        var idx = parseInt(str, 2);
 
        if (null === node.children[idx]) {
            node.children[idx] = createNode(node, idx, level + 1);
        }
 
        if (undefined === node.children[idx]) {
            console.log(color.r.toString(2));
        }
        // 递归将数据完全放入八叉树中
        addColor(node.children[idx], color, level + 1);
    }
}

/**
  * reduceTree
  *  合并颜色 合并就先去最底层的 reducible 链表中寻找一个可以合并的节点，把它从链表中删除之后合并叶子节点并且删除其叶子节点
  * @return {undefined}
  */
function reduceTree() {
    // 找到最深层次的并且有可合并节点的链表
    var lv = 6;
    while (null === reducible[lv]) lv--;
    // 取出链表头并将其从链表中移除
    var node = reducible[lv];
    reducible[lv] = node.next;
 
    // 合并子节点
    var r = 0;
    var g = 0;
    var b = 0;
    var count = 0;
    for (var i = 0; i < 8; i++) {
        if (null === node.children[i]) continue;
        r += node.children[i].red;
        g += node.children[i].green;
        b += node.children[i].blue;
        count += node.children[i].pixelCount;
        leafNum--;
    }
    // 赋值
    node.isLeaf = true;
    node.red = r;
    node.green = g;
    node.blue = b;
    node.pixelCount = count;
    leafNum++;
}
 
/**
  * buildOctree
  * 过程就是遍历一遍传入的像素颜色信息，对于每个颜色都插入到八叉树当中；
  * 并且每一次插入之后都判断下叶子节点数有没有溢出，如果满出来的话需要及时合并。
  * @param {Array} pixels        获取的像素数组
  * @param {Number} maxColors    最大保留合并后颜色数组的长度
  * @return {undefined}
  */
function buildOctree(pixels, maxColors) {
    for (var i = 0; i < pixels.length; i++) {
        // 添加颜色
        addColor(root, pixels[i], 0);
        // 合并叶子节点
        while (leafNum > maxColors) reduceTree();
    }
}
 
/**
  * 颜色统计
  *
  * @param {OctreeNode} node 节点将是stats
  * @param {Object} object 颜色统计信息
  * @return {undefined}
  */
function colorsStats(node, object) {
    // 判断是否是叶子节点
    if (node.isLeaf) {
        // 计算当前颜色的平均，并转换成16进制数
        var r = parseInt(node.red / node.pixelCount).toString(16);
        var g = parseInt(node.green / node.pixelCount).toString(16);
        var b = parseInt(node.blue / node.pixelCount).toString(16);

        if (r.length === 1) r = '0' + r;
        if (g.length === 1) g = '0' + g;
        if (b.length === 1) b = '0' + b;
        var color = r + g + b;
        
        // console.log('color:', color);
        // console.log('object:', object);
        // 统计当前颜色合并累计的次数
        if (object[color]) object[color] += node.pixelCount;
        else object[color] = node.pixelCount;
 
        return;
    }
 
    for (var i = 0; i < 8; i++) {
        if (null !== node.children[i]) {
            colorsStats(node.children[i], object);
        }
    }
}
/**
  * Helper functions. 根据宽高生成canvas画布
  * @param {*} width 
  * @param {*} height 
  * @returns 
  */
var getContext = function (width, height) {
    var canvas = document.createElement('canvas');
    canvas.setAttribute('width', width);
    canvas.setAttribute('height', height);
    return canvas.getContext('2d');
};
 
/**
  * 
  * @param {string} img 
  * @param {Function} loaded 
  */
var getImageData = function (img, loaded) {
    // 初始化imge对象
    var imgObj = new Image();
    var imgSrc = img.src || img;
 
    if (imgSrc.substring(0, 5) !== 'data:') imgObj.crossOrigin = 'Anonymous';
 
    imgObj.onload = () => {
        // 初始化画布
        var context = getContext(imgObj.width, imgObj.height);
        // 将图片赋值到画布上
        context.drawImage(imgObj, 0, 0);
        // 获取画布像素点信息
        var imageData = context.getImageData(0, 0, imgObj.width, imgObj.height);
        loaded && loaded(imageData.data);
    };
    imgObj.src = imgSrc;
};
 
/**
  * @param {object} param                   参数
  * @param {param.data} data                数据
  * @param {param.lenth} lenth              获取颜色数组的最大长度   
  * @callback {Function}                    成功回调
  */

function RGBaster(param, callback) {
    root = new OctreeNode();
    leafNum = 0;
    let {data, lenth} = param;
    var array = [];
    // 将颜色像素点分割成rgb格式
    for (var i = 0; i < data.length; i += 4) {
        var r = data[i];
        var g = data[i + 1];
        var b = data[i + 2];
        array.push({ r: r, g: g, b: b });
    }
 
    // console.log('将颜色像素点分割成rgb格式：', array);
    // 将每个颜色像素点放入的八叉树中
    buildOctree(array, lenth);
    // console.log('==========', root);
    var colors = {};
    // 将筛选过后的颜色转换至16进制数
    colorsStats(root, colors);
    console.log(colors);
    var result = [];
    for (var key in colors) {
        result.push({ color: key, count: colors[key] });
    }
    // 按合并数排序
    result.sort((a, b) => b.count - a.count);

    // 返回筛选结果
    callback(result);

}
 

// function RGBaster(param, callback) {
//     let {img, lenth} = param;
//     getImageData(img, (data) => {
//         var array = [];
//         // 将颜色像素点分割成rgb格式
//         for (var i = 0; i < data.length; i += 4) {
//             var r = data[i];
//             var g = data[i + 1];
//             var b = data[i + 2];
//             array.push({ r: r, g: g, b: b });
//         }
//         // console.log('将颜色像素点分割成rgb格式：', array);
//         // 将每个颜色像素点放入的八叉树中
//         buildOctree(array, lenth);
//         // console.log('==========', root);
//         var colors = {};
//         // 将筛选过后的颜色转换至16进制数
//         colorsStats(root, colors);
 
//         var result = [];
//         for (var key in colors) {
//             result.push({ color: key, count: colors[key] });
//         }
//         // 按合并数排序
//         result.sort((a, b) => b.count - a.count);
 
//         // 返回筛选结果
//         callback(result);
//     });
// }
 