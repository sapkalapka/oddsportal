import puppeteer from 'puppeteer'
import koa from 'koa'
import koaRouter from '@koa/router'
import fs from 'fs'

const app = new koa()
const router = new koaRouter()

router.post('/update', async ctx => {
  const start = async () => {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto('https://www.oddsportal.com/matches/soccer')

    const data = await page.evaluate(() => {
      const match = Array.from(document.querySelectorAll('#table-matches > table > tbody > tr[xeid] > td.name.table-participant')).map(x => x.textContent)
      const odds = Array.from(document.querySelectorAll('#table-matches > table > tbody > tr[xeid] > td.odds-nowrp')).map(x => x.textContent)
      let x = -3
      return (result = match.map(item => {
        x += 3
        return {
          match: item.trimStart(),
          odd1: odds[x],
          oddX: odds[x + 1],
          odd2: odds[x + 2],
        }
      }))
    })
    ctx.body = data
    fs.writeFile('data.json', JSON.stringify(data), 'utf-8', () => console.log(`Writing data.json`))
    await browser.close()
  }
  start()
})

app.use(router.routes())
app.use(router.allowedMethods())
app.listen(process.env.PORT || 3000, () => console.log(`App listening on: localhost:3000`))
