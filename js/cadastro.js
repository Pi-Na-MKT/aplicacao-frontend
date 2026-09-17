function pegarDadosFormulario(){
    return {

        nome: inp_nome.value.trim(),
        email: inp_email.value.trim(),
        senha: inp_senha.value.trim(),
        empresa: inp_empresa.value.trim(),
        cnpj: inp_cnpj.value.trim(),
        cargo: inp_cargo.value.trim(),
        telefone: inp_telefone.value.trim(),
        dataCadastro: new Date().toISOString(),
        ativo: true

    };
}

function validarCampos(usuario){

    const regexSenha = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(!usuario.nome || !usuario.email || !usuario.senha ||
       !usuario.empresa || !usuario.cnpj || !usuario.cargo || !usuario.telefone){

        return "Preencha todos os campos.";
    }

    if(usuario.email !== usuario.email.toLowerCase()){
        return "O email não pode conter letras maiúsculas.";
    }

    if(!regexEmail.test(usuario.email)){
        return "Email inválido.";
    }

    if(!regexSenha.test(usuario.senha)){
        return "Senha inválida. Deve ter 8 caracteres, uma letra maiúscula e um caractere especial.";
    }

    return null;
}
async function verificarEmail(email){

    const resposta = await fetch(`http://localhost:8080/usuarios?email=${email}`);
    const usuarios = await resposta.json();

    return usuarios.length > 0;

}

async function cadastrar(){

    const usuario = pegarDadosFormulario();

    const erro = validarCampos(usuario);
    if(erro){
        msg.innerHTML = erro;
        return;
    }

    const emailExiste = await verificarEmail(usuario.email);
    if(emailExiste){
        msg.innerHTML = "Este email já está cadastrado.";
        return;
    }

    const resposta = await fetch("http://localhost:8080/usuarios", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(usuario)
    });

    if(resposta.ok){

        msg.innerHTML = "Cadastro realizado com sucesso";

        setTimeout(()=>{
            window.location.href = "login.html";
        },1500)

    }else{
        msg.innerHTML = "Erro ao cadastrar";
    }

}