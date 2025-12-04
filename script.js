// =================================================================
// script.js: Lógica com Navegação Passo-a-Passo e Ponderação Final
// =================================================================

// Variável de estado para acompanhar o progresso
let perguntaAtual = 0; // 0 a 9 para as afirmações, 10 para a ponderação, 11 para resultados.

// -----------------------------------------------------------------
// 1. Definição dos Dados do Programa
// -----------------------------------------------------------------

const AFIRMACOES = [
    "1. A educação deve ser totalmente gratuita em todos os níveis, incluindo o universitário.",
    "2. O Governo deve aumentar os impostos sobre o turismo de luxo para financiar a saúde.",
    "3. A transição energética para 100% de energias renováveis deve ser prioridade máxima, mesmo que isso aumente o custo da eletricidade a curto prazo.",
    "4. É necessário criar um imposto sobre a propriedade para combater a especulação imobiliária.",
    "5. As políticas de repatriamento da diáspora devem ser intensificadas com benefícios fiscais.",
    "6. A descentralização administrativa deve ser acelerada, dando mais poder aos municípios.",
    "7. O investimento público em infraestruturas marítimas e portuárias deve ser duplicado.",
    "8. A idade de reforma deve ser aumentada gradualmente para garantir a sustentabilidade da segurança social.",
    "9. Medidas mais rígidas de controlo de imigração são necessárias para proteger o mercado de trabalho local.",
    "10. O uso de tecnologias digitais na administração pública deve ser obrigatório e universal até 2026."
];

const OPCOES_RESPOSTA = [
    { nome: "Discordo Totalmente", valor: -2 },
    { nome: "Discordo", valor: -1 },
    { nome: "Neutro / Não Sei", valor: 0 },
    { nome: "Concordo", valor: 1 },
    { nome: "Concordo Totalmente", valor: 2 }
];

const OPCOES_PONDERACAO = [
    { nome: "Não Importa (0)", valor: 0 },
    { nome: "Pouco Importante (1)", valor: 1 },
    { nome: "Importante (2)", valor: 2 },
    { nome: "Muito Importante (3)", valor: 3 }
];

const POSICOES_PARTIDOS = {
    "PAICV": [2, 1, 2, 1, 0, 2, 1, -1, -2, 1],
    "MPD": [-1, 0, 0, -1, 1, 0, 2, 1, 1, 2],
    "UCID": [0, 2, 1, 2, -1, 1, 0, 0, 0, -1]
};

// -----------------------------------------------------------------
// 2. Funções de Exibição e Navegação
// -----------------------------------------------------------------

function gerarHTMLPergunta(index) {
    /**
     * Gera o HTML para uma única afirmação.
     */
    if (index >= AFIRMACOES.length) return '';

    const afirmacao = AFIRMACOES[index];
    const afirmacaoId = `afirmacao-${index}`;
    let htmlContent = '';

    htmlContent += `
        <div class="afirmacao">
            <h3>Afirmação ${index + 1} de ${AFIRMACOES.length}</h3>
            <p>${afirmacao}</p>
            <div class="opcoes-resposta" id="${afirmacaoId}">
    `;
    
    OPCOES_RESPOSTA.forEach(opcao => {
        const radioId = `${afirmacaoId}-op-${opcao.valor}`;
        
        // Verifica se esta opção já foi marcada (para quando o utilizador volta)
        const checked = document.querySelector(`input[name="${afirmacaoId}"][value="${opcao.valor}"]:checked`);
        
        htmlContent += `
            <input type="radio" id="${radioId}" name="${afirmacaoId}" value="${opcao.valor}" required ${checked ? 'checked' : ''}>
            <label for="${radioId}">${opcao.nome}</label>
        `;
    });

    htmlContent += `
            </div>
        </div>
    `;

    return htmlContent;
}

function gerarHTMLPonderacao() {
    /**
     * Gera o HTML para a secção de ponderação final (agora OPCIONAL).
     */
    const formularioPonderacao = document.getElementById('formulario-ponderacao');
    let htmlContent = '';

    AFIRMACOES.forEach((afirmacao, index) => {
        const ponderacaoId = `ponderacao-${index}`; 

        htmlContent += `
            <div class="afirmacao">
                <p>${afirmacao}</p>
                <div class="seccao-ponderacao">
                    <p>Importância:</p>
                    <div class="opcoes-ponderacao" id="${ponderacaoId}">
        `;

        OPCOES_PONDERACAO.forEach(opcao => {
            const radioId = `${ponderacaoId}-po-${opcao.valor}`;
            
            // Preserva a seleção anterior, se existir
            const checked = document.querySelector(`input[name="${ponderacaoId}"][value="${opcao.valor}"]:checked`);
            
            // ATENÇÃO: 'required' foi removido para permitir que seja opcional.
            htmlContent += `
                <input type="radio" id="${radioId}" name="${ponderacaoId}" value="${opcao.valor}" ${checked ? 'checked' : ''}>
                <label for="${radioId}">${opcao.nome}</label>
            `;
        });
        
        htmlContent += `
                    </div>
                </div>
            </div>
        `;
    });
    
    formularioPonderacao.innerHTML = htmlContent; // Atualiza o formulário de ponderação
}


function atualizarInterface() {
    /**
     * Função central que decide o que mostrar com base no estado (perguntaAtual).
     */
    const formVAA = document.getElementById('formulario-vaa');
    const formPonderacao = document.getElementById('formulario-ponderacao');
    const btnVoltar = document.getElementById('btn-voltar');
    const btnAvancar = document.getElementById('btn-avancar');
    const btnCalcular = document.getElementById('btn-calcular');
    const resultadoDiv = document.getElementById('resultado');

    // 1. Limpar e esconder tudo
    formVAA.innerHTML = '';
    formVAA.style.display = 'none';
    formPonderacao.style.display = 'none';
    btnVoltar.style.display = 'none';
    btnAvancar.style.display = 'none';
    btnCalcular.style.display = 'none';
    resultadoDiv.style.display = 'none';
    
    // 2. Determinar o que exibir
    if (perguntaAtual < AFIRMACOES.length) {
        // Exibir Pergunta (0 a 9)
        formVAA.style.display = 'block';
        formVAA.innerHTML = gerarHTMLPergunta(perguntaAtual);
        
        btnAvancar.style.display = 'inline-block';
        if (perguntaAtual > 0) {
            btnVoltar.style.display = 'inline-block';
        }
    } else if (perguntaAtual === AFIRMACOES.length) {
        // Exibir Ponderação (Pergunta 10)
        formPonderacao.style.display = 'block';
        formPonderacao.innerHTML = gerarHTMLPonderacao();
        
        btnVoltar.style.display = 'inline-block';
        btnCalcular.style.display = 'inline-block';
        
    } else if (perguntaAtual === AFIRMACOES.length + 1) {
        // Exibir Resultados (Pergunta 11)
        resultadoDiv.style.display = 'block';
        // O cálculo já foi feito, apenas a navegação muda.
        btnVoltar.style.display = 'inline-block';
    }
}

function validarPerguntaAtual(formId) {
    /**
     * Verifica se o campo de rádio necessário foi selecionado.
     */
    const form = document.getElementById(formId);
    if (!form) return true; // Se o formulário não existe (ex: secção de resultados)

    const requiredInputs = form.querySelectorAll('input[type="radio"]:required');
    
    for (const input of requiredInputs) {
        // Procuramos por qualquer conjunto de 'name' que não tenha um 'checked'
        const inputName = input.name;
        const checkedInput = form.querySelector(`input[name="${inputName}"]:checked`);
        
        // Se encontrarmos um campo 'required' que não foi verificado, é inválido.
        if (!checkedInput) {
            return false;
        }
    }
    
    return true;
}

function avancarPergunta() {
    const formAtualId = (perguntaAtual < AFIRMACOES.length) ? 'formulario-vaa' : 'formulario-ponderacao';

    // 1. Validação
    // A validação para a VAA só precisa de verificar um grupo de rádio por vez.
    const afirmacaoName = `afirmacao-${perguntaAtual}`;
    const radioSelecionado = document.querySelector(`input[name="${afirmacaoName}"]:checked`);

    if (perguntaAtual < AFIRMACOES.length && !radioSelecionado) {
        alert(`Por favor, responda à afirmação ${perguntaAtual + 1} para continuar.`);
        return; 
    }
    
    // 2. Avanço de Estado
    if (perguntaAtual < AFIRMACOES.length) {
        perguntaAtual++; // Avança para a próxima afirmação ou para a ponderação
    }
    // Não avança se estiver na ponderação, o botão 'Avançar' desaparece, dando lugar ao 'Calcular'.

    // 3. Atualizar Interface
    atualizarInterface();
}

function voltarPergunta() {
    if (perguntaAtual > 0) {
        perguntaAtual--;
    }
    atualizarInterface();
}

// -----------------------------------------------------------------
// 3. Funções de Cálculo (Mantêm-se Ponderadas)
// -----------------------------------------------------------------

const calcularAlinhamentoPonderado = (respostas, posicoes, ponderacoes) => {
    /**
     * Motor de cálculo ponderado (mantido do Passo 7).
     */
    const MAX_DIFERENCA_BASE = 4; 
    let diferencaAcumuladaPonderada = 0;
    let maxDiferencaTotalPonderada = 0; 
    
    for (let i = 0; i < respostas.length; i++) {
        const diferencaPergunta = Math.abs(respostas[i] - posicoes[i]);
        const peso = ponderacoes[i];

        diferencaAcumuladaPonderada += diferencaPergunta * peso; 
        maxDiferencaTotalPonderada += MAX_DIFERENCA_BASE * peso;
    }

    if (maxDiferencaTotalPonderada === 0) {
         return 'N/A';
    }

    const alinhamento = ((maxDiferencaTotalPonderada - diferencaAcumuladaPonderada) / maxDiferencaTotalPonderada) * 100;
    
    return alinhamento.toFixed(2);
};

function calcularResultados() {
    /**
     * Recolhe as respostas e ponderações, sendo as ponderações OPCIONAIS.
     * Se a ponderação for omitida, utiliza o peso Padrão (1).
     */
    
    // 1. Validação de Opinião: Garantir que todas as 10 perguntas de Opinião foram respondidas
    for (let i = 0; i < AFIRMACOES.length; i++) {
        const afirmacaoName = `afirmacao-${i}`;
        const radioOp = document.querySelector(`input[name="${afirmacaoName}"]:checked`);
        
        if (!radioOp) {
            alert(`Erro: Por favor, responda à afirmação ${i + 1} para calcular o alinhamento.`);
            // Volta para a pergunta não respondida
            perguntaAtual = i; 
            atualizarInterface();
            return;
        }
    }
    
    // 2. Recolher todos os dados
    const respostasEleitor = [];
    const ponderacoesEleitor = [];

    // Recolha de Respostas (Opinião) - DEVE haver 10 respostas
    for (let i = 0; i < AFIRMACOES.length; i++) {
        const radioOp = document.querySelector(`input[name="afirmacao-${i}"]:checked`);
        respostasEleitor.push(parseInt(radioOp.value, 10));
    }

    // Recolha de Ponderações (Importância) - OPCIONAL
    for (let i = 0; i < AFIRMACOES.length; i++) {
        const radioPo = document.querySelector(`input[name="ponderacao-${i}"]:checked`);
        
        if (radioPo) {
            // Se o utilizador marcou, usa o valor que marcou (0 a 3)
            ponderacoesEleitor.push(parseInt(radioPo.value, 10));
        } else {
            // Se o utilizador saltou, usamos o peso Padrão (Importância 1)
            // Isto garante que o tópico é contabilizado, mas não com o peso máximo.
            ponderacoesEleitor.push(1); 
        }
    }
    
    // 3. Calcular o alinhamento para cada partido
    const resultados = {};
    for (const partido in POSICOES_PARTIDOS) {
        // Chamamos a função de cálculo ponderado existente
        const percentagem = calcularAlinhamentoPonderado(respostasEleitor, POSICOES_PARTIDOS[partido], ponderacoesEleitor);
        resultados[partido] = (percentagem === 'N/A') ? 0 : parseFloat(percentagem);
    }
    
    // 4. Ordenar e Exibir os resultados (o código de exibição permanece inalterado)
    const resultadosOrdenados = Object.entries(resultados).sort(([, a], [, b]) => b - a);
    
    const listaResultadosDiv = document.getElementById('lista-resultados');
    listaResultadosDiv.innerHTML = ''; 
    
    resultadosOrdenados.forEach(([partido, percentagem]) => {
        // Exibir N/A se a ponderação total for zero, mas apenas se houver outros resultados.
        const valorPercentagem = (percentagem === 0 && resultadosOrdenados.length > 1) ? 'N/A' : `${percentagem}%`;
        
        const barraHTML = `
            <div class="partido-resultado">
                **${partido}**
                <div class="grafico-barra">
                    <div class="barra-preenchida" style="width: ${percentagem}%;">${valorPercentagem}</div>
                </div>
            </div>
        `;
        listaResultadosDiv.innerHTML += barraHTML;
    });

    // 5. Mudar o estado para Resultados
    perguntaAtual = AFIRMACOES.length + 1;
    atualizarInterface();
}

function resetFormulario() {
    /**
     * Reinicia o estado e o formulário.
     */
    document.getElementById('formulario-vaa').reset();
    document.getElementById('formulario-ponderacao').reset();
    perguntaAtual = 0;
    atualizarInterface();
    document.getElementById('resultado').style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
}

// Início da aplicação
window.onload = atualizarInterface;
