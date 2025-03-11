// babel.config.js
module.exports = {
    presets: [
      [
        "@babel/preset-env",
        {
          targets: {
            node: "current" // Đảm bảo rằng Babel chuyển đổi code cho phiên bản Node hiện tại
          }
        }
      ]
    ]
  };
  