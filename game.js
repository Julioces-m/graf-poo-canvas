// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Clase Ball (Pelota)
class Ball {
    constructor(x, y, radius, speedX, speedY) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.speedX = speedX;
        this.speedY = speedY;
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.closePath();
    }
    move() {
        this.x += this.speedX;
        this.y += this.speedY;
        // Colisión con la parte superior e inferior
        if (this.y - this.radius <= 0 || this.y + this.radius >= canvas.height) {
            this.speedY = -this.speedY;
        }
    }
    reset() {
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.speedX = -this.speedX; // Cambia dirección al resetear
    }
}

// Clase Paddle (Paleta)
class Paddle {
    constructor(x, y, width, height, isPlayerControlled = false) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.isPlayerControlled = isPlayerControlled;
        this.speed = 5;
    }
    draw() {
        if (this.isPlayerControlled) {
            ctx.fillStyle = 'blue'; // Azul para la paleta del jugador
        } else {
            ctx.fillStyle = 'red'; // Rojo para la paleta de la IA
        }
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    move(direction) {
        if (direction === 'up' && this.y > 0) {
            this.y -= this.speed;
        } else if (direction === 'down' && this.y + this.height < canvas.height) {
            this.y += this.speed;
        }
    }
    // Movimiento de la paleta automática (IA)
    autoMove(ball) {
        if (ball.y < this.y + this.height / 2) {
            this.y -= this.speed;
        } else if (ball.y > this.y + this.height / 2) {
            this.y += this.speed;
        }
    }
}

// Clase Game (Controla el juego)
class Game {
    constructor() {
        this.score1 = 0; // Puntaje para el jugador 1
        this.score2 = 0; // Puntaje para el jugador 2
        this.player1ScoreDisplay = document.getElementById('player1Score');
        this.player2ScoreDisplay = document.getElementById('player2Score');

        this.balls = [new Ball(canvas.width / 2, canvas.height / 2, 10, 4, 4)];
        this.paddle1 = new Paddle(0, canvas.height / 2 - 50, 10, 100, true); // Controlado por el jugador
        this.paddle2 = new Paddle(canvas.width - 10, canvas.height / 2 - 50, 10, 100); // Controlado por la computadora
        this.keys = {}; // Para capturar las teclas
        this.difficulty = 'medium'; // Dificultad inicial
    }
    
    // Reset del puntaje y el juego
    resetGame() {
        this.score1 = 0;
        this.score2 = 0;
        this.player1ScoreDisplay.innerText = `Player 1: ${this.score1}`;
        this.player2ScoreDisplay.innerText = `Player 2: ${this.score2}`;
        this.balls = [new Ball(canvas.width / 2, canvas.height / 2, 10, 4, 4)];
    }

    // Dificultad de la IA
    setDifficulty() {
        switch (this.difficulty) {
            case 'easy':
                this.paddle2.speed = 2; // IA más lenta
                this.balls.forEach(ball => ball.speedX = 3); // Pelotas más lentas
                break;
            case 'medium':
                this.paddle2.speed = 5; // IA de dificultad media
                this.balls.forEach(ball => ball.speedX = 4); // Velocidad media
                break;
            case 'hard':
                this.paddle2.speed = 8; // IA más rápida
                this.balls.forEach(ball => ball.speedX = 6); // Pelotas más rápidas
                break;
        }
    }

    draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.balls.forEach(ball => ball.draw());
        this.paddle1.draw();
        this.paddle2.draw();

        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText(`Player 1: ${this.score1}`, 50, 30);
        ctx.fillText(`Player 2: ${this.score2}`, canvas.width - 150, 30);
    }

    update() {
        this.balls.forEach(ball => ball.move());

        if (this.keys['ArrowUp']) {
            this.paddle1.move('up');
        }
        if (this.keys['ArrowDown']) {
            this.paddle1.move('down');
        }

        const closestBall = this.balls.reduce((prev, curr) => {
            return (Math.abs(curr.y - this.paddle2.y) < Math.abs(prev.y - this.paddle2.y) ? curr : prev);
        });
        this.paddle2.autoMove(closestBall);

        this.balls.forEach(ball => {
            if (ball.x - ball.radius <= this.paddle1.x + this.paddle1.width &&
                ball.y >= this.paddle1.y &&
                ball.y <= this.paddle1.y + this.paddle1.height) {
                ball.speedX = -ball.speedX;
            }
            if (ball.x + ball.radius >= this.paddle2.x &&
                ball.y >= this.paddle2.y &&
                ball.y <= this.paddle2.y + this.paddle2.height) {
                ball.speedX = -ball.speedX;
            }

            if (ball.x - ball.radius <= 0) {
                this.score2++;
                this.player2ScoreDisplay.innerText = `Player 2: ${this.score2}`;
                ball.reset();
            }
            if (ball.x + ball.radius >= canvas.width) {
                this.score1++;
                this.player1ScoreDisplay.innerText = `Player 1: ${this.score1}`;
                ball.reset();
            }
        });
    }

    handleInput() {
        window.addEventListener('keydown', (event) => {
            this.keys[event.key] = true;
        });
        window.addEventListener('keyup', (event) => {
            this.keys[event.key] = false;
        });
    }

    run() {
        this.handleInput();
        const gameLoop = () => {
            this.update();
            this.draw();
            requestAnimationFrame(gameLoop);
        };
        gameLoop();
    }
}

// Instancia del juego
const game = new Game();

// Botón de reinicio
document.getElementById('resetBallButton').addEventListener('click', () => {
    game.resetGame();
});

// Selector de dificultad
document.getElementById('difficulty').addEventListener('change', (event) => {
    game.difficulty = event.target.value;
    game.setDifficulty(); // Cambiar dificultad
});

// Ejecutar juego
game.run();
