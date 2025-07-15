const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const { exec } = require('child_process');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.post('/result', async (req, res) => {
  const ip = req.body.ip_address;
  const urls = {
    whois: `http://ip-api.com/json/${ip}`,
    dns: `https://dns.google/resolve?name=${ip}`,
    httpbin: `https://httpbin.org/get?url=${encodeURIComponent(ip)}`
  };

  try {
    const [r1, r2, r3] = await Promise.all([
      fetch(urls.whois).then(r => r.json()),
      fetch(urls.dns).then(r => r.json()),
      fetch(urls.httpbin).then(r => r.json()),
    ]);
    exec(`netstat -an | grep ${ip}`, (err, out, stderr) => {
      const net = err ? err.message : stderr ? stderr : (out || 'No connections');
      res.send(`
        <h1>Results for ${ip}</h1>
        <h2>Whois</h2><pre>${JSON.stringify(r1,null,2)}</pre>
        <h2>DNS</h2><pre>${JSON.stringify(r2,null,2)}</pre>
        <h2>HTTPBin</h2><pre>${JSON.stringify(r3,null,2)}</pre>
        <h2>Netstat</h2><pre>${net}</pre>
        <p><a href="/">Back</a></p>
      `);
    });
  } catch(e) {
    res.send(`<h2>Error occurred: ${e.message}</h2><p><a href="/">Back</a></p>`);
  }
});

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
