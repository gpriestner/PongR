"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const signalR = __importStar(require("../js/signalr/dist/browser/signalr.js")); //'../js/signalr/dist/browser/signalr.js';
class Snippet {
    constructor(fileName, size) {
        for (let i = 0; i < size; ++i)
            this.sound.push(Snippet.audio(fileName));
    }
    static sounds = [];
    static audio(src) {
        const a = new Audio(src);
        //a.volume = Sound.volume * (1 / Sound.maxVolume);
        Snippet.sounds.push(a);
        return a;
    }
    sound = [];
    count = 0;
    play() {
        this.sound[++this.count % this.sound.length].play();
    }
}
class Sound {
    // static batHit = new Snippet("./sounds/hit.mp3", 6);
    static hit = Snippet.audio("./sounds/hit.mp3");
    static pop = Snippet.audio("./sounds/pop.mp3");
    static over = Snippet.audio("./sounds/over.mp3");
    static bubble = Snippet.audio("./sounds/bubble.mp3");
    static bubble2 = Snippet.audio("./sounds/bubble2.mp3");
}
class GamePad {
    static isConnected = false;
    static current = null;
    static previous = null;
    static GamePad = (() => {
        addEventListener("gamepadconnected", (event) => {
            GamePad.current = navigator.getGamepads()[0];
            GamePad.previous = GamePad.current;
            GamePad.isConnected = true;
        });
        addEventListener("gamepaddisconnected", (event) => {
            GamePad.isConnected = false;
        });
    })();
    static update() {
        if (GamePad.isConnected) {
            GamePad.previous = GamePad.current;
            GamePad.current = navigator.getGamepads()[0];
        }
    }
    static isDown(button) {
        return GamePad.isConnected && GamePad.current.buttons[button].pressed;
    }
    static isPressed(button) {
        return (GamePad.isConnected &&
            GamePad.current.buttons[button].pressed &&
            !GamePad.previous.buttons[button].pressed);
    }
    static value(button) {
        if (!GamePad.isConnected)
            return 0;
        else
            return GamePad.current.buttons[button].value;
    }
    static get angle() {
        if (GamePad.isConnected) {
            const x = GamePad.current.axes[0];
            const y = GamePad.current.axes[1];
            if (!(x > -0.15 && x < 0.15 && y > -0.15 && y < 0.15)) {
                const ang = Math.atan2(y, x);
                return ang;
            }
        }
        return null;
    }
}
class KeyState {
    isPressed;
    isReleased;
    constructor(isPressed, isReleased) {
        this.isPressed = isPressed;
        this.isReleased = isReleased;
    }
}
class Keyboard {
    static Keyboard = (() => {
        addEventListener("keydown", Keyboard.keyDown);
        addEventListener("keyup", Keyboard.keyUp);
    })();
    static state = {};
    static keyDown(event) {
        const state = Keyboard.state[event.code];
        if (state === undefined)
            Keyboard.state[event.code] = new KeyState(true, true);
        else
            state.isPressed = true;
    }
    static keyUp(event) {
        const state = Keyboard.state[event.code];
        state.isPressed = false;
        state.isReleased = true;
    }
    static isDown(key) {
        // returns true while the key is in the down position
        const state = Keyboard.state[key];
        if (state === undefined)
            return false;
        else
            return state.isPressed;
    }
    static isPressed(key) {
        // returns true only once when first depressed
        // must be released and re-pressed before returning true again
        const state = Keyboard.state[key];
        if (state === undefined)
            return false;
        if (state.isPressed && state.isReleased) {
            state.isReleased = false;
            return true;
        }
        else
            return false;
    }
}
class RemoteKeyboard {
    init() {
        // map incoming events to keyDown and keyUp
    }
    state = {};
    keyDown(event) {
        const state = this.state[event.code];
        if (state === undefined)
            this.state[event.code] = new KeyState(true, true);
        else
            state.isPressed = true;
    }
    keyUp(event) {
        const state = this.state[event.code];
        state.isPressed = false;
        state.isReleased = true;
    }
    isDown(key) {
        // returns true while the key is in the down position
        const state = this.state[key];
        if (state === undefined)
            return false;
        else
            return state.isPressed;
    }
    isPressed(key) {
        // returns true only once when first depressed
        // must be released and re-pressed before returning true again
        const state = this.state[key];
        if (state === undefined)
            return false;
        if (state.isPressed && state.isReleased) {
            state.isReleased = false;
            return true;
        }
        else
            return false;
    }
}
class GameInput {
    constructor(keyboards) { }
    static get isPlayer1Up() {
        return Keyboard.isDown("KeyA") || GamePad.isDown(12 /* UpJoyPad */);
    }
    static get isPlayer1Down() {
        return Keyboard.isDown("KeyZ") || GamePad.isDown(13 /* DownJoyPad */);
    }
    static get isPlayer2Up() {
        return Keyboard.isDown("ArrowUp") || GamePad.isDown(3 /* Up */);
    }
    static get isPlayer2Down() {
        return Keyboard.isDown("ArrowDown") || GamePad.isDown(0 /* Down */);
    }
    static get isPaused() {
        return Keyboard.isPressed("KeyP") || GamePad.isPressed(9 /* Pause */);
    }
    static get isRestart() {
        return Keyboard.isPressed("KeyR") || GamePad.isPressed(8 /* Restart */);
    }
}
class Player {
    x = 0;
    y = 0;
    width = 5;
    height = 0;
    direction;
    score = 0;
    scoreX = 0;
    static speed = 1;
    constructor(direction) {
        this.direction = direction;
        this.height = Game.Canvas.height / 12;
        if (direction === 1) {
            this.x = 50;
            this.scoreX = Game.Canvas.width * 0.25;
        }
        else {
            this.x = Game.Canvas.width - 50;
            this.scoreX = Game.Canvas.width * 0.75;
        }
        this.y = (Game.Canvas.height / 2) - (this.height / 2);
    }
    update(progress, counter) {
        if (this.direction === 1) {
            if (this.y > 0 && GameInput.isPlayer1Up)
                this.y -= Player.speed;
            if (this.y < Game.Canvas.height - this.height && GameInput.isPlayer1Down)
                this.y += Player.speed;
        }
        else {
            if (this.y > 0 && GameInput.isPlayer2Up)
                this.y -= Player.speed;
            if (this.y < Game.Canvas.height - this.height && GameInput.isPlayer2Down)
                this.y += Player.speed;
        }
    }
    draw() {
        Game.View.fillRect(this.x, this.y, this.width, this.height);
        Game.View.fillText(this.score.toString(), this.scoreX, 80);
    }
    get batRect() {
        return {
            left: this.x,
            right: this.x + this.width,
            top: this.y,
            bottom: this.y + this.height,
        };
    }
    isHit(ball) {
        const bat = this.batRect;
        return (ball.x >= bat.left &&
            ball.x <= bat.right &&
            ball.y >= bat.top &&
            ball.y <= bat.bottom);
    }
    get middleY() {
        return this.y + this.height * 0.5;
    }
}
class Ball {
    x = 0;
    y = 0;
    width = 5;
    height = 5;
    dx = 0;
    dy = 0;
    isDead = false;
    deadCount = 0;
    winner = null;
    constructor(player) {
        this.x = player.x;
        this.y = player.y + player.height * 0.5;
        this.dx = 5 * player.direction;
        this.dy = 10 * (Math.random() - 0.5);
    }
    update(progress, counter) {
        if (this.isDead) {
            if (counter === 1 && ++this.deadCount > 100) {
                this.reset(this.winner);
            }
        }
        else {
            const dx = this.dx * progress;
            const dy = this.dy * progress;
            const x = this.x + dx;
            const y = this.y + dy;
            // detect winning ball (ball goes off left/right edge)
            if (x < 0 || x > Game.Canvas.width - this.width) {
                Sound.over.play();
                this.isDead = true;
                if (x < 0) {
                    this.winner = game.player2;
                    game.player2.score += 1;
                }
                else {
                    this.winner = game.player1;
                    game.player1.score += 1;
                }
            }
            // detect bounce off top/bottom
            if (y < 0 || y > Game.Canvas.height - this.height) {
                this.dy = -this.dy;
                Sound.pop.play();
            }
            // detect bounce off both bats
            if (this.dx > 0) {
                // detect bounce off right bat
                if (game.player2.isHit(game.ball.middleRight)) {
                    this.dx = -this.dx;
                    // calc dy for new angle of ball
                    const paddleLevel = (this.middleY - game.player2.middleY) / game.player2.height;
                    this.dy = paddleLevel * 10;
                    Sound.bubble.play();
                }
            }
            else {
                // detect bounce off left bat
                if (game.player1.isHit(game.ball.middleLeft)) {
                    this.dx = -this.dx;
                    // calc dy for new angle of ball
                    const paddleLevel = (this.middleY - game.player1.middleY) / game.player1.height;
                    this.dy = paddleLevel * 10;
                    Sound.bubble.play();
                }
            }
            this.x += this.dx * progress;
            this.y += this.dy * progress;
        }
    }
    draw() {
        // draw ball
        if (!this.isDead) {
            Game.View.fillRect(this.x, this.y, this.width, this.height);
        }
        // draw dashed centre line
        const halfWay = Game.Canvas.width * 0.5;
        Game.View.strokeStyle = "white";
        Game.View.beginPath();
        Game.View.setLineDash([10, 10]);
        Game.View.moveTo(halfWay, 0);
        Game.View.lineTo(halfWay, Game.Canvas.height);
        Game.View.stroke();
    }
    get middleRight() {
        return { x: this.x + this.width, y: this.y + this.height * 0.5 };
    }
    get middleLeft() {
        return { x: this.x, y: this.y + this.height * 0.5 };
    }
    get middleY() {
        return this.y + this.height * 0.5;
    }
    reset(player) {
        this.isDead = false;
        this.deadCount = 0;
        // this.x = player!.x;
        this.x = Game.Canvas.width / 2 - (this.width / 2);
        this.y = player.y + player.height * 0.5;
    }
}
class Game {
    static Canvas = document.querySelector("canvas");
    static View = Game.Canvas.getContext("2d");
    static Game = (() => {
        addEventListener("resize", Game.resize);
    })();
    #previousTimestamp = 0;
    static isPaused = false;
    static resize() {
        game.start();
    }
    static get height() {
        return Game.Canvas.height;
    }
    static get width() {
        return Game.Canvas.width;
    }
    // game objects
    player1 = null;
    player2 = null;
    ball = null;
    update() {
        GamePad.update();
        if (GameInput.isPaused) {
            Game.isPaused = true;
            return;
        }
        const totalUpdates = 5;
        let counter = 1;
        const progress = 1 / totalUpdates;
        while (counter <= totalUpdates) {
            this.player1?.update(progress, counter);
            this.player2?.update(progress, counter);
            this.ball?.update(progress, counter);
            counter += 1;
        }
        this.draw();
    }
    draw() {
        // clear the screen
        const height = Game.Canvas.height;
        const width = Game.Canvas.width;
        Game.View.clearRect(0, 0, width, height);
        // draw all game objects
        this.player1.draw();
        this.player2.draw();
        this.ball.draw();
    }
    step(timestamp) {
        if (GameInput.isRestart) {
            Game.isPaused = false;
            game = new Game();
            game.start();
        }
        if (Game.isPaused) {
            // check for resume
            GamePad.update();
            if (GameInput.isPaused)
                Game.isPaused = false;
        }
        else {
            const framesPerSecond = 30;
            const delay = 1000 / (framesPerSecond + 1);
            const elapsed = timestamp - this.#previousTimestamp;
            if (elapsed > delay) {
                this.update();
                this.#previousTimestamp = timestamp;
            }
        }
        requestAnimationFrame(Game.animate);
    }
    start() {
        Game.Canvas.height = window.innerHeight;
        Game.Canvas.width = window.innerWidth;
        // start/setup logic
        Game.View.font = "40px Lucida Console";
        Game.View.fillStyle = "white";
        this.player1 = new Player(1);
        this.player2 = new Player(-1);
        this.ball = new Ball(this.player1);
        requestAnimationFrame(Game.animate);
    }
    static animate = (timestamp) => game.step(timestamp);
}
// debugger;
var connection = new signalR.HubConnectionBuilder().withUrl("/ponghub").build();
var game = new Game();
game.start();
// connection.close();
//# sourceMappingURL=game.js.map