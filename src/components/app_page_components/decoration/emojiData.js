//模拟数据
const emojiData = [
	[{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/0.gif',
			alt: '[微笑]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/1.gif',
			alt: '[撇嘴]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/2.gif',
			alt: '[色]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/3.gif',
			alt: '[发呆]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/4.gif',
			alt: '[得意]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/5.gif',
			alt: '[流泪]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/6.gif',
			alt: '[害羞]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/7.gif',
			alt: '[闭嘴]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/8.gif',
			alt: '[睡]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/9.gif',
			alt: '[大哭]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/10.gif',
			alt: '[尴尬]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/11.gif',
			alt: '[发怒]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/12.gif',
			alt: '[调皮]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/13.gif',
			alt: '[呲牙]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/14.gif',
			alt: '[惊讶]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/15.gif',
			alt: '[难过]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/16.gif',
			alt: '[酷]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/17.gif',
			alt: '[冷汗]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/18.gif',
			alt: '[抓狂]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/19.gif',
			alt: '[吐]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/20.gif',
			alt: '[偷笑]'
		},
		// {
		// 	url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/static/img/tab/delete2.png',
		// 	alt: '[删除]'
		// }
	],
	[{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/21.gif',
			alt: '[愉快]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/22.gif',
			alt: '[白眼]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/23.gif',
			alt: '[傲慢]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/24.gif',
			alt: '[饥饿]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/25.gif',
			alt: '[困]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/26.gif',
			alt: '[惊恐]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/27.gif',
			alt: '[流汗]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/28.gif',
			alt: '[憨笑]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/29.gif',
			alt: '[悠闲]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/30.gif',
			alt: '[奋斗]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/31.gif',
			alt: '[咒骂]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/32.gif',
			alt: '[疑问]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/33.gif',
			alt: '[嘘]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/34.gif',
			alt: '[晕]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/35.gif',
			alt: '[疯了]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/36.gif',
			alt: '[衰]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/37.gif',
			alt: '[骷髅]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/38.gif',
			alt: '[敲打]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/39.gif',
			alt: '[再见]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/40.gif',
			alt: '[擦汗]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/41.gif',
			alt: '[抠鼻]'
		},
	],
	[{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/42.gif',
			alt: '[鼓掌]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/43.gif',
			alt: '[糗大了]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/44.gif',
			alt: '[坏笔]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/45.gif',
			alt: '[左哼哼]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/46.gif',
			alt: '[右哼哼]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/47.gif',
			alt: '[哈欠]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/48.gif',
			alt: '[鄙视]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/49.gif',
			alt: '[委屈]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/50.gif',
			alt: '[快哭了]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/51.gif',
			alt: '[阴险]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/52.gif',
			alt: '[亲亲]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/53.gif',
			alt: '[吓]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/54.gif',
			alt: '[可怜]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/55.gif',
			alt: '[菜刀]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/56.gif',
			alt: '[西瓜]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/57.gif',
			alt: '[啤酒]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/58.gif',
			alt: '[篮球]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/59.gif',
			alt: '[乒乓]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/60.gif',
			alt: '[咖啡]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/61.gif',
			alt: '[饭]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/62.gif',
			alt: '[猪头]'
		},
		// {
		// 	url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/static/img/tab/delete2.png',
		// 	alt: '[删除]'
		// }
	],
	[{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/63.gif',
			alt: '[玫瑰]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/64.gif',
			alt: '[凋谢]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/65.gif',
			alt: '[嘴唇]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/66.gif',
			alt: '[爱心]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/67.gif',
			alt: '[心碎]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/68.gif',
			alt: '[蛋糕]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/69.gif',
			alt: '[闪电]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/70.gif',
			alt: '[炸弹]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/71.gif',
			alt: '[刀]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/72.gif',
			alt: '[足球]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/73.gif',
			alt: '[瓢虫]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/74.gif',
			alt: '[便便]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/75.gif',
			alt: '[月亮]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/76.gif',
			alt: '[太阳]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/77.gif',
			alt: '[礼物]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/78.gif',
			alt: '[拥抱]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/79.gif',
			alt: '[强]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/80.gif',
			alt: '[弱]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/81.gif',
			alt: '[握手]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/82.gif',
			alt: '[胜利]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/83.gif',
			alt: '[抱拳]'
		},
		// {
		// 	url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/static/img/tab/delete2.png',
		// 	alt: '[删除]'
		// }
	],
	[{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/84.gif',
			alt: '[勾引]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/85.gif',
			alt: '[拳头]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/86.gif',
			alt: '[差劲]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/87.gif',
			alt: '[爱你]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/88.gif',
			alt: '[NO]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/89.gif',
			alt: '[OK]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/90.gif',
			alt: '[爱情]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/91.gif',
			alt: '[飞吻]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/92.gif',
			alt: '[跳跳]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/93.gif',
			alt: '[发抖]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/94.gif',
			alt: '[怄火]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/95.gif',
			alt: '[转圈]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/96.gif',
			alt: '[磕头]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/97.gif',
			alt: '[回头]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/98.gif',
			alt: '[跳绳]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/99.gif',
			alt: '[投降]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/100.gif',
			alt: '[激动]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/101.gif',
			alt: '[乱舞]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/102.gif',
			alt: '[献吻]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/103.gif',
			alt: '[左太极]'
		},
		{
			url: 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/104.gif',
			alt: '[右太极]'
		},
	],
]

export {
	emojiData
}