/* eslint-disable @typescript-eslint/no-unused-vars, require-await, no-console */

import { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/index',
    categories: ['new-media'],
    example: '/kaiyan/index',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['eyepetizer.net/'],
            target: '/kaiyan/index',
        },
    ],
    name: '开眼精选',
    maintainers: ['Konrad'],
    handler,
}

async function handler(ctx) {
    const api_url = `https://baobab.kaiyanapp.com/api/v2/feed`;
    const response = await got({
        method: 'get',
        url: api_url,
    });

    // ## 获取列表
    const list = response.data.issueList[0].itemList;

    // ## 定义输出的item
    const out = await Promise.all(
        list.map(async (item) => {
            if (item.type === 'video') {
                // #### 截取Json中需要的部分，便于下方变量快速取值
                const content = item.data;
                if (!content || !content.title) {
                    console.error('Invalid content:', content);
                    return null;
                }
                // #### 得到需要的RSS信息
                const title = content.title; // 标题
                // 发布日期
                const releaseTimeMillis = content.releaseTime;
                const releaseDate = new Date(releaseTimeMillis);
                const date = releaseDate.toISOString();
		
		const webUrl = content.webUrl.raw; //网页链接
                const videoUrl = content.playUrl; // 原装视频链接
                const itemUrl = `<video src="${content.playUrl}" controls="controls"></video>`; // 视频链接
                const imgUrl = `<img src="${content.cover.feed}" />`; // ���片链接
                const author = content.author.name; // 作者
                const description = content.description + '<br/>' + imgUrl + '<br/>' + itemUrl; // 拼接出详情，包括文字描述、封面图、视频链接

                // ### 设置 RSS feed item
                const single = {
                    title: title,
                    link: webUrl,
                    author: author,
                    description: description,
                    pubDate: new Date(date).toUTCString(),
                };
                return single;
            }
        })
    );

    return {
        title: '开眼每日精选',
        link: 'https://home.eyepetizer.net',
        description: '开眼每日精选',
        item: out.filter(Boolean), // Filter out null values
    };
}
