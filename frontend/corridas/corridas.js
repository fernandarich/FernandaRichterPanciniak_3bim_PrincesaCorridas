const URL_API = 'http://localhost:3001';
const SILHUETA_URL = '../imagens/silhueta.png';

let oQueEstaFazendo = '';
let categorias = [];
let categoriasCarregadas = Promise.resolve();
let urlImagemPreview = null;

async function carregarCategorias() {
    const selectCategoria = document.getElementById('selectCategoria');
    try {
        const resposta = await fetch(`${URL_API}/categorias`);
        if (!resposta.ok) throw new Error('Não foi possível carregar as categorias.');
        categorias = await resposta.json();
        selectCategoria.replaceChildren(new Option('Selecione uma categoria...', ''));
        categorias.forEach(categoria => {
            selectCategoria.add(new Option(categoria.nome_categoria, categoria.id_categoria));
        });
    } catch (erro) {
        console.error('Erro ao carregar categorias:', erro);
        selectCategoria.replaceChildren(new Option('Categorias indisponíveis', ''));
    }
}

function inicializar() {
    bloquearAtributos(true);
    categoriasCarregadas = carregarCategorias();
}

function validarResposta(resposta) {
    return resposta.json().then(resultado => {
        if (!resposta.ok || resultado.sucesso === false) {
            throw new Error(resultado.mensagem || 'Não foi possível concluir a operação.');
        }
        return resultado;
    });
}

async function procurePorChavePrimaria(id) {
    const resposta = await fetch(`${URL_API}/corridas/${id}`);
    const resultado = await resposta.json();
    if (!resposta.ok) throw new Error(resultado.mensagem || 'Erro ao consultar corrida.');
    return resultado.sucesso ? resultado.corrida : null;
}

async function procure() {
    const campoId = document.getElementById('inputId_corrida');
    const id = campoId.value.trim();
    if (!/^\d{1,2}$/.test(id)) {
        mostrarAviso('O ID da corrida deve ter de 1 a 2 dígitos.');
        return;
    }

    try {
        await categoriasCarregadas;
        const corrida = await procurePorChavePrimaria(id);
        oQueEstaFazendo = '';
        if (corrida) {
            mostrarDadosCorrida(corrida);
            carregarImagem(id);
            visibilidadeDosBotoes('inline', 'none', 'inline', 'inline', 'none');
            mostrarAviso('Corrida encontrada. Você pode alterar ou excluir.');
        } else {
            limparAtributos();
            campoId.value = id;
            carregarImagem(null);
            visibilidadeDosBotoes('inline', 'inline', 'none', 'none', 'none');
            mostrarAviso('Corrida não encontrada. Você pode inserir um novo cadastro.');
        }
    } catch (erro) {
        mostrarAviso(erro.message || 'Erro ao consultar corrida.');
    }
}

function inserir() {
    oQueEstaFazendo = 'inserindo';
    bloquearAtributos(false);
    visibilidadeDosBotoes('none', 'none', 'none', 'none', 'inline');
    mostrarAviso('INSERINDO - Preencha os dados e clique em Salvar.');
}

function alterar() {
    oQueEstaFazendo = 'alterando';
    bloquearAtributos(false);
    visibilidadeDosBotoes('none', 'none', 'none', 'none', 'inline');
    mostrarAviso('ALTERANDO - Atualize os dados e clique em Salvar.');
}

function excluir() {
    oQueEstaFazendo = 'excluindo';
    bloquearAtributos(true);
    visibilidadeDosBotoes('none', 'none', 'none', 'none', 'inline');
    mostrarAviso('EXCLUINDO - Clique em Salvar para confirmar a exclusão.');
}

async function uploadImagemParaServidor(id) {
    const arquivo = document.getElementById('inputImagem').files[0];
    if (!arquivo) return;

    const formData = new FormData();
    formData.append('imagem', arquivo);
    const resposta = await fetch(`${URL_API}/corridas/upload/${id}`, {
        method: 'POST',
        body: formData
    });
    await validarResposta(resposta);
}

async function salvar() {
    const id = document.getElementById('inputId_corrida').value.trim();
    const nome = document.getElementById('inputNome_corrida').value.trim();
    const cidade = document.getElementById('inputCidade').value.trim();
    const data_corrida = document.getElementById('inputData').value || null;
    const id_categoria = document.getElementById('selectCategoria').value || null;

    if (!/^\d{1,2}$/.test(id)) {
        mostrarAviso('O ID da corrida deve ter de 1 a 2 dígitos.');
        return;
    }
    if (!nome) {
        mostrarAviso('Informe o nome da corrida.');
        return;
    }

    const dadosCorrida = { id_corrida: id, nome, cidade, data_corrida, id_categoria };
    try {
        if (oQueEstaFazendo === 'inserindo') {
            const resposta = await fetch(`${URL_API}/corridas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosCorrida)
            });
            await validarResposta(resposta);
            await uploadImagemParaServidor(id);
            mostrarAviso('Corrida cadastrada com sucesso.');
        } else if (oQueEstaFazendo === 'alterando') {
            const resposta = await fetch(`${URL_API}/corridas/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosCorrida)
            });
            await validarResposta(resposta);
            await uploadImagemParaServidor(id);
            mostrarAviso('Corrida alterada com sucesso.');
        } else if (oQueEstaFazendo === 'excluindo') {
            const resposta = await fetch(`${URL_API}/corridas/${id}`, { method: 'DELETE' });
            await validarResposta(resposta);
            mostrarAviso('Corrida excluída com sucesso.');
        } else {
            mostrarAviso('Escolha Inserir, Alterar ou Excluir antes de salvar.');
            return;
        }

        visibilidadeDosBotoes('inline', 'none', 'none', 'none', 'none');
        limparAtributos();
        document.getElementById('inputId_corrida').value = '';
        carregarImagem(null);
        await listar();
    } catch (erro) {
        console.error('Erro ao salvar corrida:', erro);
        mostrarAviso(erro.message || 'Erro ao efetuar operação no servidor.');
    }
}

async function listar() {
    const saida = document.getElementById('outputSaida');
    try {
        await categoriasCarregadas;
        const resposta = await fetch(`${URL_API}/corridas`);
        if (!resposta.ok) throw new Error('Não foi possível carregar as corridas.');
        const corridas = await resposta.json();
        saida.replaceChildren();

        corridas.forEach(corrida => {
            const categoria = categorias.find(item => String(item.id_categoria) === String(corrida.id_categoria));
            const nomeCategoria = categoria?.nome_categoria || (corrida.id_categoria ? `Categoria ${corrida.id_categoria}` : 'Sem categoria');
            const data = corrida.data_corrida ? String(corrida.data_corrida).split('T')[0] : 'Sem data';
            const linha = document.createElement('div');
            linha.textContent = `[${corrida.id_corrida}] - ${corrida.nome} - ${corrida.cidade || 'Sem cidade'} - ${data} - ${nomeCategoria}`;
            saida.append(linha);
        });

        if (corridas.length === 0) saida.textContent = 'Nenhuma corrida cadastrada.';
    } catch (erro) {
        console.error('Erro ao listar corridas:', erro);
        saida.textContent = 'Servidor offline ou erro ao carregar corridas.';
    }
}

function cancelarOperacao() {
    limparAtributos();
    document.getElementById('inputId_corrida').value = '';
    carregarImagem(null);
    visibilidadeDosBotoes('inline', 'none', 'none', 'none', 'none');
    mostrarAviso('Operação cancelada.');
}

function mostrarDadosCorrida(corrida) {
    document.getElementById('inputId_corrida').value = corrida.id_corrida;
    document.getElementById('inputNome_corrida').value = corrida.nome || '';
    document.getElementById('inputCidade').value = corrida.cidade || '';
    document.getElementById('inputData').value = corrida.data_corrida ? String(corrida.data_corrida).split('T')[0] : '';
    document.getElementById('selectCategoria').value = corrida.id_categoria || '';
    bloquearAtributos(true);
}

function limparAtributos() {
    oQueEstaFazendo = '';
    document.getElementById('inputNome_corrida').value = '';
    document.getElementById('inputCidade').value = '';
    document.getElementById('inputData').value = '';
    document.getElementById('selectCategoria').value = '';
    document.getElementById('inputImagem').value = '';
    if (urlImagemPreview) URL.revokeObjectURL(urlImagemPreview);
    urlImagemPreview = null;
    bloquearAtributos(true);
}

function bloquearAtributos(soLeitura) {
    document.getElementById('inputId_corrida').readOnly = ['alterando', 'excluindo'].includes(oQueEstaFazendo);
    document.getElementById('inputNome_corrida').readOnly = soLeitura;
    document.getElementById('inputCidade').readOnly = soLeitura;
    document.getElementById('inputData').disabled = soLeitura;
    document.getElementById('selectCategoria').disabled = soLeitura;
}

function visibilidadeDosBotoes(btP, btI, btA, btE, btS) {
    document.getElementById('btProcure').style.display = btP;
    document.getElementById('btInserir').style.display = btI;
    document.getElementById('btAlterar').style.display = btA;
    document.getElementById('btExcluir').style.display = btE;
    document.getElementById('btSalvar').style.display = btS;
    document.getElementById('btCancelar').style.display = btS;
}

function mostrarAviso(mensagem) {
    document.getElementById('divAviso').textContent = mensagem;
}

function carregarImagem(id) {
    const imagem = document.getElementById('imgMoto');
    imagem.onerror = () => {
        imagem.onerror = null;
        imagem.src = SILHUETA_URL;
    };
    imagem.src = id
        ? `${URL_API}/imagens/corridas/${id}c.jpeg?t=${Date.now()}`
        : SILHUETA_URL;
}

function acionarUpload() {
    if (!['inserindo', 'alterando'].includes(oQueEstaFazendo)) {
        mostrarAviso('Clique em Inserir ou Alterar antes de escolher uma imagem.');
        return;
    }
    document.getElementById('inputImagem').click();
}

function previewImagem() {
    const arquivo = document.getElementById('inputImagem').files[0];
    if (!arquivo) return;
    if (urlImagemPreview) URL.revokeObjectURL(urlImagemPreview);
    urlImagemPreview = URL.createObjectURL(arquivo);
    document.getElementById('imgMoto').src = urlImagemPreview;
    mostrarAviso('Imagem selecionada. Clique em Salvar para enviar.');
}

window.addEventListener('DOMContentLoaded', inicializar);