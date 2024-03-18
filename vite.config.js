const { resolve } = require('path')

export default{
    base: '/hycol_tool/',
    build: {
      rollupOptions: {
        input: {
            main: resolve(__dirname, 'index.html'),
            triangle: resolve(__dirname, 'triangle/index.html')
        }
      }
    }
  }