const { resolve } = require('path')

export default{
    base: '/hycol_tool/'
}

module.exports = {
    build: {
      rollupOptions: {
        input: {
          
          triangle: resolve(__dirname, 'triangle')
        }
      }
    }
  }