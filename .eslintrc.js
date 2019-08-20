module.exports = {
  root: true,
  parserOptions: {
    parser: 'babel-eslint',
    sourceType: 'module'
  },
  env: {
    browser: true,
    node: true,
    es6: true
  },
  extends: ['plugin:vue/recommended', 'eslint:recommended'],

  // add your custom rules here
  //it is base on https://github.com/vuejs/eslint-config-vue
  rules: {
    // allow async-await
    'generator-star-spacing': 'off',
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    // allow use tab
    'no-tabs': 0,
    // 强制使用单引号
    quotes: ['error', 'single'],
    // 使用分号结尾
    semi: ['error', 'always'],
    // 函数定义时括号前面要不要有空格
    'space-before-function-paren': [0, 'always'],
    // 驼峰命名方式
    camelcase: 'off',
    // 多余空白行
    'no-multiple-empty-lines': 'off',
    'no-mixed-spaces-and-tabs': 0,
    indent: ['off', 'tab'],
    'no-trailing-spaces': 0,
    // Simorel
    'vue/html-indent': ['error', 4]
  }
};
