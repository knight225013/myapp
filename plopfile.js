module.exports = function (plop) {
  plop.setGenerator('price', {
    description: '生成价格管理模块',
    prompts: [
      {
        type: 'confirm',
        name: 'confirm',
        message: '是否生成价格管理模块？',
        default: true
      }
    ],
    actions: [
      {
        type: 'add',
        path: 'api/controllers/priceController.js',
        templateFile: 'plop-templates/controller.hbs',
        skipIfExists: true
      },
      {
        type: 'add',
        path: 'api/routes/priceRoutes.js',
        templateFile: 'plop-templates/route.hbs',
        skipIfExists: true
      },
      {
        type: 'add',
        path: 'components/price/Form.tsx',
        templateFile: 'plop-templates/form.hbs',
        skipIfExists: true
      },
      {
        type: 'add',
        path: 'app/channels/price-maintenance/create/page.tsx',
        templateFile: 'plop-templates/create-page.hbs',
        skipIfExists: true
      },
      {
        type: 'add',
        path: 'app/channels/price-maintenance/[priceId]/page.tsx',
        templateFile: 'plop-templates/edit-page.hbs',
        skipIfExists: true
      }
    ]
  });
};
