const URL_API = 'http://localhost:3001';
const SILHUETA_URL = '../imagens/silhueta.png';

let oQueEstaFazendo = '';
let produto = null;
bloquearAtributos(true);

async function inicializar() {
    await bloquearAtributos(true);
    await listar();
}

function carregarImagem(id) {
    const img = document.getElementById('imgMoto');
    if (!id) {
        img.src = SILHUETA_URL;
        return;
    }
    img.src = `${URL_API}/imagens/${id}.png?t=${new Date().getTime()}`;
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

    try {
        const resposta = await fetch(`${URL_API}/motos/upload/${id}`, {
            method: 'POST',
            body: formData
        });
        if (!resposta.ok) {
            console.error("Erro na resposta do servidor no upload da imagem");
        }
    } catch (erro) {
        console.error("Erro ao enviar imagem:", erro);
    }
}

async function validarResposta(resposta) {
    const resultado = await resposta.json();
    if (!resposta.ok || resultado.sucesso === false) {
        throw new Error(resultado.mensagem || 'Não foi possível salvar os dados.');
    }
}

async function procurePorChavePrimaria(chave) {
    try {
        const resposta = await fetch(`${URL_API}/motos/${chave}`);
        const data = await resposta.json();
        return data.sucesso ? data.moto : null;
    } catch (erro) {
        return null;
    }
}

async function procure() {
    const id_moto = document.getElementById("inputId_moto").value;
    if (isNaN(id_moto) || !Number.isInteger(Number(id_moto)) || id_moto === "") {
        mostrarAviso("Precisa ser um número inteiro");
        return;
    }

    const moto = await procurePorChavePrimaria(id_moto);
    oQueEstaFazendo = '';

    if (moto) {
        mostrarDadosMoto(moto);
        carregarImagem(id_moto);
        visibilidadeDosBotoes('inline', 'none', 'inline', 'inline', 'none');
        mostrarAviso("Achou no banco, pode alterar ou excluir");
    } else {
        limparAtributos();
        carregarImagem(null);
        visibilidadeDosBotoes('inline', 'inline', 'none', 'none', 'none');
        mostrarAviso("Não achou no banco, pode inserir");
    }
}

function inserir() {
    bloquearAtributos(false);
    visibilidadeDosBotoes('none', 'none', 'none', 'none', 'inline');
    oQueEstaFazendo = 'inserindo';
    mostrarAviso("INSERINDO - Digite os atributos, escolha a imagem e clique em salvar");
}

function alterar() {
    bloquearAtributos(false);
    visibilidadeDosBotoes('none', 'none', 'none', 'none', 'inline');
    oQueEstaFazendo = 'alterando';
    mostrarAviso("ALTERANDO - Digite os atributos, mude a imagem (opcional) e clique em salvar");
}

function excluir() {
    bloquearAtributos(true);
    visibilidadeDosBotoes('none', 'none', 'none', 'none', 'inline');
    oQueEstaFazendo = 'excluindo';
    mostrarAviso("EXCLUINDO - Clique em salvar para confirmar a exclusão");
}

async function salvar() {
    const id_moto = document.getElementById("inputId_moto").value;
    const marca = document.getElementById("inputMarca_moto").value;
    const modelo = document.getElementById("inputModelo_moto").value;
    const ano = parseInt(document.getElementById("inputAno_moto").value);
    const fichaAtiva = document.getElementById("inputFicha").checked;

    const dadosMoto = {
        id_moto,
        marca,
        modelo,
        ano,
        escapamento: fichaAtiva ? document.getElementById("inputEscapamento").value : null,
        suspensao: fichaAtiva ? document.getElementById("inputSuspensao").value : null,
        motor: fichaAtiva ? document.getElementById("inputMotor").value : null
    };

    try {
        if (oQueEstaFazendo === 'inserindo') {
            const resposta = await fetch(`${URL_API}/motos`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dadosMoto) });
            await validarResposta(resposta);
            await uploadImagemParaServidor(id_moto);
            mostrarAviso("Inserido no Banco de Dados com sucesso!");
        } else if (oQueEstaFazendo === 'alterando') {
            const resposta = await fetch(`${URL_API}/motos/${id_moto}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dadosMoto) });
            await validarResposta(resposta);
            await uploadImagemParaServidor(id_moto);
            mostrarAviso("Alterado no Banco de Dados com sucesso!");
        } else if (oQueEstaFazendo === 'excluindo') {
            await fetch(`${URL_API}/motos/${id_moto}`, { method: 'DELETE' });
            carregarImagem(null);
            mostrarAviso("Excluído do Banco de Dados!");
        }

        visibilidadeDosBotoes('inline', 'none', 'none', 'none', 'none');
        limparAtributos();
        document.getElementById("inputId_moto").value = "";
        listar();
    } catch (erro) {
        mostrarAviso("Erro ao efetuar operação no servidor.");
    }
}

async function listar() {
    try {
        const resposta = await fetch(`${URL_API}/motos`);
        const motos = await resposta.json();

        let texto = "";

        for (let linha of motos) {
            texto += `<b>[${linha.id_moto}]</b> - ${linha.marca} - ${linha.modelo} (${linha.ano})<br>`;
        }

        document.getElementById("outputSaida").innerHTML =
            texto || "Nenhuma moto cadastrada.";

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

function mostrarDadosMoto(m) {
    document.getElementById("inputId_moto").value = m.id_moto;
    document.getElementById("inputMarca_moto").value = m.marca;
    document.getElementById("inputModelo_moto").value = m.modelo;
    document.getElementById("inputAno_moto").value = m.ano;
    document.getElementById("inputEscapamento").value = m.escapamento || "";
    document.getElementById("inputSuspensao").value = m.suspensao || "";
    document.getElementById("inputMotor").value = m.motor || "";
    const temFicha = Boolean(m.escapamento || m.suspensao || m.motor);
    document.getElementById("inputFicha").checked = temFicha;
    document.getElementById("areaFicha").style.display = temFicha ? "block" : "none";
    bloquearAtributos(true);
}

function limparAtributos() {
    produto = null;
    oQueEstaFazendo = '';
    document.getElementById("inputMarca_moto").value = "";
    document.getElementById("inputModelo_moto").value = "";
    document.getElementById("inputAno_moto").value = "";
    document.getElementById("inputImagem").value = "";
    document.getElementById("inputFicha").checked = false;
    document.getElementById("inputEscapamento").value = "";
    document.getElementById("inputSuspensao").value = "";
    document.getElementById("inputMotor").value = "";

    document.getElementById("areaFicha").style.display = "none";
    bloquearAtributos(true);
}

function bloquearAtributos(soLeitura) {
    document.getElementById("inputId_moto").readOnly = !soLeitura;
    document.getElementById("inputMarca_moto").readOnly = soLeitura;
    document.getElementById("inputModelo_moto").readOnly = soLeitura;
    document.getElementById("inputAno_moto").readOnly = soLeitura;
    document.getElementById("inputImagem").readOnly = soLeitura;
    document.getElementById("inputFicha").disabled = soLeitura;
    document.getElementById("inputEscapamento").readOnly = soLeitura;
    document.getElementById("inputSuspensao").readOnly = soLeitura;
    document.getElementById("inputMotor").readOnly = soLeitura;
}

function visibilidadeDosBotoes(btP, btI, btA, btE, btS) {
    document.getElementById("btProcure").style.display = btP;
    document.getElementById("btInserir").style.display = btI;
    document.getElementById("btAlterar").style.display = btA;
    document.getElementById("btExcluir").style.display = btE;
    document.getElementById("btSalvar").style.display = btS;
    document.getElementById("btCancelar").style.display = btS;
}

document.getElementById('inputFicha').addEventListener('change', function() {

    const areaFicha = document.getElementById('areaFicha');

    if (this.checked) {
        areaFicha.style.display = 'block';
    } else {
        areaFicha.style.display = 'none';
    }

});