const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const { exec } = require('child_process');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/result', (req, res) => {
    const ip_address = req.body.ip_address;

    const whois_url = `http://ip-api.com/json/${ip_address}`;
    const dns_url = `https://dns.google/resolve?name=${ip_address}`;
    const httpbin_url = `https://httpbin.org/get?url=${encodeURIComponent(ip_address)}`;

    Promise.all([
        fetch(whois_url).then(response => response.json()),
        fetch(dns_url).then(response => response.json()),
        fetch(httpbin_url).then(response => response.json())
    ])
    .then(([whois_data, dns_data, httpbin_data]) => {
        const whois_info = JSON.stringify(whois_data, null, 2);
        const dns_info = JSON.stringify(dns_data, null, 2);
        const httpbin_info = JSON.stringify(httpbin_data, null, 2);

        exec(`netstat -an | grep ${ip_address}`, (error, stdout, stderr) => {
            let netstat_info;

            if (error) {
                netstat_info = `Error executing netstat: ${error.message}`;
            } else if (stderr) {
                netstat_info = `Standard error: ${stderr}`;
            } else {
                netstat_info = stdout || 'No output from netstat';
            }

            res.send(`
                <h1>Results for ${ip_address}</h1>
                <h2>Whois Info</h2>
                <pre>${whois_info}</pre>

                <h2>DNS Info</h2>
                <pre>${dns_info}</pre>

                <h2>HTTPBin Info</h2>
                <pre>${httpbin_info}</pre>

                <h2>Netstat Info</h2>
                <pre>${netstat_info}</pre>
            `);
        });
    })
    .catch(error => {
        res.send("<h2>Error fetching data</h2>");
    });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
