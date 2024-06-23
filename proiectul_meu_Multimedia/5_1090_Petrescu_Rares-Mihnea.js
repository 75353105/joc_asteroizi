let asteroids=[];
let spaceship;
const lives=3;
let score;
let scores=[];
let requiredPointsForExtraLife=2000;
let fallingStarsInterval;
let gameStarted=false;
let level;
let currentLives;
let text;
let textAlpha;
let highScore=0;
const canvas=document.getElementById("canvasJocAsteroids");
const context=canvas.getContext("2d");
const FPS=30;
const SHIP_SIZE=30;
const TURN_SPEED=360;
const SHIP_THRUST=5;
const FRICTION=0.7;
const ASTEROIDS_NUM=1;
const ASTEROID_SPEED=50;
const ASTEROID_SIZE=100;
const ASTEROID_VERT=10;
const ASTEROID_JAG=0.4;
const SHOW_CENTERE_DOT=false;
const SHOW_BUNDING=false;
const SHIP_EXPODE_TIME=0.3;
const SHIP_INVULNERABILITY_DURATION=3;
const SHIP_BLINK_DURATION=0.1;
const LASER_MAX=10;
const LASER_SPEED=500;
const LASER_DISTANCE=0.6;
const LASER_EXPLODE_DURATION=0.1;
const ASTEROID_POINTS=50;
const TEXT_SIZE=40;
const SAVE_KEY_SCORES="topScores";
let playerName='';

function getPlayerName(){
    return document.getElementById("inputNumeJucator").ariaValueMax;
}

function startGame(){
    document.getElementById("paginaDeStart").style.display='none';
    canvas.style.display='block';
    clearInterval(fallingStarsInterval);
    clearStars();
  

    spaceship=newSpaceShip();
    document.addEventListener('keydown',handleKeyDown);
    document.addEventListener('keyup',handleKeyUp);

    gameLoop();
}


function gameLoop(){
    level=0;
    currentLives=lives;
    score=0;
    scores=getHighScores();
    highScore=scores[0].score;
    newLevel()
    setInterval(update,1000/FPS);
   
}
function newLevel(){

    createAsteroidBelt();
}
function createAsteroidBelt(){
    asteroids=[];
    var x,y;
    for(var i=0;i<ASTEROIDS_NUM+level;i++){
        do{
        x=Math.floor(Math.random()*canvas.width);
        y=Math.floor(Math.random()*canvas.height);
        } while(distanceBetweenPoints(spaceship.x,spaceship.y,x,y)<ASTEROID_SIZE*2+spaceship.r);
        asteroids.push(newAsteroid(x,y));
    }
}
function newAsteroid(x,y){
    var lvlMult=1+0.1*level;
    var asteroid={
        x: x,
        y: y,
        xv:Math.random()*ASTEROID_SPEED*lvlMult/FPS*(Math.random() <0.5 ? 1 : -1),
        yv:Math.random()*ASTEROID_SPEED*lvlMult/FPS*(Math.random() <0.5 ? 1 : -1),
        r:ASTEROID_SIZE/2,
        a:Math.random()*Math.PI*2,
        missilesRequired:Math.floor(Math.random()*4)+1
    }
    
    return asteroid;

}
function destroyAsteroid(index){
    if(index>=0&&index<asteroids.length){
        if(asteroids[index].missilesRequired>1)
        {
            asteroids[index].missilesRequired--;
            score+=ASTEROID_POINTS;
        }
        else{
            score+=ASTEROID_POINTS;
            asteroids.splice(index,1);
        }   
    }
    if(score>highScore){
        highScore=score;
    }
    if(score>requiredPointsForExtraLife){
        currentLives++;
        requiredPointsForExtraLife+=2000;
    }

    //verificam daca trecem la un nou nivel
    if(asteroids.length==0){
        level++;
        newLevel();
    }
}
function handleAsteroidCollisions(){
    for(let i=0; i<asteroids.length;i++){
        for(let j=i+1;j<asteroids.length;j++){
            const asteroid1=asteroids[i];
            const asteroid2=asteroids[j];

            if(distanceBetweenAsteroids(asteroid1,asteroid2)<asteroid1.r+asteroid2.r){
                handleAsteroidCollision(asteroid1,asteroid2);
            }
        }
    }
}
function handleAsteroidCollision(asteroid1,asteroid2){
   const tempXV=asteroid1.xv;
   const tempYV=asteroid1.yv;

   asteroid1.xv=asteroid2.xv;
   asteroid1.yv=asteroid2.yv;

   asteroid2.xv=tempXV;
   asteroid2.yv=tempYV;
}
function distanceBetweenAsteroids(asteroid1,asteroid2){
    return Math.sqrt(Math.pow(asteroid2.x-asteroid1.x,2)+Math.pow(asteroid2.y-asteroid1.y,2))
}
function distanceBetweenPoints(x1,y1,x2,y2){
    return Math.sqrt(Math.pow(x2-x1,2)+Math.pow(y2-y1,2));
}
function explodeSpaceShip(){
    spaceship.explodeTime=Math.ceil(SHIP_EXPODE_TIME*FPS);
 
}
function newSpaceShip(){
    return {
        x:canvas.width/2,
        y:canvas.height/2,
        r:SHIP_SIZE/3,
        a:90/180*Math.PI,
        rot:0,
        explodeTime:0,
        thrusting:false,
        thrust:{
            x:0,
            y:0
        },
        blinkTime:Math.ceil(SHIP_BLINK_DURATION*FPS),
        blinkNum:Math.ceil(SHIP_INVULNERABILITY_DURATION/SHIP_BLINK_DURATION),
        canShoot:true,
        lasers:[],
        dead:false
    }
}
function launchMissle(){
    //cream laserul
    if(spaceship.canShoot&&spaceship.lasers.length<LASER_MAX){
        spaceship.lasers.push({
            x:spaceship.x+4/3*spaceship.r*Math.cos(spaceship.a),
            y:spaceship.y-4/3*spaceship.r*Math.sin(spaceship.a),
            xv:LASER_SPEED*Math.cos(spaceship.a)/FPS,
            yv:-LASER_SPEED*Math.sin(spaceship.a)/FPS,
            dist:0,
            explodeTime:0
        })
    }

    //prevenim impuscarea random
    spaceship.canShoot=false;
}
function drawLife(x,y,a){
    context.strokeStyle="red";
    context.lineWidth=SHIP_SIZE/20;
    context.beginPath();
    context.moveTo(
        x+4/3*spaceship.r*Math.cos(a),
        y-4/3*spaceship.r*Math.sin(a)
    );
    context.lineTo(
        x-spaceship.r*(2/3*Math.cos(a)+Math.sin(a)),
        y+spaceship.r*(2/3*Math.sin(a)-Math.cos(a))
    );
    context.lineTo(
        x-spaceship.r*(2/3*Math.cos(a)-Math.sin(a)),
        y+spaceship.r*(2/3*Math.sin(a)+Math.cos(a))
    );
    context.closePath();
    context.stroke();    

    
}
function handleKeyDown(/** @type {KeyboardEvent}   */ event){
    switch(event.key){
        case 'ArrowUp':
           spaceship.thrusting=true;
            break;

        case 'ArrowRight':
            spaceship.rot=-TURN_SPEED/180;
            break;
        case 'ArrowLeft':
           spaceship.rot=TURN_SPEED/180;
            break;
        case 'z':
            spaceship.rot=TURN_SPEED/180;
            break;
        case 'c':
            spaceship.rot=-TURN_SPEED/180;
            break;
        case 'x':
            launchMissle();
            break;

    }
}
function handleKeyUp(/** @type {KeyboardEvent}   */ event){
    switch(event.key){
        case 'ArrowUp':
            spaceship.thrusting=false;
            break;
        case 'ArrowRight':
            spaceship.rot=0;
            break;
        case 'ArrowLeft':
            spaceship.rot=0;
            break;
        case 'z':
            spaceship.rot=0;
            break;
        case 'c':
            spaceship.rot=0;
            break;
        case 'x':
            spaceship.canShoot=true;
            break;

    }
}

function update(){
    var blinkOn=spaceship.blinkNum%2==0;
    var exploding=spaceship.explodeTime>0;
    context.fillStyle="white";
    context.fillRect(0,0,canvas.width,canvas.height);

    //deplaseaza nava spatiala
    if(spaceship.thrusting){
        spaceship.thrust.x+=SHIP_THRUST*Math.cos(spaceship.a)/FPS;
        spaceship.thrust.y-=SHIP_THRUST*Math.sin(spaceship.a)/FPS;
    }
    else
    {
        spaceship.thrust.x-=FRICTION*spaceship.thrust.x/FPS;
        spaceship.thrust.y-=FRICTION*spaceship.thrust.y/FPS;
    }
     
    //deseneaza nava spatiala
    if(!exploding){
        if(blinkOn){
        context.strokeStyle="black";
        context.lineWidth=SHIP_SIZE/20;
        context.beginPath();
        context.moveTo(
            spaceship.x+4/3*spaceship.r*Math.cos(spaceship.a),
            spaceship.y-4/3*spaceship.r*Math.sin(spaceship.a)
        );
        context.lineTo(
            spaceship.x-spaceship.r*(2/3*Math.cos(spaceship.a)+Math.sin(spaceship.a)),
            spaceship.y+spaceship.r*(2/3*Math.sin(spaceship.a)-Math.cos(spaceship.a))
        );
        context.lineTo(
            spaceship.x-spaceship.r*(2/3*Math.cos(spaceship.a)-Math.sin(spaceship.a)),
            spaceship.y+spaceship.r*(2/3*Math.sin(spaceship.a)+Math.cos(spaceship.a))
        );
        context.closePath();
        context.stroke();
        }
        if(spaceship.blinkNum>0){
            spaceship.blinkTime--;

            if(spaceship.blinkTime==0){
                spaceship.blinkTime=Math.ceil(SHIP_BLINK_DURATION*FPS);
                spaceship.blinkNum--;
            }
        }
    }
    else{
        //deseneaza explozia
        context.fillStyle="orangered";
        context.beginPath();
        context.arc(spaceship.x,spaceship.y,spaceship.r*4,0,Math.PI*2,false);
        context.fill();
        context.fillStyle="orange";
        context.beginPath();
        context.arc(spaceship.x,spaceship.y,spaceship.r*3,Math.PI*2,false);
        context.fill();
        context.fillStyle="yellow";
        context.beginPath();
        context.arc(spaceship.x,spaceship.y,spaceship.r*2,0,Math.PI*2,false);
        context.fill();
        context.fillStyle="wheat";
        context.beginPath();
        context.arc(spaceship.x,spaceship.y,spaceship.r,0,Math.PI*2,false);
        context.fill();
    }

    //deseneaza laserele
    for( var i=0;i<spaceship.lasers.length;i++){
        if(spaceship.lasers[i].explodeTime==0){
        context.fillStyle="darkred";
        context.beginPath();
        context.arc(spaceship.lasers[i].x,spaceship.lasers[i].y,SHIP_SIZE/15,0,Math.PI*2,false);
        context.fill();
        }
        else
        if(spaceship.lasers[i].explodeTime>0){
        context.fillStyle="orangered";
        context.beginPath();
        context.arc(spaceship.lasers[i].x,spaceship.lasers[i].y,spaceship.r*1,0,Math.PI*2,false);
        context.fill();
        context.fillStyle="salmon";
        context.beginPath();
        context.arc(spaceship.lasers[i].x,spaceship.lasers[i].y,spaceship.r*0.75,0,Math.PI*2,false);
        context.fill();
        context.fillStyle="pink";
        context.beginPath();
        context.arc(spaceship.lasers[i].x,spaceship.lasers[i].y,spaceship.r*0.5,0,Math.PI*2,false);
        context.fill();
        }
    }

    //deseneaza vietile
    for(var i=0;i<currentLives;i++)
        drawLife(SHIP_SIZE+i*SHIP_SIZE*1.2,SHIP_SIZE,0.5*Math.PI);
    //deseneaza scorul actual
    context.textAlign="right";
    context.textBaseline="middle";
    context.fillStyle="darkgrey";
    context.font=TEXT_SIZE+"px dejavu sans mono";
    context.fillText(score.toString(),canvas.width-SHIP_SIZE/2,SHIP_SIZE);

    //deseneaza cel mai mare scor
    //console.log("Highscore: ", highScore);
    context.textAlign="center";
    context.textBaseline="middle";
    context.fillStyle="darkgrey";
    context.font=(TEXT_SIZE*0.75)+"px dejavu sans mono";
    context.fillText("HIGH SCORE: "+highScore.toString(),canvas.width/2,SHIP_SIZE);

    //detectam coliziunile laser cu asteroizi
    var ax,ay,ar,lx,ly,requiredMissles;
    for(var i=asteroids.length-1;i>=0;i--){

        //proprietatile asteroidului
        ax=asteroids[i].x;
        ay=asteroids[i].y;
        ar=asteroids[i].r;
        requiredMissles=asteroids[i].missilesRequired;

        //introducem laserele
        for(var j=spaceship.lasers.length-1;j>=0;j--){

            //proprietatile laserului
            lx=spaceship.lasers[j].x;
            ly=spaceship.lasers[j].y;

            //detectam loviturile
            if(spaceship.lasers[j].explodeTime==0 && distanceBetweenPoints(ax,ay,lx,ly)<ar){
                
                //spaceship.lasers.splice(j,1);

                //eliminam asteroidul
                destroyAsteroid(i);
                spaceship.lasers[j].explodeTime=Math.ceil(LASER_EXPLODE_DURATION*FPS);
                
                
            }
        }
      
    }
    

    //aria de coliziune a navei spatiale
    if(SHOW_BUNDING){
        context.StrokeStyle="lime";
        context.beginPath();
        context.arc(spaceship.x,spaceship.y,spaceship.r,0,Math.PI*2,false);
        context.stroke();
    }
    //gestioneaza iesirea din colturile canvasului a navei
    if(spaceship.x<0-spaceship.r){
        spaceship.x=canvas.width+spaceship.r;
    }
    else
    if(spaceship.x>canvas.width+spaceship.r){
        spaceship.x=0+spaceship.r;
    }
    if(spaceship.y<0-spaceship.r){
        spaceship.y=canvas.height+spaceship.r;
    }
    else
    if(spaceship.y>canvas.height+spaceship.r){
        spaceship.y=0+spaceship.r;
    }
    if(!exploding){
    //verificam coliziunile (cand nu exista explozii)
    if(spaceship.blinkNum==0){
    for(var i=0;i<asteroids.length;i++){
        if(distanceBetweenPoints(spaceship.x,spaceship.y,asteroids[i].x,asteroids[i].y)<spaceship.r+asteroids[i].r){
            explodeSpaceShip();
            destroyAsteroid(i);
            break;
        }
    }
    }

    //rotim nava spatiala
    spaceship.a+=(spaceship.rot*Math.PI)/180;
    //mutam nava spatiala
    spaceship.x+=spaceship.thrust.x;
    spaceship.y+=spaceship.thrust.y;
    }
    else
    {   //redu timpul de explozie
        spaceship.explodeTime--;
        //reseteaza nava dupa ce s-a terminat explozia
        if(spaceship.explodeTime==0){
            currentLives--;
            if(currentLives==0)
            {
                gameOver();
            }
            else
            spaceship=newSpaceShip();

        }
    }
    //mutam rachetele/laserele
    for(var i=spaceship.lasers.length-1;i>=0;i--){
            //verificam distantele
        if(spaceship.lasers[i].dist>LASER_DISTANCE*canvas.width){
            spaceship.lasers.splice(i,1);
            continue;
        }
        //gestionam explozia
        if(spaceship.lasers[i].explodeTime>0){
            spaceship.lasers[i].explodeTime--;

            if(spaceship.lasers[i].explodeTime==0){
                spaceship.lasers.splice(i,1);
                continue;
            }
        }
        else
        {
        spaceship.lasers[i].x+=spaceship.lasers[i].xv;
        spaceship.lasers[i].y+=spaceship.lasers[i].yv;

        //distanta parcursa
        spaceship.lasers[i].dist+=Math.sqrt(Math.pow(spaceship.lasers[i].xv,2)+Math.pow(spaceship.lasers[i].yv,2));
        }

        //tratam marginile
        if(spaceship.lasers[i].x<0){
            spaceship.lasers[i].x=canvas.width;
        }
        else
        if(spaceship.lasers[i].x>canvas.width){
            spaceship.lasers[i].x=0;
        }
        if(spaceship.lasers[i].y<0){
            spaceship.lasers[i].y=canvas.height;
        }
        else
        if(spaceship.lasers[i].y>canvas.height){
            spaceship.lasers[i].y=0;
        }
    }

    //asteroizi
    handleAsteroidCollisions();

    var x,y,a,reqiuredMissles;
    for(var i=0;i<asteroids.length;i++){
        context.strokeStyle="slategrey";
        context.lineWidth=SHIP_SIZE/20;
        x=asteroids[i].x;
        y=asteroids[i].y;
        a=asteroids[i].a;
        reqiuredMissles=asteroids[i].missilesRequired;
        context.beginPath();
    
        var radius=ASTEROID_SIZE/2+(reqiuredMissles-1)*10;
        context.arc(x,y,radius,0,Math.PI*2);
        var fontsize;

        if(reqiuredMissles==1){
            context.fillStyle="green";
            fontsize=10;
        }
        else if(reqiuredMissles==2){
            context.fillStyle="purple";
            fontsize=20;
        }
        else if(reqiuredMissles==3){
            context.fillStyle="orange";
            fontsize=30;
        }
        else if(reqiuredMissles==4){
            context.fillStyle="red";
            fontsize=40;
        }
        context.fill();
        context.closePath();
        context.stroke();

        context.fillStyle="aliceblue";
        context.font="bold "+fontsize+"px Arial";
        context.textAlign="center";
        context.textBaseline="middle";
        context.fillText(reqiuredMissles.toString(),x,y);
     

        if(SHOW_BUNDING){
            context.strokeStyle="blue";
            context.beginPath();
            context.arc(x,y,radius,0,Math.PI*2,false);
            context.stroke();
        }

        //gesetioneaza isirea din marginile canvasului ale asteroizilor
        asteroids[i].x+=asteroids[i].xv;
        asteroids[i].y+=asteroids[i].yv;
        if(asteroids[i].x<0-asteroids[i].r){
            asteroids[i].x=canvas.width+asteroids[i].r;
        }
        else
        if(asteroids[i].x>canvas.width+asteroids[i].r){
            asteroids[i].x=0-asteroids[i].r;
        }
        if(asteroids[i].y<0-asteroids[i].r){
            asteroids[i].y=canvas.height+asteroids[i].r;
        }
        else
        if(asteroids[i].y>canvas.height+asteroids[i].r){
            asteroids[i].y=0-asteroids[i].r;
        }

    }

}

function gameOver(){
    spaceship.dead=true;
    text="Joc terminat! Ai vrea sa mai incerci?";
    
    const textContainer=document.createElement("div");
    textContainer.innerHTML=text;
    textContainer.className="text-container";
    document.body.appendChild(textContainer);

    const retryButton=document.createElement("button");
    retryButton.innerHTML="Incearca din nou";
    retryButton.className="buton-reincearca";
    retryButton.addEventListener("click",startGame);
    document.body.appendChild(retryButton);

    const scoresButton=document.createElement("button");
    scoresButton.innerHTML="Vezi scorurile";
    scoresButton.className="buton-scoruri";
    scoresButton.addEventListener("click",arataIstoricul);
    document.body.appendChild(scoresButton);

    canvas.style.display="none";

    addTopScore(score);

}
function saveHighScores(scores){
    localStorage.setItem(SAVE_KEY_SCORES,JSON.stringify(scores));
}
function getHighScores(){
    const savedScores=localStorage.getItem(SAVE_KEY_SCORES);
    return savedScores? JSON.parse(savedScores):[]
}
function addTopScore(score){
    playerName=getPlayerName()
    const topScores=getHighScores();
    if(playerName=='')
        topScores.push({name:"necunoscut",score});
    else
    topScores.push({name:playerName,score});
    topScores.sort((a,b)=>b.score-a.score);
    topScores.splice(5);
    saveHighScores(topScores);
}
document.addEventListener("DOMContentLoaded",function(){
    fallingStarsInterval=setInterval(function(){
        stars();
    },100);
});

function stars(){
   if(gameStarted){
    return ;
   }
let e=document.createElement('div');
e.setAttribute('class','stea');
document.body.appendChild(e);
e.style.left=Math.random()*+innerWidth+'px';

setTimeout(function(){
    document.body.removeChild(e);
},5000);
}

function clearStars(){
    const existingStars=document.querySelectorAll('.stea');
    existingStars.forEach((star)=>{
        if(star.parentNode){
            star.parentNode.removeChild(star);
        }
    });
}
function arataIstoricul(){

    const paginaDeStart=document.getElementById("paginaDeStart");
   
    paginaDeStart.style.display='none';
    const topScores=getHighScores();
    const titleContainer=document.createElement("div");
    titleContainer.innerHTML="<h2>Cele mai bune 5 scoruri</h2>";
    titleContainer.className="title-container";
    document.body.appendChild(titleContainer);

    const scoresContainer=document.createElement("div");
    scoresContainer.className="scores-container";
    document.body.appendChild(scoresContainer);

    for(let i=0;i<topScores.length;i++){
        const scoreEntry=document.createElement("div");
        scoreEntry.innerHTML=`<span>${i+1}. ${topScores[i].name}  </span><span>${topScores[i].score}</span>`;
        scoresContainer.appendChild(scoreEntry);
    }

    const backButton=document.createElement("button");
    backButton.innerHTML="Inapoi";
    backButton.id="backButton";
    backButton.addEventListener("click",function(){
        titleContainer.remove();
        scoresContainer.remove();
        backButton.remove();
        paginaDeStart.style.display='block';
    })
    document.body.appendChild(backButton);
}