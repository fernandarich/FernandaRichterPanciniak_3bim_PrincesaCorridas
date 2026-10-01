const URL_API = 'http://localhost:3001';
const SILHUETA_URL = '../imagens/silhueta.png';

let oQueEstaFazendo = '';
let pessoa = null;
let carregamentoSelects = Promise.resolve();

// Inicializa a página ao carregar
async function inicializar() {
    bloquearAtributos(true);
    carregamentoSelects = carregarSelects();
    await carregamentoSelects;
    await listar();
}

// Carrega as opções de Motos e Categorias nos elementos <select>
async function carregarSelects() {
    try {
        // Carrega Motos
        const resMotos = await fetch(`${URL_API}/motos`);
        if (resMotos.ok) {
            const motos = await resMotos.json();
            const selectMoto = document.getElementById('selectId_moto');
            selectMoto.innerHTML = '<option value="">Selecione uma moto...</option>';
            motos.forEach(m => {
                selectMoto.innerHTML += `<option value="${m.id_moto}">${m.marca} - ${m.modelo}</option>`;
            });
        }

        // Carrega Categorias
        const resCategorias = await fetch(`${URL_API}/categorias`);
        if (resCategorias.ok) {
            const categorias = await resCategorias.json();
            const selectCategoria = document.getElementById('selectId_categoria');
            selectCategoria.innerHTML = '<option value="">Selecione uma categoria...</option>';
            categorias.forEach(c => {
                selectCategoria.innerHTML += `<option value="${c.id_categoria}">${c.nome_categoria || c.id_categoria}</option>`;
            });
        }
    } catch (erro) {
        console.error("Erro ao carregar opções para os selects:", erro);
    }
}

function carregarImagem(id) {
    const img = document.getElementById('imgMoto');
    if (!id) {
        img.src = SILHUETA_URL;
        return;
    }
    img.src = `${URL_API}/imagens/pessoas/${id}p.jpeg?t=${new Date().getTime()}`;
    img.onerror = () => { img.src = SILHUETA_URL; };
}

function acionarUpload() {
    if (oQueEstaFazendo !== 'inserindo' && oQueEstaFazendo !== 'alterando') {
        mostrarAviso("Clique em Inserir ou Alterar primeiro para poder escolher uma imagem.");
        return;
    }
    document.getElementById('inputImagem').click();
}

function previewImagem() {
    const inputFiles = document.getElementById('inputImagem').files;
    if (inputFiles.length > 0) {
        const url = URL.createObjectURL(inputFiles[0]);
        document.getElementById('imgMoto').src = url;
        mostrarAviso("Imagem escolhida! Clique em Salvar para concluir.");
    }
}

async function uploadImagemParaServidor(id) {
    const inputFiles = document.getElementById('inputImagem').files;
    if (inputFiles.length === 0) return;

    const formData = new FormData();
    formData.append('imagem', inputFiles[0]);

    const resposta = await fetch(`${URL_API}/pessoas/upload/${id}`, {
        method: 'POST',
        body: formData
    });
    await validarResposta(resposta);
}

async function validarResposta(resposta) {
    const resultado = await resposta.json();
    if (!resposta.ok || resultado.sucesso === false) {
        throw new Error(resultado.mensagem || 'Não foi possível salvar os dados.');
    }
}

async function procurePorChavePrimaria(chave) {
    try {
        const resposta = await fetch(`${URL_API}/pessoas/${chave}`);
        const data = await resposta.json();
        return data.sucesso ? data.pessoa : (data.id_pessoa ? data : null);
    } catch (erro) {
        return null;
    }
}

async function procure() {
    const id_pessoa = document.getElementById("inputId_pessoa").value;
    if (isNaN(id_pessoa) || !Number.isInteger(Number(id_pessoa)) || id_pessoa === "") {
        mostrarAviso("O ID precisa ser um número inteiro.");
        return;
    }

    await carregamentoSelects;
    const pessoaEncontrada = await procurePorChavePrimaria(id_pessoa);
    oQueEstaFazendo = '';

    if (pessoaEncontrada) {
        mostrarDadosPessoa(pessoaEncontrada);
        carregarImagem(id_pessoa);
        visibilidadeDosBotoes('inline', 'none', 'inline', 'inline', 'none');
        mostrarAviso("Pessoa encontrada! Você pode alterar ou excluir.");
    } else {
        limparAtributos();
        carregarImagem(null);
        visibilidadeDosBotoes('inline', 'inline', 'none', 'none', 'none');
        mostrarAviso("Pessoa não encontrada. Você pode inserir um novo cadastro.");
    }
}

function inserir() {
    bloquearAtributos(false);
    visibilidadeDosBotoes('none', 'none', 'none', 'none', 'inline');
    oQueEstaFazendo = 'inserindo';
    mostrarAviso("INSERINDO - Digite os atributos, selecione a imagem (se houver) e clique em Salvar.");
}

function alterar() {
    bloquearAtributos(false);
    visibilidadeDosBotoes('none', 'none', 'none', 'none', 'inline');
    oQueEstaFazendo = 'alterando';
    mostrarAviso("ALTERANDO - Digite os atributos, mude a imagem (opcional) e clique em Salvar.");
}

function excluir() {
    bloquearAtributos(true);
    visibilidadeDosBotoes('none', 'none', 'none', 'none', 'inline');
    oQueEstaFazendo = 'excluindo';
    mostrarAviso("EXCLUINDO - Clique em Salvar para confirmar a exclusão.");
}

async function salvar() {
    const id_pessoa = document.getElementById("inputId_pessoa").value;
    const nome = document.getElementById("inputNome").value;
    const data_nascimento = document.getElementById("inputData_nascimento").value;
    const cidade = document.getElementById("inputCidade").value;
    const telefone = document.getElementById("inputTelefone").value;
    const ehPiloto = document.getElementById("inputPiloto").checked;

    const dadosPessoa = {
        id_pessoa,
        nome,
        data_nascimento,
        cidade,
        telefone,
        ehPiloto,
        numero: ehPiloto ? document.getElementById("inputNumero").value : null,
        id_moto: ehPiloto ? document.getElementById("selectId_moto").value : null,
        id_categoria: ehPiloto ? document.getElementById("selectId_categoria").value : null
    };

    try {
        if (oQueEstaFazendo === 'inserindo') {
            const resposta = await fetch(`${URL_API}/pessoas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosPessoa)
            });
            await validarResposta(resposta);
            await uploadImagemParaServidor(id_pessoa);
            mostrarAviso("Inserido no Banco de Dados com sucesso!");
        } else if (oQueEstaFazendo === 'alterando') {
            const resposta = await fetch(`${URL_API}/pessoas/${id_pessoa}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosPessoa)
            });
            await validarResposta(resposta);
            await uploadImagemParaServidor(id_pessoa);
            mostrarAviso("Alterado no Banco de Dados com sucesso!");
        } else if (oQueEstaFazendo === 'excluindo') {
            const resposta = await fetch(`${URL_API}/pessoas/${id_pessoa}`, { method: 'DELETE' });
            await validarResposta(resposta);
            carregarImagem(null);
            mostrarAviso("Excluído do Banco de Dados!");
        }

        visibilidadeDosBotoes('inline', 'none', 'none', 'none', 'none');
        limparAtributos();
        carregarImagem(null);
        document.getElementById("inputId_pessoa").value = "";
        listar();
    } catch (erro) {
        console.error("Erro ao efetuar operação:", erro);
        mostrarAviso(erro.message || "Erro ao efetuar operação no servidor.");
    }
}

async function listar() {
    try {
        const resposta = await fetch(`${URL_API}/pessoas`);
        const pessoas = await resposta.json();

        let texto = "";

        for (let linha of pessoas) {
            const infoPiloto = linha.ehPiloto || linha.numero ? ` (Piloto Nº ${linha.numero || 'S/N'})` : '';
            texto += `<b>[${linha.id_pessoa}]</b> - ${linha.nome} - ${linha.cidade || 'S/C'}${infoPiloto}<br>`;
        }

        document.getElementById("outputSaida").innerHTML =
            texto || "Nenhuma pessoa cadastrada.";

    } catch (erro) {
        console.error("Erro ao listar:", erro);
        document.getElementById("outputSaida").innerHTML =
            "Servidor offline ou erro de conexão.";
    }
}

function cancelarOperacao() {
    limparAtributos();
    carregarImagem(null);
    bloquearAtributos(true);
    visibilidadeDosBotoes('inline', 'none', 'none', 'none', 'none');
    mostrarAviso("Cancelou a operação");
}

function mostrarAviso(mensagem) {
    document.getElementById("divAviso").innerHTML = mensagem;
}

function mostrarDadosPessoa(p) {
    document.getElementById("inputId_pessoa").value = p.id_pessoa;
    document.getElementById("inputNome").value = p.nome || "";
    
    // Formata a data se necessário para preencher o input tipo 'date' (AAAA-MM-DD)
    if (p.data_nascimento) {
        const dataFormatada = p.data_nascimento.split('T')[0];
        document.getElementById("inputData_nascimento").value = dataFormatada;
    } else {
        document.getElementById("inputData_nascimento").value = "";
    }

    document.getElementById("inputCidade").value = p.cidade || "";
    document.getElementById("inputTelefone").value = p.telefone || "";

    const ehPiloto = Boolean(p.ehPiloto || p.numero || p.id_moto || p.id_categoria);
    document.getElementById("inputPiloto").checked = ehPiloto;
    document.getElementById("areaFicha").style.display = ehPiloto ? "block" : "none";

    document.getElementById("inputNumero").value = p.numero || "";
    document.getElementById("selectId_moto").value = p.id_moto || "";
    document.getElementById("selectId_categoria").value = p.id_categoria || "";

    bloquearAtributos(true);
}

function limparAtributos() {
    pessoa = null;
    oQueEstaFazendo = '';
    document.getElementById("inputNome").value = "";
    document.getElementById("inputData_nascimento").value = "";
    document.getElementById("inputCidade").value = "";
    document.getElementById("inputTelefone").value = "";
    document.getElementById("inputImagem").value = "";
    document.getElementById("inputPiloto").checked = false;
    document.getElementById("inputNumero").value = "";
    document.getElementById("selectId_moto").value = "";
    document.getElementById("selectId_categoria").value = "";

    document.getElementById("areaFicha").style.display = "none";
    bloquearAtributos(true);
}

function bloquearAtributos(soLeitura) {
    document.getElementById("inputId_pessoa").readOnly = !soLeitura;
    document.getElementById("inputNome").readOnly = soLeitura;
    document.getElementById("inputData_nascimento").readOnly = soLeitura;
    document.getElementById("inputCidade").readOnly = soLeitura;
    document.getElementById("inputTelefone").readOnly = soLeitura;
    document.getElementById("inputPiloto").disabled = soLeitura;
    document.getElementById("inputNumero").readOnly = soLeitura;
    document.getElementById("selectId_moto").disabled = soLeitura;
    document.getElementById("selectId_categoria").disabled = soLeitura;
}

function visibilidadeDosBotoes(btP, btI, btA, btE, btS) {
    document.getElementById("btProcure").style.display = btP;
    document.getElementById("btInserir").style.display = btI;
    document.getElementById("btAlterar").style.display = btA;
    document.getElementById("btExcluir").style.display = btE;
    document.getElementById("btSalvar").style.display = btS;
    document.getElementById("btCancelar").style.display = btS;
}

// Evento para alternar a visibilidade da área de piloto
document.getElementById('inputPiloto').addEventListener('change', function() {
    const areaFicha = document.getElementById('areaFicha');
    areaFicha.style.display = this.checked ? 'block' : 'none';
});

// Executa a inicialização ao carregar a página
window.addEventListener('DOMContentLoaded', inicializar);