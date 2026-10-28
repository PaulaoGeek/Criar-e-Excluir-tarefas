const overlay = document.getElementById("overlay");
const Criartarefa = document.getElementById("Criartarefa");

// URL oficial da sua API local
const API_URL = "http://localhost:3000/tarefas";

// Listas para gerenciar os dados
let listaDeTarefas = [];       // Guarda todas as tarefas vindas da API
let tarefasFiltradas = [];     // Guarda apenas as tarefas que combinam com a pesquisa

function novaTarefa() {
    overlay.classList.add('active');
    Criartarefa.classList.add('active');
}

function fecharModal() {
    overlay.classList.remove('active');
    Criartarefa.classList.remove('active');
    document.querySelector(".modal form").reset();
    removerAvisoErro();
}

// --- 1. BUSCAR TAREFAS DO API.JSON ---
async function carregarTarefas() {
    try {
        const resposta = await fetch(API_URL);
        listaDeTarefas = await resposta.json();
        
        // Ao carregar, a lista filtrada começa igual à lista completa
        tarefasFiltradas = [...listaDeTarefas]; 
        
        renderizarTarefas();
    } catch (erro) {
        console.error("Erro ao buscar dados do api.json:", erro);
    }
}

const formulario = document.querySelector(".modal form");

formulario.addEventListener("submit", async function(event) {
    event.preventDefault();

    const inputTitulo = document.getElementById("titulo").value;
    const inputDescricao = document.getElementById("descricao").value;

    removerAvisoErro();

    if (inputTitulo.trim() === "") {
        exibirAvisoErro();
        return;
    }

    const novaTarefaObjeto = {
        titulo: inputTitulo,
        descricao: inputDescricao
    };

    // --- 2. SALVAR NOVA TAREFA NO API.JSON ---
    try {
        await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(novaTarefaObjeto)
        });

        fecharModal();
        
        // Limpa o campo de busca para mostrar a nova tarefa na lista geral
        document.getElementById("busca").value = "";
        
        await carregarTarefas();

        setTimeout(() => {
            alert("Tarefa adicionada com sucesso!");
        }, 100);

    } catch (erro) {
        alert("Erro ao salvar a tarefa no banco de dados.");
        console.error(erro);
    }
});

function exibirAvisoErro() {
    const inputTitulo = document.getElementById("titulo");
    const aviso = document.createElement("p");
    aviso.id = "aviso-erro";
    aviso.innerHTML = "⚠️ Por favor, digite um título para a sua tarefa!";
    inputTitulo.insertAdjacentElement("afterend", aviso);
}

function removerAvisoErro() {
    const avisoExistente = document.getElementById("aviso-erro");
    if (avisoExistente) {
        avisoExistente.remove();
    }
}

// --- 3. RENDEREZAR TAREFAS NA TELA ---
function renderizarTarefas() {
    const secaoTarefas = document.getElementById("tarefas");
    const termoBusca = document.getElementById("busca").value.trim();

    secaoTarefas.innerHTML = `<h2>Tarefas <button onclick="novaTarefa()">nova tarefa</button></h2>`;

    // REGRA DA BUSCA VAZIA: Se o usuário pesquisou algo e não achou nenhuma correspondência,
    // as barras/cards desaparecem completamente (fica oculto, não exibe nem o "Nenhuma tarefa registrada")
    if (tarefasFiltradas.length === 0 && termoBusca !== "") {
        return; 
    }

    // Se a API inteira estiver vazia originalmente (sem busca ativa)
    if (listaDeTarefas.length === 0) {
        secaoTarefas.innerHTML += `<h6>Nenhuma tarefa registrada</h6>`;
        return;
    }

    // Desenha na tela apenas o que passou pelo filtro da busca
    tarefasFiltradas.forEach(tarefa => {
        const divTarefa = document.createElement("div");
        divTarefa.classList.add("card-tarefa");
        
        divTarefa.innerHTML = `
            <div class="conteudo-tarefa">
                <h3>${tarefa.titulo}</h3>
                <p>${tarefa.descricao}</p>
            </div>
            <button class="btn-deletar" onclick="deletarTarefa('${tarefa.id}')">
                🗑️
            </button>
        `;
        secaoTarefas.appendChild(divTarefa);
    });
}

/// --- 4. DELETAR TAREFA DO API.JSON (VERSÃO CORRIGIDA) ---
async function deletarTarefa(idDaTarefa) {
    try {
        // Envia o comando de exclusão para o banco de dados
        const resposta = await fetch(`${API_URL}/${idDaTarefa}`, {
            method: "DELETE"
        });

        // Se a API respondeu que deu certo, avisa o usuário primeiro!
        if (resposta.ok) {
            alert("Tarefa deletada com sucesso!");
        }
        
        // Limpa a barra de pesquisa para que tudo volte ao normal sem bugs visuais
        document.getElementById("busca").value = "";
        
        // Agora sim, busca os dados atualizados do banco para redesenhar a tela
        await carregarTarefas();

    } catch (erro) {
        alert("Erro ao deletar a tarefa do banco.");
        console.error(erro);
    }
}

// --- 5. LÓGICA FILTRAR POR TÍTULO OU DESCRIÇÃO (INPUT DE BUSCA) ---
const inputBusca = document.getElementById("busca");

inputBusca.addEventListener("input", function() {
    const termo = inputBusca.value.toLowerCase().trim();

    // Filtra checando se o termo digitado está contido no título OU na descrição
    tarefasFiltradas = listaDeTarefas.filter(tarefa => {
        const tituloContem = tarefa.titulo.toLowerCase().includes(termo);
        const descricaoContem = tarefa.descricao ? tarefa.descricao.toLowerCase().includes(termo) : false;
        
        return tituloContem || descricaoContem;
    });

    // Redesenha os elementos na tela com base no novo filtro (funciona no backspace também!)
    renderizarTarefas();
});

// INICIALIZAÇÃO
carregarTarefas();
