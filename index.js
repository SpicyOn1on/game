
const appl = PIXI.Application

let keys = {}
let keysDiv

const app = new appl({
    width: innerWidth,
    height: innerHeight
})

app.renderer.backgroundColor = 0x2d740d
app.renderer.view.style.position = 'absolute'
document.body.appendChild(app.view)
const Graphics = PIXI.Graphics

// чтобы не так грустно на фон смотреть было
const tileset2Texture = PIXI.Texture.from('./assets/tileset2.png')
const tileset2 = new PIXI.Sprite(tileset2Texture)
tileset2.position = {
    x: (innerWidth * 0.6) * Math.random(),
    y: (innerHeight * 0.6) * Math.random()
}
tileset2.anchor.set(0.5)
app.stage.addChild(tileset2)

const charTextrue = PIXI.Texture.from('./assets/Player.png')
const playerHandTexture = PIXI.Texture.from('./assets/player hand.png')
const charSprite = new PIXI.Sprite(charTextrue)
const playerHand = new PIXI.Sprite(playerHandTexture)
const player = charSprite
let playerSpeed = 5
player.anchor.set(0.5)
playerHand.anchor.set(0.5)
player.position = {
    x: innerWidth / 2,
    y: innerHeight / 2
}
playerHand.position = player.position

// главные переменные
let playerHP = 20
let score = 0



app.stage.addChild(charSprite)
app.stage.addChild(playerHand)

const keysDown = (e) => {
    keys[e.keyCode] = true
    console.log(e.keyCode)

    if (keys[17]) {
        app.ticker.stop()
        console.log('пауза')
    }
    if (keys[16]) {
        console.log('старт')
        app.ticker.start()
    }
}
const keysUp = (e) => {
    keys[e.keyCode] = false
}

window.addEventListener("keydown", keysDown)
window.addEventListener("keyup", keysUp)

document.querySelector("#gameDiv").appendChild(app.view)
keysDiv = document.querySelector("keys")
app.stage.interactive = true

const movementLoop = (delta) => {
    keysDiv = JSON.stringify(keys)
    // movement
    if (keys[87]) {
        player.y -= playerSpeed
    }
    if (keys[83]) {
        player.y += playerSpeed
    }
    if (keys[68]) {
        player.x += playerSpeed
    }
    if (keys[65]) {
        player.x -= playerSpeed
    }
    if (keys[32]) {
        app.ticker.stop(movementLoop)
    }
    playerHand.position = player.position
}
app.ticker.add(movementLoop)


//player angle

app.renderer.view.onmousemove = (mousePos) => {
    let angle = Math.atan2(mousePos.y - player.y,
        mousePos.x - player.x) + (Math.PI * 2);
    playerHand.rotation = angle
}

// пули

const bulletTexture = PIXI.Texture.from('./assets/bullet.png')

let bullets = []
let bulletspeed = 10


const bulletShot = (e) => {
    let bullet = bulletSpawn()
    bullets.push(bullet)

}

const bulletSpawn = () => {
    const bulletSprite = new PIXI.Sprite(bulletTexture)
    let bullet = bulletSprite
    bullet.x = player.x
    bullet.y = player.y
    bullet.anchor.set(0.5)
    bullet.speed = bulletspeed
    angle = playerHand.rotation
    app.stage.addChild(bullet)

    return bullet
}
const updateBullets = () => {


    for (let i = 0; i < bullets.length; i++) {
        bullets[i].position.x += Math.cos(angle) * bulletspeed;
        bullets[i].position.y += Math.sin(angle) * bulletspeed;
        bullets[i].rotation = angle
        if (bullets[i].position.x > innerWidth || bullets[i].position.y > innerHeight ||
            bullets[i].position.x < 0 || bullets[i].position.y < 0) {
            bullets[i].dead = true
        }
    }
    for (let i = 0; i < bullets.length; i++) {
        if (bullets[i].dead) {
            app.stage.removeChild(bullets[i])
            bullets.splice(i, 1)
        }
    }

}

app.ticker.add(updateBullets)
document.querySelector("#gameDiv").addEventListener("pointerdown", bulletShot)

// enemies 

const enemyTexture = PIXI.Texture.from('./assets/enemy1.PNG')

let enemySpeed = 2
let enemyArray = []
let enemyAngle
let enemyCap = 1

const randomEnemySpawn = () => {
    const enemySprite = new PIXI.Sprite(enemyTexture)
    let enemy = enemySprite
    enemy.anchor.set(0.5)

    let sideDecider = 4 * Math.random() // 1 = top,  2 = right,  3 = bottom,  4 = left
    sideDecider = Math.ceil(sideDecider) // Math.ceil() округление
    if (sideDecider == 1) {
        enemy.x = (innerWidth - 50) * Math.random()
        enemy.y = 20
    }
    if (sideDecider == 2) {
        enemy.x = innerWidth - 50
        enemy.y = innerHeight * Math.random()
    }
    if (sideDecider == 3) {
        enemy.x = innerWidth * Math.random()
        enemy.y = innerHeight - 50
    }
    if (sideDecider == 4) {
        enemy.x = 20
        enemy.y = innerHeight * Math.random()
    }
    app.stage.addChild(enemy)
    enemy.getBounds()

    app.ticker.add(() => {
        let enemyAngle = Math.atan2(player.x - enemy.x, player.y - enemy.y) + Math.PI * 2;
        enemy.x += Math.sin(enemyAngle) * enemySpeed
        enemy.y += Math.cos(enemyAngle) * enemySpeed

    })
    return enemy
}

let spawnInterval = 1

const updateEnemy = () => {
    if (enemyArray.length <= enemyCap) {
        const enemyInterval = setInterval(() => {
            let enemy = randomEnemySpawn()
            enemyArray.push(enemy)
            if (enemyArray.length >= enemyCap) {
                window.clearInterval(enemyInterval)
            }
        }, spawnInterval)
    }
}


app.ticker.add(() => {
    let playerHB = player.getBounds()
    playerHB.position = player.position
    updateEnemy()
    if (enemyArray.length == 0) {
        updateEnemy()
        enemyCap++
    }

    if (enemyArray.length >= 1) {
        for (let i = 0; i < enemyArray.length; i++) {
            let enemyHB = enemyArray[i].getBounds()
            if (playerHB.x + playerHB.width >= enemyHB.x && playerHB.x <= enemyHB.x + enemyHB.width &&
                playerHB.y + playerHB.height >= enemyHB.y && playerHB.y <= enemyHB.y + enemyHB.height) {
                enemyArray[i].dead = true
                console.log('player got hit')
                playerHP--
                console.log(playerHP)
                if (enemyArray[i].dead) {
                    app.stage.removeChild(enemyArray[i])
                    enemyArray.splice(i, 1)
                }

            }
            for (let b = 0; b < bullets.length; b++) {
                if (bullets.length >= 1) {
                    let bulletHB = bullets[b].getBounds()
                    if (bulletHB.x + bulletHB.width >= enemyHB.x && bulletHB.x <= enemyHB.x + enemyHB.width &&
                        bulletHB.y + bulletHB.height >= enemyHB.y && bulletHB.y <= enemyHB.y + enemyHB.height) {
                        bullets[b].dead = true
                        enemyArray[i].dead = true
                        if (enemyArray[i].dead) {
                            app.stage.removeChild(enemyArray[i])
                            enemyArray.splice(i, 1)
                            score++
                            console.log(score)
                        }
                        let randomPlus = 8 * Math.random()
                        randomPlus = Math.ceil(randomPlus)
                        if (randomPlus == 8) {
                            enemyCap++

                            console.log('cap increased')
                        }
                    } // я понятия не имею почему ВСЁ ЭТО работает, но как то явно заработало 
                }
            }
        }

    }


}
)


// Текст - счет - хп игрока
const scoreStyle = new PIXI.TextStyle({
    fontFamily:'Arial',
    fontSize: 48,
    fill:'white',
    stroke:'#000000',
    strokeThickness: 2
})
const hpStyle = new PIXI.TextStyle({
    fontFamily:'Arial',
    fontSize: 24,
    fill:'green',
    stroke:'#ffffff',
    strokeThickness: 4
})

const scoreText = new PIXI.Text(score,scoreStyle)
app.stage.addChild(scoreText)
scoreText.x = innerWidth / 2

const playerHPtext = new PIXI.Text(playerHP, hpStyle)
app.stage.addChild(playerHPtext)
playerHPtext.anchor.set(0.5)



const textUpdater = () => {
    playerHPtext.position = {
        x:player.position.x,
        y:player.position.y + 40
    }
    playerHPtext.text = playerHP
    scoreText.text = score
}
app.ticker.add(textUpdater)
// конец игры

const gameover = () => {
    if (playerHP == 0) {
        alert('Вы погибли')
        app.stage.removeChild(player, playerHand)
        alert('Ваш счёт ' + score)
        playerHP = -1
        app.stage.destroy()
    }
}
app.ticker.add(gameover)