async function validar() {

    let email = inp_email.value;
    let senha = inp_senha.value;

    if(email == "" || senha == ""){
        msg.innerHTML = "Preencha todos os campos!";
        return;
    }
    
    const response = await fetch("http://localhost:8080/usuarios");

    const data = await response.json();

    const user = data.find(u => u.email == email && u.senha == senha);

    if(user){
        msg.innerHTML = "Login realizado com sucesso!";
        console.log(user)

        //window.location.href = "dashboard.html";

    }else{
        msg.innerHTML = "Email ou senha inválidos!";
    }
}