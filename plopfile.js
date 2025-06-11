module.exports = function (plop) {
  plop.setGenerator('module', {
    description: '生成一个业务模块（页面 + 表单 + 控制器 + 路由）',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: '请输入模块名称（如：demo、waybill、channel）',
      },
    ],
    actions: [
      {
        type: 'add',
        path: 'app/{{name}}/page.tsx',
        templateFile: 'plop-templates/page.hbs',
        skipIfExists: true, // 已存在就跳过
      },
      {
        type: 'add',
        path: 'components/{{name}}/Form.tsx',
        templateFile: 'plop-templates/form.hbs',
        skipIfExists: true,
      },
      {
        type: 'add',
        path: 'api/controllers/{{name}}Controller.js',
        templateFile: 'plop-templates/controller.hbs',
        skipIfExists: true,
      },
      {
        type: 'add',
        path: 'api/routes/{{name}}Routes.js',
        templateFile: 'plop-templates/route.hbs',
        skipIfExists: true,
      },
    ],
  });
  plop.setHelper('componentTag', (name) => `<${name}Form />`);
};
