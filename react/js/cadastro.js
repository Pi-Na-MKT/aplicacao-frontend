function pegarDadosFormulario() {
    return {
        name: inp_nome.value.trim(),
        email: inp_email.value.trim().toLowerCase(),
        password: inp_senha.value.trim(),
        jobTitle: inp_cargo.value.trim(),
        phone: inp_telefone.value.trim()
    };
}

function validarCampos(usuario) {
    const regexSenha = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!usuario.name || !usuario.email || !usuario.password || 
        !usuario.jobTitle || !usuario.phone || !usuario.seniority || !usuario.department) {
        return "Preencha todos os campos, incluindo senioridade e departamento.";
    }

    if (!regexEmail.test(usuario.email)) {
        return "Email inválido.";
    }

    if (!regexSenha.test(usuario.password)) {
        return "Senha inválida. Deve ter 8 caracteres, uma letra maiúscula e um caractere especial.";
    }

    return null;
}

async function cadastrar() {
    const usuario = pegarDadosFormulario();

    const erro = validarCampos(usuario);
    if (erro) {
        msg.innerHTML = erro;
        return;
    }

    try {
        const resposta = await fetch("http://localhost:8080/api/users/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(usuario)
        });

        if (resposta.ok) {
            msg.innerHTML = "Cadastro realizado com sucesso!";
            setTimeout(() => {
                window.location.href = "login.html";
            }, 1500);
        } else {
            const erroApi = await resposta.json();
            msg.innerHTML = erroApi.detail || "Erro ao cadastrar. Tente novamente.";
        }
    } catch (error) {
        msg.innerHTML = "Erro de conexão com o servidor.";
    }
}