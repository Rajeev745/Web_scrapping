const puppeteer = require('puppeteer');
const fs = require("fs");

(async () => {
    const excel4node=require("excel4node")
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ["--start-maximized"]
    });
    const page = await browser.newPage();
    await page.goto('https://www.google.com');
    await page.waitForTimeout(3000)
    await page.type("input", "Espn cricinfo ipl 2021", { delay: "100" })
    
    // await page.waitForTimeout(1000)
    // await page.click("input.gNO89b")
    await page.evaluate(()=>{
        let btn = document.querySelector('input[name = "btnK"]') ;
        btn.click() ;
    })
    await page.waitForSelector("a[href='https://www.espncricinfo.com/series/ipl-2021-1249214']");
    await page.click("a[href='https://www.espncricinfo.com/series/ipl-2021-1249214']")

    await page.waitForSelector("a[href='/series/ipl-2021-1249214/match-results']")
    await page.click("a[href='/series/ipl-2021-1249214/match-results']")
    await page.waitForTimeout(3000)

    const result = await page.evaluate(() => {
        let array = []
        let arr = document.querySelectorAll(".match-info.match-info-FIXTURES");
        arr.forEach((ele) => {
            let teamName = ele.querySelectorAll("p.name")
            let teamName1 = teamName[0].innerText
            let teamName2 = teamName[1].innerText
            array.push({
                teamName1,
                teamName2
            })
            console.log(teamName);
        })
        return array;

    })


    await page.waitForTimeout(3000)

    let links = await page.evaluate(() => {
        let array = [];
        let arr = document.querySelectorAll(".match-info-link-FIXTURES");
        arr.forEach((ele) => {
            let url = ele.getAttribute("href");
            console.log(url);
            array.push(url);
        })
        return array;
    })
    await page.waitForTimeout(3000)

      let Storage=[];
    for (let i = 0; i < 1; i++) {
        let ctab = await browser.newPage();
        await ctab.goto(`https://www.espncricinfo.com${links[i]}`)
        await ctab.waitForTimeout(2000)
        let arrAns = await ctab.evaluate(() => {
            let event = document.querySelector(".event") ;
            let team1name = event.querySelectorAll("p.name")[0].innerText ;
            let team2name = event.querySelectorAll("p.name")[1].innerText ;
    
            // console.log(team1.innerText) ;
            // console.log(team2.innerText) ;
    
            let battingDoc = document.querySelectorAll("table.table.batsman") ;
            let bowlingDoc = document.querySelectorAll("table.table.bowler") ;
            // console.log(bowlingDoc) ;
            // console.log(battingDoc)
    
            let bowlerInfo = [];
            let batterInfo = [] ;
    
            bowlingDoc.forEach(ele=>{
                let tr = ele.querySelectorAll("tbody tr") ;
                let bowlingArr = [] ;
                // console.log(tr) ;
    
                for(let i = 0; i < tr.length; i++)
                {
                    let bowlerData = tr[i].querySelectorAll("td") ;
                    if(bowlerData.length != 1)
                    {
                        // console.log(bowlerData)
                        let name = bowlerData[0].innerText ;
                        let overs = bowlerData[1].innerText ;
                        let maiden = bowlerData[2].innerText ;
                        let run = bowlerData[3].innerText ;
                        let wicket = bowlerData[4].innerText ;
                        let economy = bowlerData[5].innerText ;
    
                        let data = {
                            bowlerName :name,
                            overs,
                            maiden,
                            run,
                            wicket,
                            economy
                        }
                        bowlingArr.push(data) ;
                    }
                    
                }
                bowlerInfo.push(bowlingArr) ;
                // console.log(bowlingArr)
            })
    
        
            
            
            battingDoc.forEach(ele=>{
                let tr = ele.querySelectorAll("tbody tr:nth-child(odd)") ;
                // console.log(tr) ;
                let battingArr = [];
    
                for(let i = 0; i < tr.length-1; i++)
                {
                    let batterData = tr[i].querySelectorAll("td") ;
                    
                    let name = batterData[0].innerText ;
                    // console.log(batterData) ;
                    let runScored = batterData[2].innerText ;
                    let balls = batterData[3].innerText ;
                    let strikeRate = batterData[7].innerText ;
    
                    let data = {
                        batterName: name,
                        runScored,
                        balls,
                        strikeRate
                    }
                    battingArr.push(data) ;
                }
                // console.log(battingArr) ;
                batterInfo.push(battingArr) ;
        
            })
    
            let eventData = [] ;
            let team1 = {
                name: team1name,
                batting: batterInfo[0],
                bowling: bowlerInfo[1]
            }
            let team2 = {
                name: team2name,
                batting: batterInfo[1],
                bowling: bowlerInfo[0]
            }
    
            eventData.push(team1) ;
            eventData.push(team2) ;
            console.log(eventData) ;


    
            // console.log(bowlerInfo) ;
            // console.log(batterInfo) ;
            return eventData ;
        })
    
        fs.writeFileSync(`./try1.json`,JSON.stringify(arrAns))
        
        await ctab.waitForTimeout(1000);
        await ctab.close();
    }
let wb=new excel4node.Workbook();
for(let i=0;i<1;i++){
    let tsheet=wb.addWorksheet(`matches${i+1}`);
    tsheet.cell(1,1).string(eventData.name)
    tsheet.cell(1,4).string(eventData.batting)
    tsheet.cell(1,7).string(eventData.bowling)
}
wb.write("./excel");
    

})()



