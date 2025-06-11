// src/utils/mergePdfBuffers.js

exports.mergePdfBuffers = async function (buffers) {
  try {
    const PDFMerger = (await import('pdf-merger-js')).default; // ✅ 动态导入 ESM 模块
    const merger = new PDFMerger();

    for (const buffer of buffers) {
      await merger.add(buffer);
    }

    return await merger.saveAsBuffer(); // ⬅️ 返回合并后的 PDF Buffer
  } catch (error) {
    throw new Error(`PDF 合并失败: ${error.message}`);
  }
};
