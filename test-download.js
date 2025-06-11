const fetch = require('node-fetch');
const fs = require('fs');

async function testDownload() {
  try {
    const res = await fetch('http://localhost:4000/api/waybills/download-labels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: ['WB1748582912227', 'WB1748582713492'] }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`❌ 状态码: ${res.status}, 响应内容: ${text}`);
      throw new Error('下载标签失败');
    }

    const buffer = await res.buffer();
    fs.writeFileSync('test-labels.pdf', buffer);
    console.log('✅ 标签已下载为 test-labels.pdf');
  } catch (err) {
    console.error('❌', err);
  }
}

testDownload();
