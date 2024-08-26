const puppeteer = require('puppeteer-pro');
const fs = require('fs');
const proxyChain = require('proxy-chain');
puppeteer.avoidDetection();
const solver = puppeteer.solveRecaptchas('O7EDVMZD6LQEIUXITD5ZMJZX7CNUQ5XI');

const url = 'https://2captcha.com/demo/recaptcha-v2';
const sitekey = '6LfD3PIbAAAAAJs_eEHvoOl75_83eXSqpPSRFJ_u';
const proxy = 'http://7f2e61ad934395c8c848__cr.us:35a941b281fb6baf@premiumresidential.sigmaproxies.com:10000';
const customContent = fs.readFileSync('index.html', 'utf8');

const solveRecaptcha = async (url, sitekey,proxy) => {
    const proxyUrl = await proxyChain.anonymizeProxy(proxy);
    const browser = await puppeteer.launch({
        executablePath: '/usr/bin/google-chrome',
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', `--proxy-server=${proxyUrl}`],
        ignoreHTTPSErrors: true,

    });
    const page = await browser.newPage();
    const coustomContent2 = customContent.replace('your_site_key', sitekey);
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        if (request.url() === url)
            request.respond({
                code: 200,
                contentType: 'text/html',
                body: coustomContent2
            });
        else{
            console.log('Requesting: ' + request.url());
            request.continue();
        }
    });
    await page.goto(url);
    const recorder = await page.screencast({path: 'recording.webm'});
    await solver.waitForCaptcha(page);
    console.log('Solving recaptcha...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    await solver.solveRecaptcha(page);
    await page.screenshot({ path: 'is-recaptcha-solved.png' });
    const response = await page.evaluate(() => {
        return document.getElementById('g-recaptcha-response').value;
    });
    await recorder.stop();
    await proxyChain.closeAnonymizedProxy(proxyUrl, true);
    await browser.close()
    console.log(response);
    return response;
}

solveRecaptcha(url, sitekey,proxy);