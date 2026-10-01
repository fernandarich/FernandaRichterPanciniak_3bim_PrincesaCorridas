const URL_API = 'http://localhost:3001';

let oQueEstaFazendo = '';
let unidadeMedida = null;
bloquearAtributos(true);

async function procurePorChavePrimaria(chave) {
    try {
        const resposta = await fetch(`${URL_API}/categorias/${chave}`);
        const data = await resposta.json();
        return data.sucesso ? data.categoria : null;
    } catch (erro) {
        return null;
    }
}

async function procure() {
    const id_categoria = document.getElementById("inputId_categoria").value.trim().toUpperCase();
    if (!id_categoria || id_categoria.length > 2) {
        mostrarAviso("O ID da categoria deve conter de 1 a 2 caracteres (ex: 01, 02).");
        return;
    }

    document.getElementById("inputId_categoria").value = id_categoria;
    categoria = await procurePorChavePrimaria(id_categoria);
    oQueEstaFazendo = '';
    
    if (categoria) {
        mostrarDadosCategoria(categoria);
        visibilidadeDosBotoes('inline', 'none', 'inline', 'inline', 'none');
        mostrarAviso("Achou no banco, pode alterar ou excluir");
    } else {
        limparAtributos();
        visibilidadeDosBotoes('inline', 'inline', 'none', 'none', 'none');
        mostrarAviso("Não achou no banco, pode inserir");
    }
}

function inserir() {
    bloquearAtributos(false);
    visibilidadeDosBotoes('none', 'none', 'none', 'none', 'inline');
    oQueEstaFazendo = 'inserindo';
    mostrarAviso("INSERINDO - Digite o nome da categoria e clique em salvar");
}

function alterar() {
    bloquearAtributos(false);
    visibilidadeDosBotoes('none', 'none', 'none', 'none', 'inline');
    oQueEstaFazendo = 'alterando';
    mostrarAviso("ALTERANDO - Digite o novo nome e clique em salvar");
}

function excluir() {
    bloquearAtributos(true);
    visibilidadeDosBotoes('none', 'none', 'none', 'none', 'inline');
    oQueEstaFazendo = 'excluindo';
    mostrarAviso("EXCLUINDO - Clique em salvar para confirmar a exclusão");
}

async function salvar() {
    const id_categoria = document.getElementById("inputId_categoria").value.trim().toUpperCase();
    const nome_categoria = document.getElementById("inputNome_categoria").value;
    const descricao = document.getElementById("inputDescricao_categoria").value;

    const dadosCategoria = { id_categoria, nome_categoria, descricao };

    try {
        if (oQueEstaFazendo === 'inserindo') {
            const resp = await fetch(`${URL_API}/categorias`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dadosCategoria) });
            const data = await resp.json();
            if (!data.sucesso) return mostrarAviso(data.mensagem);
            mostrarAviso("Inserido no Banco de Dados com sucesso!");
        } else if (oQueEstaFazendo === 'alterando') {
            const resp = await fetch(`${URL_API}/categorias/${id_categoria}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dadosCategoria) });
            const data = await resp.json();
            if (!data.sucesso) return mostrarAviso(data.mensagem);
            mostrarAviso("Alterado no Banco de Dados com sucesso!");
        } else if (oQueEstaFazendo === 'excluindo') {
            const resposta = await fetch(`${URL_API}/categorias/${id_categoria}`, { method: 'DELETE' });
            const data = await resposta.json();
            if (!data.sucesso) {
                mostrarAviso(data.mensagem || "Erro ao excluir no servidor.");
                return;
            }
            mostrarAviso("Excluído do Banco de Dados!");
        }

        visibilidadeDosBotoes('inline', 'none', 'none', 'none', 'none');
        limparAtributos();
        document.getElementById("inputId_categoria").value = "";
        listar();
    } catch (erro) {
        mostrarAviso("Erro ao efetuar operação no servidor.");
    }
}

async function listar() {
    try {
        const resposta = await fetch(`${URL_API}/categorias`);
        const categorias = await resposta.json();

        let texto = "";

        for (let linha of categorias) {
            texto += `<b>[${linha.id_categoria}]</b> - ${linha.nome_categoria}<br>`;
        }

        document.getElementById("outputSaida").innerHTML =
            texto || "Nenhuma categoria cadastrada.";

    } catch (erro) {
        console.error("Erro ao listar:", erro);
        document.getElementById("outputSaida").innerHTML =
            "Servidor offline ou erro de conexão.";
    }
}

function cancelarOperacao() {
    limparAtributos();
    bloquearAtributos(true);
    visibilidadeDosBotoes('inline', 'none', 'none', 'none', 'none');
    mostrarAviso("Cancelou a operação");
}

function mostrarAviso(mensagem) {
    document.getElementById("divAviso").innerHTML = mensagem;
}

function mostrarDadosCategoria(c) {
    document.getElementById("inputId_categoria").value = c.id_categoria;
    document.getElementById("inputNome_categoria").value = c.nome_categoria;
    document.getElementById("inputDescricao_categoria").value = c.descricao;
    bloquearAtributos(true);
}

function limparAtributos() {
    categoria = null;
    oQueEstaFazendo = '';
    document.getElementById("inputNome_categoria").value = "";
    document.getElementById("inputDescricao_categoria").value = "";
    bloquearAtributos(true);
}

function bloquearAtributos(soLeitura) {
    document.getElementById("inputId_categoria").readOnly = !soLeitura;
    document.getElementById("inputNome_categoria").readOnly = soLeitura;
    document.getElementById("inputDescricao_categoria").readOnly = soLeitura;
}

function visibilidadeDosBotoes(btP, btI, btA, btE, btS) {
    document.getElementById("btProcure").style.display = btP;
    document.getElementById("btInserir").style.display = btI;
    document.getElementById("btAlterar").style.display = btA;
    document.getElementById("btExcluir").style.display = btE;
    document.getElementById("btSalvar").style.display = btS;
    document.getElementById("btCancelar").style.display = btS;
}