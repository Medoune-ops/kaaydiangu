const QRCode = require('qrcode');
QRCode.toDataURL('test')
  .then(url => console.log('Success:', url.slice(0, 50) + '...'))
  .catch(err => console.error('Error:', err));
