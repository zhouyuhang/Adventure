enchant();

window.onload=function(){
    game = new Game(480,320);
    game.preload('avatarBg1.png','avatarBg2.png','avatarBg3.png','images/monster/bigmonster1.gif');
    game.onload=function(){
        game.rootScene.backgroundColor="#000000";
        bg =new AvatarBG(3);
        bg.y=50;
        game.rootScene.addChild(bg);
        
        monster = new AvatarMonster(game.assets['images/monster/bigmonster1.gif']);
        monster.x=300;
        monster.y=100;
        game.rootScene.addChild(monster);

        chara = new Avatar("2:2:1:2004:21230:22480");
        game.rootScene.addChild(chara);
        chara.scaleX=-1;
        chara.scaleY=1;
        chara.x=50;
        chara.y=100;
        chara.addEventListener('enterframe',function(){
            if(game.frame%40==0){
                switch(Math.floor(Math.random()*2)){
                    //case 0 :this.action="run";break;
                    case 0 :this.action="attack";break;
                    case 1 :this.action="special";break;                    
                }
            }
        });
    }

        //weapon control
        add = new Label('w:add');
        add.color = 'white';
        add.x =50;
        add.y = 30;

        var weapon = 2000; //set to 2000;2500-2600
        add.addEventListener('touchstart',function(){
            weapon++;
            chara.setCode("2:2:1:"+weapon+":21230:22480");
            weaponNum.text = weapon;
        })
        game.rootScene.addChild(add);

        minus = new Label('minus');
        minus.color = 'white';
        minus.x = 100;
        minus.y = 30;
        minus.addEventListener('touchstart',function(){
            weapon--;
            chara.setCode("2:2:1:"+weapon+":21230:22480");
            weaponNum.text = weapon;
        })
        game.rootScene.addChild(minus);

        weaponNum = new Label(weapon);
        weaponNum.color = 'white';
        weaponNum.x = 150;
        weaponNum.y = 30;
        game.rootScene.addChild(weaponNum);

        //head control
        addh = new Label('h:add');
        addh.color = 'white';
        addh.x =50;
        addh.y = 5;

        var head = 22400; //set to 2200-2241;22420
        addh.addEventListener('touchstart',function(){
            head+=10;
            chara.setCode("2:2:1:2004:21230:"+head);
            headNum.text = head;
        })
        game.rootScene.addChild(addh);

        minush = new Label('minus');
        minush.color = 'white';
        minush.x =100;
        minush.y = 5;
        
        minush.addEventListener('touchstart',function(){
            head-=10;
            chara.setCode("2:2:1:2004:21230:"+head);
            headNum.text = head;
        })
        game.rootScene.addChild(minush);

        headNum = new Label(head);
        headNum.color = 'white';
        headNum.x = 150;
        headNum.y = 5;
        game.rootScene.addChild(headNum);
        
        //clothe control
        addc = new Label('c:add');
        addc.color = 'white';
        addc.x =50+200;
        addc.y = 5;

        var clothe = 21230; //set to 2100-2122; 21000-~; 21141;21256;21230-21710
        addc.addEventListener('touchstart',function(){
            clothe+=10;
            chara.setCode("2:2:1:2004:"+clothe+":22480");
            clotheNum.text = clothe;
        })
        game.rootScene.addChild(addc);

        minusc = new Label('minus');
        minusc.color = 'white';
        minusc.x =100+200;
        minusc.y = 5;
        
        minusc.addEventListener('touchstart',function(){
            clothe-=10;
            chara.setCode("2:2:1:2004:"+clothe+":22480");
            clotheNum.text = clothe;
        })
        game.rootScene.addChild(minusc);

        clotheNum = new Label(clothe);
        clotheNum.color = 'white';
        clotheNum.x = 150+200;
        clotheNum.y = 5;
        game.rootScene.addChild(clotheNum);

    game.start();
}