<?php
    require_once("conexao.php");
?>
<?php
    //Adicionar Variavel de Sessão
    session_start();

    if(isset($_POST["user"])){
        $usuario = $_POST["user"];
        $senha   = $_POST["senha"]; 

        $login = "SELECT * FROM usuario WHERE login = '{$usuario}' AND senha = '{$senha}'";
        $acesso = mysqli_query($conecta, $login);
        if(!$acesso){
            die("Falha na Consulta ao Banco");
        }        
        $informacao = mysqli_fetch_assoc($acesso);
        if( empty($informacao)){
            $mensagem = "Login Sem Sucesso, Tente Novamente";
        }else{
            $_SESSION["user"] = $informacao["login"];
            header("location:index.php");
        }
    }
?>
<?php
    
?>
<!DOCTYPE html>
<html lang="pt-br">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ReuseTech Login</title>
        <!--LINKS CSS-->
            <link rel="stylesheet" href="css/main.css">
            <link rel="stylesheet" href="css/header.css">
            <link rel="stylesheet" href="css/form.css">
    </head>
    <body>
        <header>
            <img src="images/reusetech.png" alt="ReuseTech">
            <h1>ReuseTech</h1>
        </header>
        <main>
            <form action="login.php" method="POST">
                <h1>Login</h1>
                <input type="text" placeholder="Usuário" name="user"><br>
                <input type="password" name="senha" placeholder="Senha"><br>
                <input type="submit" value="Entrar">
                <?php if(isset($mensagem)){ ?>
                <p style="background-color:  rgb(252, 70, 70);"><?php echo $mensagem; }?></p>
            </form>
        </main>
    </body>
</html>
<?php
    mysqli_close($conecta);
?>