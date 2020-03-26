# translate-many-times
用谷歌翻译API翻译文本内容很多次

## 使用方式

```
node index.js [options]

Options:
  -t, --time  翻译次数，默认为20次
  -c, --content 翻译的文本内容，默认为“今晚月色真美”
  -f, --file  文本文件路径（只有content参数为空时才会读取）
```

也可以用简略形式调用：

```
node index.js <文本内容|(-c|--content) 文本文件路径> [次数]
```

```
node index.js [次数] <文本内容|(-c|--content) 文本文件路径>
```

## 演示截图

![简略形式调用](https://github.com/frederick-wang/translate-many-times/blob/master/screenshot/1.gif?raw=true)

![参数调用（次数在后）](https://github.com/frederick-wang/translate-many-times/blob/master/screenshot/2.gif?raw=true)

![参数调用（次数在前）](https://github.com/frederick-wang/translate-many-times/blob/master/screenshot/3.gif?raw=true)

![读取本地文件](https://github.com/frederick-wang/translate-many-times/blob/master/screenshot/4.gif?raw=true)

## 参考文献

[1] °只为大大.Google Translate的tk生成以及参数详情[EB/OL].https://www.zhanghuanglong.com/detail/google-translate-tk-generation-and-parameter-details,2017-9-25.

[2] WKQ.爬取 谷歌翻译[EB/OL].http://weikeqin.cn/2017/11/14/crawler-google-translate/,2019-12-16.

[3] 磐石区.google translate 免费使用 /translate_a/single 接口翻译[EB/OL].https://blog.csdn.net/panshiqu/article/details/104193607,2020-2-6.

[4] 胖喵~.破解google翻译API全过程[EB/OL].https://www.cnblogs.com/by-dream/p/6554340.html,2017-3-24.
