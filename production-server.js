const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use('/api', createProxyMiddleware({
  target: 'http://localhost:3000',
  changeOrigin: true,
}));

app.use('/webhook', createProxyMiddleware({
  target: 'http://localhost:3000',
  changeOrigin: true,
}));

app.use(express.static(path.join(__dirname, 'web', 'build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'web', 'build', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Production server running on http://0.0.0.0:${PORT}`);
});
