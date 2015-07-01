<!DOCTYPE html>
<html>
<head>
    <title>Adventure</title>

    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="IE=Edge">
    <meta name="viewport" content="width=device-width, user-scalable=no">
    <meta name="apple-mobile-web-app-capable" content="yes"> 
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">

    <script type="text/javascript" src="lib/jquery-1.11.3.min.js"></script>
    <script type="text/javascript" src="lib/bootstrap.min.js"></script>
    <script type="text/javascript" src="lib/enchant.js"></script>
    <script type="text/javascript" src="lib/ui.enchant.js"></script>
    <script type="text/javascript" src="lib/avatar.enchant.js"></script>
    <script type="text/javascript" src="lib/tl.enchant.js"></script>
    <!--script type="text/javascript" src="lib/nineleap.enchant.js"></script-->

    <script type="text/javascript" src="scripts/script.js"></script> 
    <script type="text/javascript" src="scripts/js/register.js"></script>
    <script type="text/javascript" src="scripts/js/userLogin.js"></script>
    <script type="text/javascript" src="scripts/js/chat.js"></script>
    

    <link rel="stylesheet" href="lib/bootstrap.min.css">
    <link rel="stylesheet" href="scripts/styles.css">
</head>  
    
    
<body>

<!-- Modal for the login page-->
<div class="modal fade" id="loginModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title" id="myModalLabel">Adventure Login</h3>
      </div>
        <div class="modal-body">
         <div id="registerBox">    
</div></div></div></div></div>

<!-- Main Page -->
    <div class="container-fluid">
    <div class="row clearfix">
        <div class="col-md-12 column">
            <nav class="navbar navbar-inverse" role="navigation">
                <div class="navbar-header">
                     <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1"> <span class="sr-only">Toggle navigation</span><span class="icon-bar"></span><span class="icon-bar"></span><span class="icon-bar"></span></button> <a class="navbar-brand" href="#">Adventure</a>
                </div>
                
                <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                    <ul class="nav navbar-nav">
                        <li class="active">
                            <a href="mailto:zhouyuhangcn@hotmail.com?Subject=Hello%20again">Email Me</a>
                        </li>
                        <li>
                            <a href="#" >Facebook</a>
                        </li>
                        <li class="dropdown">
                             <a href="#" class="dropdown-toggle" data-toggle="dropdown">Game Info<strong class="caret"></strong></a>
                            <ul class="dropdown-menu">
                                <li>
                                    <a href="#">Character Classes</a>
                                </li>
                                <li>
                                    <a href="#">Combat Skills</a>
                                </li>
                                <li>
                                    <a href="#">Missions</a>
                                </li>
                                <li class="divider">
                                </li>
                                <li>
                                    <a href="#">Separated link</a>
                                </li>
                                <li class="divider">
                                </li>
                                <li>
                                    <a href="#">One more separated link</a>
                                </li>
                            </ul>
                        </li>
                    </ul>
                    <form class="navbar-form navbar-left" role="search">
                        <div class="form-group">
                            <input type="text" class="form-control" />
                        </div> <button type="submit" class="btn btn-default">Search</button>
                    </form>
                    <ul class="nav navbar-nav navbar-right">
                        <li>
                            <input name='Submit' type="button" class="btn btn-default navbar-btn" onclick='javascript:logout()' value='Logout' />&nbsp;
                        </li>
                        
                        </li>
                    </ul>
                </div>
                
            </nav>
            
            <div class="Banner">                
                <img src="images/logo.png">
            </div>

            <div class="row clearfix">                            
                    <div class="col-md-2 column sidebar" >
                        <a href="#" class="list-group-item active">Status</a>
                        <div id="userstat"></div>
                    </div>

                    <div class="col-md-6 column content">                        
                            <div id="GameWrapper"><div class="embed-responsive-item" id="enchant-stage"></div></div>
                    </div>

                    <div class="col-md-4 column sidebar"> 
                    <a href="#" class="list-group-item active">World Chat</a>                       
                        <div id="wrapper_chat">
                            <div id="chatbox">
                        </div>  
                            <form name="message" action="" class="form-inline">
                                <div class="form-group">
                                <input name="usermsg" type="text" id="usermsg" class="form-control"/>
                                <input name="submitmsg" type="submit"  id="submitmsg"  value="Send" class="btn btn-info">
                                </div>
                            </form>
                        </div>

                    </div>

            </div>
        </div>
    </div>
</div>
</body>
</html>

<script type="application/javascript">
checkSession();

//cannot bypass login
$('#loginModal').modal({
  backdrop: 'static',
  keyboard: false,
  show: false
});
</script>

