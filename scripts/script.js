/* variables */
var DIR_LEFT  = 0;
var DIR_RIGHT = 1;
var DIR_UP    = 2;
var DIR_DOWN  = 3;


/* load enchant.js */
enchant();

window.onload = function() {    
    var game = new Game(480, 320);
    game.fps = 24;
    game.preload('images/exmap0.png');//preload map
    game.preload('images/icon0.png');//preload icons
    game.preload('images/space3.png',
                'images/heroWalk/h1.png','images/heroWalk/h2.png','images/heroWalk/h3.png',
                'images/heroWalk/h4.png','images/heroWalk/h5.png','images/heroWalk/h6.png',
                'images/heroWalk/h7.png','images/heroWalk/h8.png','images/heroWalk/h9.png',
                'images/heroWalk/h10.png');//preload characters
    game.preload('images/NPCtile/village_inn.png','images/NPCtile/village_weapon.png',
                'images/NPCtile/village_item.png','images/NPCtile/odin.png');//preload NPC tiles
    game.preload('sounds/effect/bubble.wav','sounds/effect/beforefight.wav','sounds/effect/combat.wav',
                'sounds/effect/mapchange.wav');//preload musics and sounds effect
    game.preload('avatarBg1.png','avatarBg2.png','avatarBg3.png','images/monster/bigmonster1.gif');//preload battle backgrounds
    game.preload('images/monster/monster1.gif','images/monster/monster2.gif','images/monster/monster3.gif',
                'images/monster/monster4.gif','images/monster/monster5.gif','images/monster/monster6.gif',
                'images/monster/monster7.gif','images/monster/bigmonster1.gif','images/monster/bigmonster2.gif');//preload monsters
    game.preload('images/attackbtn.png');

    
    var Attacker = enchant.Class.create(Avatar, {
    initialize : function(code){
      Avatar.call(this, code);
      this.left();
      this.animPattern['specialAttack'] = [6, 6, 6, 9, 5, 5,13,10,11,10,11, 5,13, 9,13,14,15,15, 8, 8,-1];
      this.command = '';
      this.targetEnemy = '';
      this.inputCount = game.fps;
      this.hp = 200;
      this.energy = 0;
      this.addEventListener(enchant.Event.ENTER_FRAME, this.onEnterFrame);
    },

    onEnterFrame : function(){
      if(this.x === -this.width || this.action === 'dead') this.tl.delay(2).then(function(){ game.popScene(); });
      if(this.inputCount > 0 && this.action === 'stop') this.inputCount--;
      if(this.hp < 1 && this.action === 'stop') this.action = 'dead';
      if(!this.command) return;
      var target = this.targetEnemy;
      switch(this.command){
        case 'attack' :
          this.action = 'attack';
          this.energy += 20;
          this.tl.moveTo(target.x + target.width, target.y + target.height - this.height, 3);//move to enemy
          this.tl.delay(24).moveTo(this.positionX, this.positionY, 1);//moveback
          target.tl.delay(15).then(function(){
            var damage = rand(50) + 50;
            game.currentScene.addChild(new Damage(target.x + target.width / 2, target.y, target.height - 16, damage));
            this.hp -= damage;
          });
        break;
        case 'specialAttack' :
          this.action = 'specialAttack';
          this.energy = 0;
          this.tl.moveTo(target.x + target.width, target.y + target.height - this.height, 3);
          this.tl.delay(58);
          this.tl.moveBy(-target.width*2, 0, 3).delay(game.fps);
          this.tl.moveTo(this.positionX, this.positionY, 1);          
          target.tl.delay(64);
          target.tl.then(function(){
            var damage = rand(200) + 400;
            game.currentScene.addChild(new Damage(target.x + target.width / 2, target.y, target.height - 16, damage));
            this.hp -= damage;
          });
        break;
        case 'win' :
          this.tl.delay(game.fps / 2).moveBy(0, -32, 3).moveBy(0, 32, 3);
          this.tl.then(function(){ this.action = 'run'; }).moveTo(-this.width, this.positionY, game.fps);
          victory();
          game.popScene(); //quit the combat
        break;
    default : break;
      }
      this.command = this.targetEnemy = '';
    }
  });

  victory=function(){
    $.ajax({
        url : 'scripts/php/combatVic.php',
        type : 'POST',
        dataType:'json',
        success : function(data) {
        console.log(data);
        //increase exp by 10                            
        }
    });
  };

  var Damage = enchant.Class.create(MutableText, {
      initialize : function(x, y, height, val){
        MutableText.call(this, x, y);
        this.text = "" + val;
        this.tl.moveBy(0, height, game.fps / 2, BOUNCE_EASEOUT).delay(game.fps / 2).removeFromScene();
      }
    });

  var Bar = enchant.Class.create(Entity, {
      initialize : function(x, y, width, height, color){
        Entity.call(this);
        this.width = this.maxWidth = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.value = 1;
        this.backgroundColor = color;
        var background = new Entity();
        background.width = width;
        background.height = height;
        background.x = x;
        background.y = y;
        background.backgroundColor = '#000000';
        this.addEventListener(enchant.Event.ENTER_FRAME, function(){
          this.width = this.maxWidth * this.value;
          background.x = this.x;
          background.y = this.y;
         });
        //game.currentScene.addChild(background);
        game.currentScene.addChild(this);
      }
    });

  var Player = enchant.Class.create(Sprite, {
    initialize: function(map) {
      enchant.Sprite.call(this, 32, 48);
      this.map = map;
      this.x = 18 * 16 - 8;
      this.y = 15 * 16;        

      this.isMoving = false;
      this.direction = 0;
      this.walk = 1;
      
      this.addEventListener('enterframe', function() {
      var game = enchant.Game.instance;
      this.frame = this.direction * 3 + this.walk;
            if (this.isMoving) {
                this.moveBy(this.vx, this.vy);
 
                if (true) {
                    this.walk++;
                    this.walk %= 3;
                }
                if ((this.vx && (this.x-8) % 16 == 0) || (this.vy && this.y % 16 == 0)) {
                    this.isMoving = false;
                    this.walk = 1;
                }
            } 
            else {
                this.vx = this.vy = 0;
                if (game.input.left) {
                    this.direction = 1;
                    this.vx = -4;
                } else if (game.input.right) {
                    this.direction = 2;
                    this.vx = 4;
                } else if (game.input.up) {
                    this.direction = 3;
                    this.vy = -4;
                } else if (game.input.down) {
                    this.direction = 0;
                    this.vy = 4;
                }
                if (this.vx || this.vy) {
                    var x = this.x + (this.vx ? this.vx / Math.abs(this.vx) * 16 : 0) + 16;
                    var y = this.y + (this.vy ? this.vy / Math.abs(this.vy) * 16 : 0) + 32;
                    if (0 <= x && x < map.width && 0 <= y && y < map.height && !map.hitTest(x, y)) {
                        this.isMoving = true;
                        arguments.callee.call(this);
                    }
                }
            }
      });
    }
  });
    

    game.onload = function() { 
        var map = new Map(16, 16);
        map.image = game.assets['images/exmap0.png'];
        map1(map);

        game.sound1 = game.assets['sounds/effect/bubble.wav'];
        game.sound2 = game.assets['sounds/effect/beforefight.wav']; 
        game.sound3 = game.assets['sounds/effect/combat.wav'];   
        game.sound4 = game.assets['sounds/effect/mapchange.wav'];      

        //get user's info from database
        playerStat = function(){
          $.ajax({
              url : 'scripts/php/userstat.php',
              type : 'POST',
              dataType:'json',
              success : function(data) {
              game.playerImage(player,data);                
              }
          });
        };

        //set user's image
        game.playerImage = function(player,data){            
            player.image = game.assets['images/heroWalk/h'+ data[0].class +'.png'];            
        }

        var player = new Player(map);
        playerStat();
        
        game.nameLabel = function(data){
            player.login_name = new Label(data[0].name);
            player.login_name.textAlign = 'center';
            player.login_name.width = 100;
            player.login_name.color = 'black';
            player.login_name.x = this.x - 35;
            player.login_name.y = this.y + 32;
            stage.addChild(player.login_name);
        }
        
        //sending current position to database
        game.updatePos = function(){
            xpos = player.x;
            ypos = player.y;
            //console.log(xpos+":"+ypos);
            $.ajax({
                url : 'scripts/php/updatePos.php',
                type : 'POST',
                data : {xposition:xpos,yposition:ypos},
                dataType:'json',
                success : function(data) {
                    console.log(data);
                }
            });
        }

        //the combat Scene of monster 1
        game.combatScene1 = function(){            
            var scene = new Scene();            
            scene.backgroundColor = '#000000';
            var background = new AvatarBG(1);
            background.y = 32;
            scene.addChild(background);

            //change attackerModel based on classes
            game.attackerModel = function(){
              $.ajax({
                  url : 'scripts/php/userstat.php',
                  type : 'POST',
                  dataType:'json',
                  success : function(data) {
                    //console.log(data);
                    game.attackerCode(attacker,data); 
                    scene.addChild(attacker);                                 
                  }
              });
            };

            //set user's attack model
            game.attackerCode = function(attacker,data){                
                     if(data[0].class==1)attacker.setCode('1:4:3:2002:21680:2200');
                else if(data[0].class==2)attacker.setCode('2:8:1:2002:21290:2209');
                else if(data[0].class==3)attacker.setCode('1:4:3:2039:21240:22940');
                else if(data[0].class==4)attacker.setCode('2:5:0:2039:21146:2222');
                else if(data[0].class==5)attacker.setCode('1:1:3:2017:21003:2227');
                else if(data[0].class==6)attacker.setCode('2:1:0:2017:21630:2227');
                else if(data[0].class==7)attacker.setCode('1:7:3:2527:21002:22680');
                else if(data[0].class==8)attacker.setCode('2:8:3:2527:21002:22680');
                else if(data[0].class==9)attacker.setCode('1:5:2:2093:21600:22470');
                else if(data[0].class==10)attacker.setCode('2:3:5:2093:21256:2223');
                else                      attacker.setCode('2:8:1:2002:21290:0');
            };

            var attacker = new Attacker(); 
            game.attackerModel();
            attacker.x = 320;
            attacker.y = attacker.positionY = 100;
            attacker.positionX = 320;
            attacker.tl.moveX(attacker.positionX, game.fps / 4);            

            //add lifeBar
            var lifeBar = new Bar(attacker.x, attacker.y + 58, 64, 4, '#00FF80');
            lifeBar.addEventListener(enchant.Event.ENTER_FRAME, function(){
              this.x = attacker.x;
              this.y = attacker.y + 58;
              this.value = Math.max(Math.min(attacker.hp / 200, 1), 0);
            });
            scene.addChild(lifeBar);

            //add energyBar
            var energyBar = new Bar(attacker.x, attacker.y + 62, 64, 4, '#FF0000');
            energyBar.addEventListener(enchant.Event.ENTER_FRAME, function(){
              this.x = attacker.x;
              this.y = attacker.y + 62;
              this.value = Math.max(Math.min(attacker.energy / 100, 1), 0);
              this.backgroundColor = (this.value > 0.8) ? '#FFFFFF' : '#FF0000';
            });
            scene.addChild(energyBar);

            var enemy = new AvatarMonster(game.assets['images/monster/monster7.gif']);
            enemy.x = -enemy.width;
            enemy.y = 110;
            enemy.scaleX = -1;
            enemy.tl.moveX(80, game.fps / 4);
            enemy.hp = 600;
            enemy.inputCount = game.fps*2;//wait time before first attack
            enemy.addEventListener(enchant.Event.ENTER_FRAME, function(){
              if(this.hp < 1) this.action = 'disappear';
              if(this.action === 'stop' && attacker.action === 'stop') this.inputCount--;
              if(this.inputCount < 1){
                this.tl.moveTo(attacker.x - attacker.width, attacker.y + attacker.height - attacker.height, 6);                
                this.tl.fadeTo(0, 2).fadeTo(1, 2).fadeTo(0, 2).fadeTo(1, 2).then(function(){this.action = 'attack';});
                this.tl.delay(24).moveTo(this.x, this.y, 1);
                this.inputCount = game.fps * 6;
                attacker.tl.delay(8).then(function(){
                  this.action = 'damage';
                  var damage = rand(30)+10;
                  scene.addChild(new Damage(this.x + this.width / 2, this.y, this.height - 16, damage));
                  this.hp -= damage;
                  this.energy += damage / 2;
                });
              }
            });

            enemy.addEventListener(enchant.Event.REMOVED_FROM_SCENE, function(){
              attacker.command = 'win';
              command.visible = false;
            });
            scene.addChild(enemy);

            var command = new Group();
            command.x = 140;
            command.y = 320;
            command.addEventListener(enchant.Event.ENTER_FRAME, function(){
              if(attacker.inputCount === 0 && enemy.action === 'stop'){
                this.tl.moveTo(this.x, 218, 3);
                attacker.inputCount = -1;
              }
            });
            scene.addChild(command);
            var commandButton = [];
            var temp = ['attack', 'specialAttack'];
            for(var i = 0;i < 2;i++){
              commandButton[i] = new Sprite(180, 48);
              commandButton[i].x = 0;
              commandButton[i].y = i * 50;
              commandButton[i].image = game.assets['images/attackbtn.png'];
              commandButton[i].frame = i;
              commandButton[i].command = temp[i];
              commandButton[i].addEventListener(enchant.Event.TOUCH_END, function(){
                if(enemy.action !== 'stop' || attacker.action !== 'stop') return;
                this.touchEnabled = false;
                this.tl.delay(6).then(function(){ this.touchEnabled = true; });
                this.parentNode.tl.moveY(320, 2);
                attacker.targetEnemy = enemy;
                attacker.command = this.command;
                attacker.inputCount = this.command.length * 10;
              });
              command.addChild(commandButton[i]);
            }
            //special is visible if attacker has energy >80
            commandButton[1].addEventListener(enchant.Event.ENTER_FRAME, function(){
              this.visible = (attacker.energy > 80) ? true : false;
            }); 

            var returnLabel = new Label('Escape');
            returnLabel.y = 5;
            returnLabel.x = 400;
            returnLabel.color = "white";
            scene.addChild(returnLabel);
            returnLabel.addEventListener('touchend',function(){
                game.popScene();
            })
            //scene.scaleX = 1.1;
            //scene.scaleY = 1.1;
            return scene;
        }

        //the combat Scene of monster 2
        game.combatScene2 = function(){            
            var scene = new Scene();            
            scene.backgroundColor = '#000000';
            var background = new AvatarBG(1);
            background.y = 32;
            scene.addChild(background);

            //change attackerModel based on classes
            game.attackerModel = function(){
              $.ajax({
                  url : 'scripts/php/userstat.php',
                  type : 'POST',
                  dataType:'json',
                  success : function(data) {
                    //console.log(data);
                    game.attackerCode(attacker,data); 
                    scene.addChild(attacker);                                 
                  }
              });
            };

            //set user's attack model
            game.attackerCode = function(attacker,data){                
                     if(data[0].class==1)attacker.setCode('1:4:3:2002:21680:2200');
                else if(data[0].class==2)attacker.setCode('2:8:1:2002:21290:2209');
                else if(data[0].class==3)attacker.setCode('1:4:3:2039:21240:22940');
                else if(data[0].class==4)attacker.setCode('2:5:0:2039:21146:2222');
                else if(data[0].class==5)attacker.setCode('1:1:3:2017:21003:2227');
                else if(data[0].class==6)attacker.setCode('2:1:0:2017:21630:2227');
                else if(data[0].class==7)attacker.setCode('1:7:3:2527:21002:22680');
                else if(data[0].class==8)attacker.setCode('2:8:3:2527:21002:22680');
                else if(data[0].class==9)attacker.setCode('1:5:2:2093:21600:22470');
                else if(data[0].class==10)attacker.setCode('2:3:5:2093:21256:2223');
                else                      attacker.setCode('2:8:1:2002:21290:0');
            };

            var attacker = new Attacker(); 
            game.attackerModel();
            attacker.x = 320;
            attacker.y = attacker.positionY = 100;
            attacker.positionX = 320;
            attacker.tl.moveX(attacker.positionX, game.fps / 4);            

            //add lifeBar
            var lifeBar = new Bar(attacker.x, attacker.y + 58, 64, 4, '#00FF80');
            lifeBar.addEventListener(enchant.Event.ENTER_FRAME, function(){
              this.x = attacker.x;
              this.y = attacker.y + 58;
              this.value = Math.max(Math.min(attacker.hp / 200, 1), 0);
            });
            scene.addChild(lifeBar);

            //add energyBar
            var energyBar = new Bar(attacker.x, attacker.y + 62, 64, 4, '#FF0000');
            energyBar.addEventListener(enchant.Event.ENTER_FRAME, function(){
              this.x = attacker.x;
              this.y = attacker.y + 62;
              this.value = Math.max(Math.min(attacker.energy / 100, 1), 0);
              this.backgroundColor = (this.value > 0.8) ? '#FFFFFF' : '#FF0000';
            });
            scene.addChild(energyBar);

            var enemy = new AvatarMonster(game.assets['images/monster/bigmonster2.gif']);
            enemy.x = -enemy.width;
            enemy.y = 80;
            enemy.scaleX = -1;
            enemy.tl.moveX(80, game.fps / 4);
            enemy.hp = 1000;
            enemy.inputCount = game.fps*2;//wait time before first attack
            enemy.addEventListener(enchant.Event.ENTER_FRAME, function(){
              if(this.hp < 1) this.action = 'disappear';
              if(this.action === 'stop' && attacker.action === 'stop') this.inputCount--;
              if(this.inputCount < 1){
                this.tl.moveTo(attacker.x - attacker.width, attacker.y + attacker.height - attacker.height, 6);                
                this.tl.fadeTo(0, 2).fadeTo(1, 2).fadeTo(0, 2).fadeTo(1, 2).then(function(){this.action = 'attack';});
                this.tl.delay(24).moveTo(this.x, this.y, 1);
                this.inputCount = game.fps * 6;
                attacker.tl.delay(8).then(function(){
                  this.action = 'damage';
                  var damage = rand(30)+10;
                  scene.addChild(new Damage(this.x + this.width / 2, this.y, this.height - 16, damage));
                  this.hp -= damage;
                  this.energy += damage / 2;
                });
              }
            });

            enemy.addEventListener(enchant.Event.REMOVED_FROM_SCENE, function(){
              attacker.command = 'win';
              command.visible = false;
            });
            scene.addChild(enemy);

            var command = new Group();
            command.x = 140;
            command.y = 320;
            command.addEventListener(enchant.Event.ENTER_FRAME, function(){
              if(attacker.inputCount === 0 && enemy.action === 'stop'){
                this.tl.moveTo(this.x, 218, 3);
                attacker.inputCount = -1;
              }
            });
            scene.addChild(command);
            var commandButton = [];
            var temp = ['attack', 'specialAttack'];
            for(var i = 0;i < 2;i++){
              commandButton[i] = new Sprite(180, 48);
              commandButton[i].x = 0;
              commandButton[i].y = i * 50;
              commandButton[i].image = game.assets['images/attackbtn.png'];
              commandButton[i].frame = i;
              commandButton[i].command = temp[i];
              commandButton[i].addEventListener(enchant.Event.TOUCH_END, function(){
                if(enemy.action !== 'stop' || attacker.action !== 'stop') return;
                this.touchEnabled = false;
                this.tl.delay(6).then(function(){ this.touchEnabled = true; });
                this.parentNode.tl.moveY(320, 2);
                attacker.targetEnemy = enemy;
                attacker.command = this.command;
                attacker.inputCount = this.command.length * 10;
              });
              command.addChild(commandButton[i]);
            }
            //special is visible if attacker has energy >80
            commandButton[1].addEventListener(enchant.Event.ENTER_FRAME, function(){
              this.visible = (attacker.energy > 80) ? true : false;
            }); 

            var returnLabel = new Label('Escape');
            returnLabel.y = 5;
            returnLabel.x = 400;
            returnLabel.color = "white";
            scene.addChild(returnLabel);
            returnLabel.addEventListener('touchend',function(){
                game.popScene();
            })
            //scene.scaleX = 1.1;
            //scene.scaleY = 1.1;
            return scene;
        }

        game.makeScene1 = function(map,events1){                    
          var game = enchant.Game.instance;

          //get user's info from database
          playerStat = function(){
            $.ajax({
                url : 'scripts/php/userstat.php',
                type : 'POST',
                dataType:'json',
                success : function(data) {
                game.playerImage(player,data);                
                }
            });
          };

          //set user's image
          game.playerImage = function(player,data){            
              player.image = game.assets['images/heroWalk/h'+ data[0].class +'.png'];            
          }

          var scene = new Scene();

          var map = new Map(16, 16);
          map.image = game.assets['images/exmap0.png'];
          map2(map); 

          monster1 = game.addMonster('bigmonster2',114+rand(90),170+rand(200),80,80);            

          var player = new Player(map);
          playerStat();
          player.x = 23 * 16 - 8;
          player.y = 46 * 16;   

          var odin = new Sprite(80,80);
          odin.image = game.assets['images/NPCtile/odin.png'];
          odin.x = 30 * 16-8;
          odin.y = 33 * 16;
          odin.frame = [0,0,1,1,2,2,3,3];          

          var stage = new Group();
          stage.addChild(map);
          stage.addChild(monster1);          
          stage.addChild(player);
          stage.addChild(odin);          

          scene.addChild(stage);

          scene.addEventListener('enterframe', function(e) {
            var x = Math.min((game.width  - 16) / 2 - player.x, 0);
            var y = Math.min((game.height - 16) / 2 - player.y, 0);
            x = Math.max(game.width,  x + map.width)  - map.width;
            y = Math.max(game.height, y + map.height) - map.height;
            stage.x = x;
            stage.y = y;
          }); 

          game.removeEventListener('inputend',events1);
          game.addEventListener('inputend',function events2(){
            console.log(player.x+":"+player.y);
            if (player.y>46*16-1 && player.x>343 && player.x<393){                          
              game.popScene();
              game.removeEventListener('inputend',events2);
              game.addEventListener('inputend',events1);
              game.sound4.play(); 
            }
            else if(player.intersect(odin)){
              game.sound1.play();
              game.showMessage("Lancelot: Walk along this path, across the forest in front, you will get to Hero Catsle. But watch out for the Tauren ahead!");
            }
            else if(player.y<-4 && player.x>120 && player.x<196){              
              game.showMessage("New Map of Hero Catsle will be made soon.");
              game.sound4.play(); 
            }
            else if(player.intersect(monster1)){                        
                game.showNotice2("You have encounter Tauren the monster. Will you fight the monster?"); 
                game.sound2.play(); 
            }  
          });

          showName();
          //game.playMusic();

          return scene;
        }

        game.addNPC = function(x,y){
            var Chara = new Sprite(32,32);
            Chara.image = game.assets['images/space3.png'];
            Chara.x = x;
            Chara.y = y;
            Chara.frame = [0,0,1,1,0,0,2,2];   
            Chara.addEventListener(Event.ENTER_FRAME, function() {
                if (Chara.scaleX === 1) {
                    Chara.x += 1;
                    if (Chara.x > x+50) Chara.scaleX = -1;
                } else {
                    Chara.x -= 1;
                    if (Chara.x < x) Chara.scaleX = 1;
                }
            });
            return Chara;
        }; 

        game.addNPC2 = function(pic,x,y){
            var Chara = new Sprite(32,48);
            Chara.image = game.assets['images/NPCtile/'+pic];
            Chara.x = x;
            Chara.y = y;
            Chara.frame = 0;   
            Chara.addEventListener(Event.ENTER_FRAME, function() {
            });
            return Chara;
        }; 


        game.addMonster = function(name,x,y,w,h){
            var Chara = new Sprite(w,h);
            Chara.image = game.assets['images/monster/'+name+'.gif'];
            Chara.scaleX = 0.7;
            Chara.scaleY = 0.7;
            Chara.x = x;
            Chara.y = y;
            Chara.frame = [3, 3, 3, 2, 2, 2, 4, 4, 4,  2, 2, 2];   
            Chara.addEventListener(Event.ENTER_FRAME, function() {
            });
            return Chara;
        }; 

        game.playMusic = function(){
            var music = new Label();
            music.text = "Play Music";
            music.font = "12px Comic Sans, Comic Sans MS, cursive";
            music.color = "rgb(0,0,0)";
            music.x = 480-70;
            music.y = 3; 
            //game.rootScene.addChild(music);
            game.currentScene.addChild(music);
            music.addEventListener('touchend',function(){
                if(music.text == "Play Music"){
                    myAudio = new Audio('sounds/bgm_village.mp3');
                    myAudio.play();
                    music.text = "Stop Music";
                    myAudio.addEventListener('ended', function() {
                        this.currentTime = 0;
                        this.play();
                        }, false); 

                }else{
                    myAudio.pause();
                    music.text = "Play Music";
                }
            })
        };

        //Add Dialogue Message
        game.showMessage = function(text){
            var label = new Label(text);
            label.font = "14px Times, serif ";
            label.color = "rgb(255,255,255)";
            label.backgroundColor = "rgba(100,100,100,1)";
            label.x = 5;            
            label.y = 320-40;
            label.width = 470;
            label.height = 40;
            game.currentScene.addChild(label);

            label.addEventListener('enterframe',function(){
                if(label.age > text.length) game.currentScene.removeChild(label);
            });
        };

        //Add Dialogue Message
        game.showNotice = function(text){
            var label = new Label(text);
            label.font = "14px Times, serif ";
            label.color = "rgb(255,255,255)";
            label.backgroundColor = "rgba(0,100,100,1)";
            label.x = 5;            
            label.y = 320-40;
            label.width = 470;
            label.height = 40;

            var yes = new Label("Fight");
            yes.font = "14px Times, serif";
            yes.color = "rgb(255,255,255)";
            yes.x = 370;
            yes.y = 320-20;

            var no = new Label("Escape");
            no.font = "14px Times, serif";
            no.color = "rgb(255,255,255)";
            no.x = 410;
            no.y = 320-20;

            game.rootScene.addChild(label);
            game.rootScene.addChild(yes);
            game.rootScene.addChild(no);

            yes.addEventListener('touchend',function(){
                game.pushScene(game.combatScene1()); 
                game.sound3.play();
            });

            no.addEventListener('touchend',function(){
                game.rootScene.removeChild(label);
                game.rootScene.removeChild(yes);
                game.rootScene.removeChild(no);
            })
            
            label.addEventListener('enterframe',function(){
                if(label.age > 100) {
                    game.rootScene.removeChild(label);
                    game.rootScene.removeChild(yes);
                    game.rootScene.removeChild(no);
                } 
            });
        };

                //Add Dialogue Message
        game.showNotice2 = function(text){
            var label = new Label(text);
            label.font = "14px Times, serif ";
            label.color = "rgb(255,255,255)";
            label.backgroundColor = "rgba(0,100,100,1)";
            label.x = 5;            
            label.y = 320-40;
            label.width = 470;
            label.height = 40;

            var yes = new Label("Fight");
            yes.font = "14px Times, serif";
            yes.color = "rgb(255,255,255)";
            yes.x = 370;
            yes.y = 320-20;

            var no = new Label("Escape");
            no.font = "14px Times, serif";
            no.color = "rgb(255,255,255)";
            no.x = 410;
            no.y = 320-20;

            game.currentScene.addChild(label);
            game.currentScene.addChild(yes);
            game.currentScene.addChild(no);

            yes.addEventListener('touchend',function(){
                game.pushScene(game.combatScene2()); 
                game.sound3.play();
            });

            no.addEventListener('touchend',function(){
                game.currentScene.removeChild(label);
                game.currentScene.removeChild(yes);
                game.currentScene.removeChild(no);
            })
            
            label.addEventListener('enterframe',function(){
                if(label.age > 100) {
                    game.currentScene.removeChild(label);
                    game.currentScene.removeChild(yes);
                    game.currentScene.removeChild(no);
                } 
            });
        };


        //show greeting with user name on the top left corner
        function showName(result){
            $.ajax({
                    url : 'scripts/php/showSession.php',
                    type : 'POST',
                dataType:'json',
                success : function(data) {
                    //console.log("Welcome: "+ data);
                    game.currentScene.addChild(Greeting('Welcome: ' + data));                    
                }
            });
        }; 

        game.addOtherPlayers = function(data){
            var Others = new Sprite(32, 48);
            for(i=0;i<data.length;i++){
                Others.image = game.assets['images/heroWalk/h'+data[i].class+'.png'];
                Others.x = parseInt(data[i].xpos);
                Others.y = parseInt(data[i].ypos);
                Others.frame = [1,1,0,0,1,1,2,2];
                return Others;
            }
        };  

        //select all the other users from database who have logged in within the last 10 minutes
        //display the other users in map
        function displayOthers(result){
            $.ajax({
                    url : 'scripts/php/displayOthers.php',
                    type : 'POST',
                dataType:'json',
                success : function(data) {                    
                    for(i=0;i<data.length;i++){
                        //console.log(data[i]);                        
                        stage.addChild(game.addOtherPlayers(data));
                    }
                }
            })
        }; 

        //add NPC bears
        ben = game.addNPC(300,250);

        alex = game.addNPC(120,170);
        alex.frame = [5,5,6,6,5,5,7,7];

        sani = game.addNPC(400,600);
        sani.frame = [10,10,11,11,10,10,12,12];

        henry = game.addNPC(50,700);
        henry.frame = [15,15,16,16,15,15,17,17];

        //add NPCs
        village_inn = game.addNPC2('village_inn.png',450,390);
        village_weapon = game.addNPC2('village_weapon.png',80,350);
        village_item = game.addNPC2('village_item.png',140,550);

        //add monsters
        monster1 = game.addMonster('monster7',100+rand(200),50+rand(100),48,48);
        monster2= game.addMonster('monster7',300+rand(200),50+rand(100),48,48);

        //add stage
        var stage = new Group();
        stage.addChild(map); 

        stage.addChild(monster1);
        stage.addChild(monster2);      

        stage.addChild(ben);   
        stage.addChild(alex); 
        stage.addChild(sani); 
        stage.addChild(henry); 

        stage.addChild(village_inn);
        stage.addChild(village_weapon);
        stage.addChild(village_item);

        stage.addChild(player);     

        game.rootScene.addChild(stage); 
        //add things on top of stage
        game.playMusic();
        showName();             
        

        game.addEventListener('enterframe',function(){
            //game.updatePos();
            //console.log(player.x+":"+player.y);                       
        }); 

        
        game.addEventListener('inputend',function events1(){            
            if(player.intersect(ben)){
                game.showMessage('Ben: Welcome my friend, this is Bear Village. Talk to people to learn how tho play the game.'); 
                game.sound1.play();               
            }
            else if(player.intersect(alex)){
                game.showMessage('Alex: You can use (Arrow keys) to move your character.'); 
                game.sound1.play();               
            }
            else if(player.intersect(sani)){
                game.showMessage('Sani: fight the monsters outside the villages to protect us, and you will also get experience.'); 
                game.sound1.play();               
            }
            else if(player.intersect(henry)){
                game.showMessage('Henry: I have travelled a long way to find resource called honey in this planet.'); 
                game.sound1.play();               
            }
            else if(player.intersect(village_inn)){
                game.showMessage('InnKeeper: Do you want to have a rest for 10 gold pieces?'); 
                game.sound1.play();               
            }
            else if(player.intersect(village_weapon)){
                game.showMessage('Blacksmith: Welcome! We have a variety of excellent goods.'); 
                game.sound1.play();
            }
            else if(player.intersect(village_item)){
                game.showMessage('Shop Manager: Welcome to our shop. We have everything from daily necessities to medicine.'); 
                game.sound1.play(); 
            }
            else if(player.y<10 && player.x>232 && player.x<312){                                                             
                game.pushScene(game.makeScene1(map,events1)); 
                game.sound4.play();                 
            }
            else if(player.intersect(monster1) || player.intersect(monster2)){                        
                game.showNotice("You have encounter Scorpion the monster. Will you fight the monster?"); 
                game.sound2.play(); 
            }             
        });

        game.rootScene.addEventListener('enterframe', function(e) {
            var x = Math.min((game.width  - 16) / 2 - player.x, 0);
            var y = Math.min((game.height - 16) / 2 - player.y, 0);
            x = Math.max(game.width,  x + map.width)  - map.width;
            y = Math.max(game.height, y + map.height) - map.height;
            stage.x = x;
            stage.y = y;
        });

    };
        
    game.start();
};

/* all the other functions */


//random number
function rand(num){
        return Math.floor(Math.random() * num);
    }

//Backgrond Creation
function makeBackground(image){
    var bg = new Sprite(480,320);
    bg.image = image;
    return bg;
}

//greeting the current user
function Greeting(text){
    var label = new Label(text);
    label.font = "12px Comic Sans, Comic Sans MS, cursive";
    label.color = "rgb(0,0,0)";    
    label.backgroundColor = "rgba(0,255,255,0.5)";
    label.width = 100+text.length;
    label.height = 20;
    label.textAlign = "center";
    return label;
}


//Calculates the distance between two points
function calcLen(x0, y0, x1, y1) {
    return Math.sqrt((x0 - x1) * (x0 - x1) + (y0 - y1) * (y0 - y1));
}


function map1(backgroundMap){
backgroundMap.loadData([
    [39,39,40,107,107,107,107,107,107,107,107,107,107,11,57,107,242,243,243,244,107,55,56,56,10,107,394,38,39,39,39,39,39,39,39,39,39,39,39,39],
    [56,56,44,19,107,107,107,21,22,22,23,107,17,53,107,107,259,211,210,261,107,107,107,107,51,2,2,41,39,39,39,39,39,39,39,39,39,6,56,56],
    [362,401,343,37,107,107,17,45,56,56,44,2,53,107,107,107,107,242,244,107,107,107,107,107,107,107,107,55,56,56,56,56,7,39,39,39,6,57,107,107],
    [379,380,107,51,2,2,53,107,107,107,107,107,107,107,107,107,107,242,244,107,107,107,107,107,107,107,107,107,107,107,107,107,55,56,56,56,57,107,107,107],
    [396,397,107,107,361,401,343,107,107,107,107,107,107,107,107,107,107,242,208,226,226,226,226,226,227,107,107,107,107,107,107,107,107,107,107,107,107,107,225,226],
    [107,107,107,361,345,380,107,107,107,107,107,107,107,107,107,107,107,242,210,260,260,260,260,260,212,226,226,226,226,226,226,226,226,226,226,226,226,226,209,243],
    [107,107,107,378,346,397,107,107,107,107,107,107,107,107,107,107,107,242,244,107,107,107,107,107,259,260,260,260,260,260,260,260,260,260,260,260,260,260,211,243],
    [107,107,341,398,397,107,107,107,107,107,107,107,107,107,107,107,107,242,244,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,259,260],
    [107,360,107,394,107,107,107,107,107,107,107,107,107,107,107,107,107,242,244,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,360,107,107,107],
    [362,365,363,107,107,107,107,107,107,107,107,107,107,107,107,107,107,259,261,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,361,365,362,362,362],
    [379,346,397,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,378,379,346,396,347],
    [396,397,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,351,396,397,107,395],
    [107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,394,107,107,107,107],
    [107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,225,226,226,227,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107],
    [107,225,227,107,107,107,107,107,107,107,107,107,107,107,107,107,242,243,243,244,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,21,23,107],
    [107,242,244,107,107,107,107,107,107,107,107,107,107,107,107,107,259,211,210,261,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,21,22,5,40,107],
    [107,242,244,124,124,124,124,124,124,124,124,124,124,124,75,107,107,242,244,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,38,39,39,40,107],
    [107,242,244,157,158,158,158,158,158,158,158,158,158,159,106,107,107,242,244,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,21,5,39,39,40,107],
    [107,242,244,174,175,175,175,175,175,175,175,175,175,176,106,107,107,242,244,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,55,7,39,39,40,107],
    [107,242,244,174,175,175,175,175,175,175,175,175,175,176,106,107,107,242,244,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,38,39,6,57,107],
    [107,242,244,174,175,175,175,175,175,175,175,175,175,176,106,107,107,242,244,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,55,56,57,107,107],
    [107,242,244,174,175,175,175,175,175,175,175,175,175,176,106,107,107,242,244,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107],
    [107,242,244,174,175,175,175,175,175,175,175,175,175,176,106,107,107,242,208,226,226,226,226,226,226,226,226,226,226,226,226,226,226,226,226,226,226,227,107,107],
    [107,242,244,174,175,175,175,175,175,175,175,175,175,176,106,107,107,242,210,260,260,260,260,260,260,260,260,260,260,260,260,260,260,260,260,260,260,261,107,107],
    [107,242,244,174,175,175,175,175,175,175,175,175,175,176,106,107,107,242,244,107,108,157,158,158,158,158,158,158,158,158,158,158,158,159,106,107,107,107,107,107],
    [107,242,244,174,175,175,175,175,175,175,175,175,175,176,106,107,107,242,244,107,108,174,175,175,175,175,175,175,175,175,175,175,175,176,106,107,107,107,107,107],
    [107,242,244,174,175,175,175,175,175,175,175,175,175,176,225,227,107,242,244,107,108,174,175,175,175,175,175,175,175,175,175,175,175,176,106,107,107,107,107,107],
    [107,242,244,174,175,175,175,175,175,175,175,175,175,176,242,208,226,209,244,107,108,174,175,175,175,175,175,175,175,175,175,175,175,176,106,107,107,107,107,107],
    [107,242,244,174,175,175,175,175,175,175,175,175,175,176,242,210,260,211,244,107,108,174,175,175,175,175,175,175,175,175,175,175,175,176,106,107,107,107,107,107],
    [107,242,244,191,192,192,192,192,192,192,192,192,192,193,259,261,107,242,244,107,108,191,192,192,192,192,192,192,192,143,175,175,175,176,106,107,107,107,107,107],
    [107,242,244,90,90,90,90,90,90,90,90,90,90,90,73,107,107,242,244,107,72,90,90,90,90,225,226,226,227,174,175,175,175,176,106,107,107,107,107,107],
    [107,242,244,107,107,107,107,107,107,107,107,107,107,107,107,107,107,242,208,226,226,226,226,226,226,209,210,260,261,174,175,175,175,176,106,107,107,107,107,107],
    [107,242,244,74,124,124,124,124,124,124,124,124,124,124,124,124,75,242,210,260,260,260,260,260,260,260,261,107,108,174,175,175,175,176,106,107,107,107,107,107],
    [107,242,244,108,157,158,158,158,158,158,158,158,158,158,158,159,106,242,244,107,107,107,107,107,107,107,107,107,108,174,175,175,175,176,106,107,107,107,107,107],
    [107,242,244,108,174,175,175,175,175,175,175,175,175,175,175,176,106,242,244,107,107,107,107,107,107,107,107,107,108,174,175,175,175,176,106,107,107,107,107,107],
    [107,242,244,108,174,175,175,175,175,175,175,175,175,175,175,176,106,242,244,107,107,107,107,107,107,107,107,107,108,191,192,192,192,193,106,107,107,107,107,107],
    [107,242,244,108,174,175,175,175,175,175,175,175,175,175,175,176,106,242,244,107,107,107,107,107,107,107,107,107,72,90,90,90,90,90,73,107,107,107,107,361],
    [107,242,244,108,174,175,175,175,175,175,175,175,175,175,175,176,106,242,244,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,361,345],
    [107,242,244,108,174,175,175,175,175,175,175,175,175,175,175,176,106,242,244,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,341,402,345,379],
    [107,242,244,108,174,175,175,175,175,175,175,175,175,175,175,176,106,242,244,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,382,107,378,379,379],
    [107,242,244,108,174,175,175,175,175,175,175,175,175,175,175,176,106,242,244,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,341,381,379,379],
    [107,242,244,108,174,175,175,175,175,175,175,175,175,175,175,176,106,242,244,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,382,107,107,378,379,379],
    [107,242,244,108,191,192,192,192,192,192,192,192,192,192,192,193,106,242,244,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,361,345,379,379],
    [107,242,244,72,90,90,90,90,225,226,226,227,90,90,90,90,73,242,244,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,395,347,379,379],
    [107,242,208,226,226,226,226,226,209,243,243,208,226,226,226,226,226,209,244,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,395,347,379],
    [107,259,260,260,260,260,260,260,260,260,260,260,260,260,260,260,260,211,244,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,382,107,395,396],
    [107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,242,244,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107],
    [107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,225,226,209,208,226,227,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107],
    [107,107,361,362,363,107,382,107,107,107,107,107,107,107,107,242,243,243,243,243,244,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107],
    [107,361,345,379,344,363,107,107,107,107,107,107,107,107,107,242,243,243,243,243,244,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107]
],[
    [-1,-1,-1,-1,386,-1,-1,-1,-1,-1,-1,-1,285,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,336,337,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,353,354,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [336,337,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [353,354,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [29,29,29,29,29,29,29,29,29,29,29,29,29,29,-1,335,-1,-1,-1,-1,335,-1,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29],
    [-1,-1,-1,-1,386,386,-1,386,-1,336,337,-1,-1,-1,-1,352,-1,-1,-1,-1,352,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,336,337,-1,-1,285,-1,-1,-1],
    [-1,-1,-1,-1,-1,302,-1,386,-1,353,354,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,353,354,386,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,302,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,13,30,30,30,13,30,30,30,30,30,13,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,13,301,-1,301,13,-1,318,-1,318,-1,13,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,13,303,-1,-1,13,-1,-1,-1,-1,-1,13,302,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,13,-1,-1,-1,13,-1,-1,-1,-1,-1,13,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,302,-1,-1,-1,-1,-1,302,-1,-1,-1,-1,-1,-1,386,-1],
    [-1,-1,-1,13,-1,-1,-1,13,-1,-1,-1,-1,-1,13,-1,302,-1,-1,-1,-1,-1,-1,-1,302,-1,-1,-1,-1,302,-1,-1,-1,-1,-1,302,-1,-1,386,-1,-1],
    [-1,-1,-1,13,-1,-1,-1,13,-1,-1,-1,-1,-1,13,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,13,-1,-1,-1,13,-1,-1,-1,-1,-1,13,302,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,13,-1,-1,-1,30,-1,-1,-1,-1,-1,13,-1,-1,-1,-1,-1,-1,-1,13,30,30,30,30,30,30,30,30,30,30,30,30,13,-1,-1,-1,-1,-1],
    [-1,-1,-1,13,-1,-1,-1,-1,-1,-1,-1,-1,-1,30,-1,-1,-1,-1,-1,-1,-1,13,301,-1,-1,-1,-1,318,-1,-1,318,-1,-1,301,13,-1,336,337,-1,-1],
    [-1,-1,-1,13,46,46,46,46,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,13,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,13,-1,353,354,-1,-1],
    [-1,-1,-1,13,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,13,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,13,-1,302,-1,-1,-1],
    [-1,-1,-1,13,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,13,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,13,-1,-1,-1,-1,-1],
    [-1,-1,-1,30,30,30,30,30,30,30,30,30,30,30,-1,-1,-1,-1,-1,-1,-1,30,30,30,30,30,30,-1,-1,-1,-1,-1,-1,-1,13,302,-1,336,337,-1],
    [-1,-1,-1,-1,-1,-1,-1,371,371,-1,336,337,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,13,46,46,46,46,13,-1,-1,353,354,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,353,354,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,13,-1,-1,-1,-1,13,-1,302,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,13,-1,-1,-1,-1,13,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,13,30,30,30,30,30,30,30,30,30,30,13,-1,-1,243,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,13,-1,-1,-1,-1,13,302,-1,-1,-1,-1],
    [-1,-1,-1,-1,13,-1,-1,-1,-1,-1,-1,-1,-1,284,284,13,-1,-1,243,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,13,284,284,-1,303,13,-1,-1,-1,-1,-1],
    [-1,-1,-1,302,13,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,13,-1,-1,243,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,30,30,30,30,30,30,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,13,-1,-1,-1,-1,-1,-1,-1,-1,-1,286,13,302,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,302,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,13,-1,-1,-1,-1,-1,-1,-1,-1,-1,286,13,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,302,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,13,46,46,46,46,46,46,-1,-1,-1,-1,13,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,336,337,-1,-1,-1,-1,-1],
    [-1,-1,-1,302,13,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,13,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,353,354,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,13,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,13,302,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,336,337,-1,-1,336,337,-1,-1,-1],
    [-1,-1,-1,-1,13,-1,-1,-1,-1,-1,-1,-1,-1,-1,284,13,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,353,354,-1,-1,353,354,-1,-1,-1],
    [-1,-1,-1,-1,30,30,30,30,30,-1,-1,30,30,30,30,30,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,302,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [29,29,29,29,29,29,29,29,29,29,29,29,29,29,-1,371,-1,-1,-1,-1,371,-1,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]
]);
backgroundMap.collisionData = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0],
    [1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0],
    [1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0],
    [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],
    [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,1,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,1],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,0,0,0,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [0,0,0,0,1,1,0,1,0,1,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,1,1,1,0],
    [0,0,0,0,0,0,0,1,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0],
    [0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,0],
    [0,0,0,1,1,0,1,1,0,1,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,0],
    [0,0,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0],
    [0,0,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0],
    [0,0,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0],
    [0,0,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,1,0,0,0,0,1,0,0,1,0,0,1,1,0,1,1,0,0],
    [0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,1,0,0],
    [0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0],
    [0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0],
    [0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,1,0,0,1,1,0],
    [0,0,0,0,0,0,0,1,1,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,1,1,0],
    [0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0],
    [0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0],
    [0,0,0,0,1,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,1,0,0,0,0,0],
    [0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,1,1,1,1],
    [0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1],
    [0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,1,1,1,1,1],
    [0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,1,1,1,1,1,1],
    [0,0,0,0,1,1,1,1,1,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,1],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,0,0,0,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,1,1,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
];

};


function map2(backgroundMap){
backgroundMap.loadData([
    [379,379,380,107,107,107,107,107,242,243,243,243,243,244,107,107,107,107,107,241,38,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39],
    [379,379,380,107,107,107,107,107,259,260,260,260,260,261,107,107,107,107,107,241,55,7,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39],
    [379,379,380,107,107,107,107,107,107,107,107,107,107,107,107,361,363,107,107,232,227,55,7,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39],
    [396,396,348,362,363,107,107,107,107,107,107,107,107,107,107,378,380,107,107,259,212,227,55,56,7,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39],
    [107,107,351,396,350,107,107,107,107,107,107,107,107,107,361,345,344,363,107,107,259,248,206,223,55,56,56,7,39,39,39,39,39,39,39,39,39,39,39,39],
    [107,361,367,107,377,107,107,107,107,107,107,107,107,107,395,347,379,380,107,107,107,107,107,255,206,206,223,55,56,7,39,39,39,39,39,39,39,39,39,39],
    [342,381,383,342,376,107,107,107,107,107,107,107,107,107,107,378,379,380,107,107,107,107,107,107,107,107,255,266,227,38,39,39,39,39,39,39,39,39,39,39],
    [107,378,380,107,377,107,107,107,107,107,107,107,107,107,107,378,346,397,107,107,21,22,22,22,22,23,107,259,214,55,7,39,39,39,39,39,39,39,39,39],
    [362,345,344,362,367,107,107,107,107,107,107,107,107,107,107,351,397,107,107,21,5,39,39,39,39,40,107,107,232,227,38,39,39,39,39,39,39,39,39,39],
    [379,379,379,346,397,107,107,107,107,107,107,107,107,107,361,367,107,107,21,5,39,39,39,39,39,40,107,107,259,214,55,7,39,39,39,39,39,39,39,39],
    [396,399,396,350,107,107,107,107,107,107,107,107,107,341,381,383,343,21,5,39,39,39,39,39,39,4,23,107,107,232,227,38,39,39,39,39,39,39,39,39],
    [107,377,107,368,363,107,107,107,107,107,107,107,107,107,395,350,107,38,39,39,39,39,39,39,39,39,40,107,107,215,261,38,39,39,39,39,39,39,39,39],
    [107,368,401,385,350,107,107,107,107,107,107,107,107,107,107,368,363,38,39,39,39,39,39,39,39,39,40,107,107,241,21,5,39,39,39,39,39,39,39,39],
    [362,345,380,107,377,107,107,107,107,107,107,107,107,107,341,381,380,38,39,39,39,39,39,39,39,6,57,107,107,241,38,39,39,39,39,39,39,39,39,39],
    [396,347,344,362,365,363,107,107,107,107,107,107,107,107,107,378,380,55,7,39,39,39,39,39,39,40,107,107,107,241,38,39,39,39,39,39,39,39,39,39],
    [107,378,379,379,379,380,107,107,107,107,107,107,107,107,107,378,380,107,55,7,39,39,39,39,39,40,107,107,107,241,55,7,39,39,39,39,39,39,39,39],
    [342,381,379,379,379,380,107,107,107,107,107,107,107,107,107,378,380,107,107,38,39,39,39,39,39,40,107,107,107,238,207,38,39,6,56,56,56,7,39,39],
    [107,378,379,379,379,344,363,107,107,107,107,107,107,107,107,395,350,107,107,38,39,39,39,6,56,57,107,107,221,257,21,5,6,57,107,107,107,55,7,39],
    [362,345,379,379,379,379,380,107,107,107,107,107,107,107,107,107,368,363,107,55,7,39,39,40,107,107,107,107,241,21,5,39,40,107,107,107,107,107,38,39],
    [379,379,379,379,379,379,380,107,107,107,107,107,107,107,107,107,378,380,107,107,55,56,56,57,107,107,107,107,241,38,39,39,40,107,107,107,107,107,38,39],
    [379,379,379,379,379,346,397,107,107,107,107,107,107,107,107,107,378,380,107,107,107,107,107,107,107,107,221,206,257,38,39,39,40,107,107,107,107,107,38,39],
    [379,379,379,379,379,380,107,107,107,107,107,107,107,107,107,107,378,380,107,107,107,107,221,206,206,206,257,21,22,5,39,39,4,22,23,107,107,21,5,39],
    [379,379,379,379,379,380,107,107,107,107,107,107,107,107,107,107,378,380,107,107,221,206,257,21,22,22,22,5,39,39,39,39,39,39,4,22,22,5,39,39],
    [396,347,379,379,379,344,363,107,107,107,107,107,107,107,107,107,351,384,359,221,257,21,22,5,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39],
    [107,378,379,379,379,379,380,107,107,107,107,107,107,107,107,107,377,107,377,241,21,5,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39],
    [107,395,396,347,379,379,380,107,107,107,107,107,107,107,107,107,368,362,367,241,38,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39],
    [107,107,107,395,396,347,380,107,107,107,107,107,107,107,107,107,395,396,397,241,55,7,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39],
    [107,107,107,107,107,351,397,107,107,107,107,107,107,107,107,107,107,107,107,255,223,38,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39],
    [107,107,107,107,107,394,107,107,107,107,107,107,107,107,107,107,107,107,107,107,241,55,7,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39],
    [227,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,232,227,55,7,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39],
    [248,206,206,206,223,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,242,208,227,55,7,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39],
    [22,22,22,23,255,223,107,107,107,107,107,107,107,107,107,107,107,221,206,206,249,211,208,227,55,7,6,56,56,56,56,7,39,39,39,39,39,39,39,39],
    [39,39,39,4,23,255,206,206,206,223,107,107,107,107,221,206,206,257,21,22,23,259,211,208,227,55,57,221,206,206,223,55,56,7,39,39,39,39,39,39],
    [39,39,39,39,4,22,22,22,23,255,206,206,206,206,257,21,22,22,5,39,4,23,242,210,248,206,206,257,107,107,255,206,223,55,56,56,7,39,39,39],
    [39,39,39,39,39,39,39,39,4,22,22,22,22,22,22,5,39,39,39,39,39,40,259,214,107,107,107,107,107,107,107,107,232,226,226,227,55,7,39,39],
    [39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,43,3,241,107,107,107,107,107,107,107,107,242,243,243,208,227,38,39,39],
    [39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,6,57,221,257,107,107,107,107,107,107,107,107,242,243,243,243,244,38,39,39],
    [39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,40,221,257,107,107,107,107,107,107,107,107,107,242,243,243,210,261,38,39,39],
    [39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,40,241,107,107,107,107,107,107,107,107,107,107,242,243,210,261,21,5,39,39],
    [39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,40,241,107,107,107,107,107,107,107,107,107,107,242,243,244,21,5,39,39,39],
    [39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,40,241,107,107,107,107,107,107,107,107,107,107,242,243,244,38,39,39,39,39],
    [39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,40,241,107,107,107,107,107,107,107,107,107,107,242,243,244,38,39,39,39,39],
    [39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,40,241,107,107,107,107,107,107,107,107,107,107,242,243,244,38,39,39,39,39],
    [39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,40,241,107,107,107,107,107,107,107,107,107,225,209,210,261,38,39,39,39,39],
    [39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,40,255,223,107,107,221,206,206,223,107,107,242,243,244,21,5,39,39,39,39],
    [39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,4,23,232,226,226,231,21,23,255,206,206,249,260,261,38,39,39,39,39,39],
    [39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,40,242,243,243,244,38,4,22,22,22,22,22,22,5,39,39,39,39,39],
    [39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,40,242,243,243,244,38,39,39,39,39,39,39,39,39,39,39,39,39,39],
    [39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,39,40,242,243,243,244,38,39,39,39,39,39,39,39,39,39,39,39,39,39]
],[
    [-1,-1,-1,336,337,-1,335,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,353,354,-1,352,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,302,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,302,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,302,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,336,337,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,386,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,353,354,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [302,-1,-1,386,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,302,-1,-1,-1,302,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,386,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,336,337,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,386,386,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,353,354,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [302,-1,386,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,386,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [386,-1,-1,-1,302,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,386,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [371,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,302,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,386,-1,-1,-1,-1,302,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,386,371,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [386,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,386,386,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,386,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,302,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,302,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,386,371,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,302,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,302,-1,-1,386,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,302,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,302,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,386,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [386,-1,371,386,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,386,-1,371,386,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,302,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,336,337,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,386,-1,336,337,-1,-1,-1,-1,-1,-1,-1,-1,-1,353,354,-1,302,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,353,354,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,284,284,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,284,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,284,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,284,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,284,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,371,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,371,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]
]);
backgroundMap.collisionData = [
    [1,1,1,1,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,1,1,1,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [0,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,0,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [0,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,0,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,0,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,0,1,1,1,1,1,1,1,0,0,0,0,1,0,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,0,1,1,1,1,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,0,0,1,1,1,1,0,0,0,0,0,1,1,1,1,1,1,1,0,1,1,1],
    [1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [0,1,1,1,0,1,1,0,0,0,0,0,0,0,0,0,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [0,1,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [0,0,0,1,0,1,1,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,1,1,0,0,0,0,1,0,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

}