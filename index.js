// 读取本地文件
const fs = require('fs')
// 获取网络资源
const got = require('got')
// 控制台输出着色
const colors = require('colors/safe')
// 控制台输出进度条
const cliProgress = require('cli-progress')
// 解析命令行参数
const minimist = require('minimist')

// 参数默认值
const DEFAULT_TIME = 20
const DEFAULT_CONTENT = '今晚月色真美'
const DEFAULT_LANGS = 'zh-CN,en'
// 解析参数
// 可以直接在参数里输入字符串指定翻译内容，也可以用 -c 或 -content 指定，默认文本为“今晚月色真美”
// 此外，也可以通过 -f 或者 --file 指定读取文本文件作为翻译内容
// 可以直接在参数里打数字指定次数，也可以用 -t 或 --time 指定次数，默认次数为 20 次
// 可以通过 -l 或 --langs 指定翻译语言序列
const args = minimist(process.argv.slice(2))
const time =
  args.t ||
  args.time ||
  args._.filter(v => Number.isInteger(v))[0] ||
  DEFAULT_TIME
const filePath = args.f || args.file
const content =
  args.c ||
  args.content ||
  (filePath
    ? fs.readFileSync(filePath).toString()
    : args._.filter(v => typeof v === 'string')[0]) ||
  DEFAULT_CONTENT
const commonSeparators = /,|\||;|\/|\\|\s+/
const langs = (args.l || args.langs || DEFAULT_LANGS)
  .split(commonSeparators)
  .filter(v => v)

;(async () => {
  let text = content
  console.log(colors.green('【原话】'))
  console.log(`${text}`)
  // 初始化进度条
  const bar = new cliProgress.SingleBar({}, cliProgress.Presets.rect)
  bar.start(time, 0)
  for (let i = 0; i < time; i++) {
    const slIdx = i % langs.length
    const tlIdx = slIdx < langs.length - 1 ? slIdx + 1 : 0
    text = await translate(text, langs[slIdx], langs[tlIdx])
    // 更新进度条数值
    bar.update(i + 1)
  }
  // 进度条停止
  bar.stop()
  console.log(colors.red(`【翻译 ${time} 次后的结果】`))
  console.log(text)
})()

/**
 * 调用谷歌翻译 API 翻译文本
 *
 * @param {string} text 源文本
 * @param {string} sl 源语言
 * @param {string} tl 目标语言
 * @returns 翻译后的结果
 */
async function translate(text, sl, tl) {
  // 需要进行 URL 编码，否则回车符无法保留
  text = encodeURIComponent(text)
  // 获取 API 校验需要的 TK 值
  const tk = await getTK(text, sl, tl)
  // 这里的 dt=t 是指定返回的内容格式，而设定 client=gtx 可以不触发请求频率阈值，否则请求速度过快很容易 403
  const url = `https://translate.google.cn/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&tk=${tk}&q=${text}`
  const res = await got(url)
  // 如果是多行文本，这里会被分割为一个数组，需要重新组合
  const result = JSON.parse(res.body)[0]
    .map(v => v[0])
    .join('')
  return result
}

/**
 * 从网页中获取谷歌翻译的 TKK 值
 *
 * @param {string} text 源文本
 * @param {string} sl 源语言
 * @param {string} tl 目标语言
 * @returns 获取的 TKK 值
 */
async function getTKK(text, sl, tl) {
  const url = `https://translate.google.cn/#view=home&op=translate&sl=${sl}&tl=${tl}&text=${text}`
  const res = await got(url)
  const tkk = res.body.match(/tkk:'(.+?)'/)[1]
  return tkk
}

/**
 * 获取谷歌翻译的 TK 值
 *
 * @param {string} text 源文本
 * @param {string} sl 源语言
 * @param {string} tl 目标语言
 * @returns 获取的 TK 值
 */
async function getTK(text, sl, tl) {
  const tkk = await getTKK(text, sl, tl)
  // 这段加密过程的计算代码是被加密过的，所以是人类不可读的，直接复制出来使用
  const b = (a, b) => {
    for (let d = 0; d < b.length - 2; d += 3) {
      let c = b.charAt(d + 2)
      c = 'a' <= c ? c.charCodeAt(0) - 87 : Number(c)
      c = '+' == b.charAt(d + 1) ? a >>> c : a << c
      a = '+' == b.charAt(d) ? (a + c) & 4294967295 : a ^ c
    }
    return a
  }
  const tk = a => {
    let e = tkk.split('.')
    let h = Number(e[0]) || 0
    let g = []
    let d = 0
    for (let f = 0; f < a.length; f++) {
      var c = a.charCodeAt(f)
      128 > c
        ? (g[d++] = c)
        : (2048 > c
            ? (g[d++] = (c >> 6) | 192)
            : (55296 == (c & 64512) &&
              f + 1 < a.length &&
              56320 == (a.charCodeAt(f + 1) & 64512)
                ? ((c =
                    65536 + ((c & 1023) << 10) + (a.charCodeAt(++f) & 1023)),
                  (g[d++] = (c >> 18) | 240),
                  (g[d++] = ((c >> 12) & 63) | 128))
                : (g[d++] = (c >> 12) | 224),
              (g[d++] = ((c >> 6) & 63) | 128)),
          (g[d++] = (c & 63) | 128))
    }
    a = h
    for (d = 0; d < g.length; d++) (a += g[d]), (a = b(a, '+-a^+6'))
    a = b(a, '+-3^+b+-f')
    a ^= Number(e[1]) || 0
    0 > a && (a = (a & 2147483647) + 2147483648)
    a %= 1e6
    return a.toString() + '.' + (a ^ h)
  }
  return tk(text)
}
