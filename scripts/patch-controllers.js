const { Project, SyntaxKind } = require('ts-morph');
const project = new Project({ tsConfigFilePath: 'tsconfig.json' });

// 遍历所有 controller 文件
project.getSourceFiles('api/controllers/*Controller.js').forEach((sf) => {
  // 确保已 import Zod 和 PrismaClient
  if (!sf.getImportDeclaration('@/prisma/zod')) {
    sf.addImportDeclaration({
      moduleSpecifier: '@/prisma/zod',
      namedImports: [sf.getBaseNameWithoutExtension() + 'Model'],
    });
  }
  if (!sf.getImportDeclaration('@prisma/client')) {
    sf.addImportDeclaration({
      moduleSpecifier: '@prisma/client',
      namedImports: ['PrismaClient'],
    });
    sf.addVariableStatement({
      declarationKind: 'const',
      declarations: [{ name: 'prisma', initializer: 'new PrismaClient()' }],
    });
  }
  // 找到 createXxx 函数，插入 safeParse 逻辑
  const fn = sf.getFunction(`create${sf.getBaseNameWithoutExtension().replace('Controller', '')}`);
  if (fn) {
    fn.getBody().insertStatements(0, [
      `const result = ${sf.getBaseNameWithoutExtension()}Model
        .omit({ id: true, createdAt: true })
        .safeParse(req.body);`,
      `if (!result.success) {
         return res.status(400).json({ error: result.error.format() });
       }`,
      `const data = result.data;`,
    ]);
  }
  sf.saveSync();
});
