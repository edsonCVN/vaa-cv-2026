// =================================================================
// script.js: Lógica Principal, Dados e Cálculo
// =================================================================

// -----------------------------------------------------------------
// 1. Definição dos Dados do Programa
// -----------------------------------------------------------------

// As 10 Afirmações sobre tópicos de Cabo Verde (fictícias para o exemplo)
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

// Mapeamento das Opções de Resposta para os Valores Numéricos (-2 a 2)
const OPCOES_RESPOSTA = [
    { nome: "Discordo Totalmente", valor: -2 },
    { nome: "Discordo", valor: -1 },
    { nome: "Neutro / Não Sei", valor: 0 },
    { nome: "Concordo", valor: 1 },
    { nome: "Concordo Totalmente", valor: 2 }
];

// Posições dos Partidos (dados fictícios de -2 a 2: PAICV, MPD, UCID)
const POSICOES_PARTIDOS = {
    "PAICV": [2, 1, 2, 1, 0, 2, 1, -1, -2, 1],
    "MPD": [-1, 0, 0, -1, 1, 0, 2, 1, 1, 2],
    "UCID": [0, 2, 1, 2, -1, 1, 0, 0, 0, -1]
};

// Valores para a Ponderação
const OPCOES_PONDERACAO = [
    { nome: "Não Importa", valor: 0 },
    { nome: "Pouco Importante", valor: 1 },
    { nome: "Importante", valor: 2 },
    { nome: "Muito Importante", valor: 3 } // Este é o peso máximo
];

// -----------------------------------------------------------------
// 2. Funções de Interação e Cálculo
// -----------------------------------------------------------------

function gerarAfirmacoes() {
    /**
     * Cria dinamicamente os elementos HTML para as afirmações, opções de resposta E ponderação.
     */
    const form = document.getElementById('formulario-vaa');
    let htmlContent = '';

    AFIRMACOES.forEach((afirmacao, index) => {
        const afirmacaoId = `afirmacao-${index}`;
        const ponderacaoId = `ponderacao-${index}`; // Novo ID para a ponderação

        htmlContent += `
            <div class="afirmacao">
                <p>${afirmacao}</p>
                
                <div class="opcoes-resposta" id="${afirmacaoId}">
        `;
        
        OPCOES_RESPOSTA.forEach(opcao => {
            const radioId = `${afirmacaoId}-op-${opcao.valor}`;
            
            htmlContent += `
                <input type="radio" id="${radioId}" name="${afirmacaoId}" value="${opcao.valor}" required>
                <label for="${radioId}">${opcao.nome}</label>
            `;
        });

        htmlContent += `
                </div>

                <div class="seccao-ponderacao">
                    <p>Qual a importância deste tema para si?</p>
                    <div class="opcoes-ponderacao" id="${ponderacaoId}">
        `;

        OPCOES_PONDERACAO.forEach(opcao => {
            const radioId = `${ponderacaoId}-po-${opcao.valor}`;
            
            htmlContent += `
                <input type="radio" id="${radioId}" name="${ponderacaoId}" value="${opcao.valor}" required>
                <label for="${radioId}">${opcao.nome}</label>
            `;
        });
        
        htmlContent += `
                    </div>
                </div>
            </div>
        `;
    });
    
    form.innerHTML = htmlContent;
}

function calcularAlinhamento(respostasEleitor, posicoesPartido) {
    /**
     * Motor de cálculo: determina a percentagem de alinhamento.
     */
    const MAX_DIFERENCA_POR_PERGUNTA = 4;
    const maxDiferencaTotal = AFIRMACOES.length * MAX_DIFERENCA_POR_PERGUNTA;
    
    let diferencaAcumulada = 0;
    
    for (let i = 0; i < respostasEleitor.length; i++) {
        // Math.abs() calcula a distância (diferença absoluta)
        diferencaAcumulada += Math.abs(respostasEleitor[i] - posicoesPartido[i]);
    }
    
    // Fórmula de conversão de diferença total para percentagem de alinhamento
    const alinhamento = ((maxDiferencaTotal - diferencaAcumulada) / maxDiferencaTotal) * 100;
    
    return alinhamento.toFixed(2); // Formatar para 2 casas decimais
}

function calcularResultados() {
    /**
     * Recolhe as respostas e PONDERAÇÕES do eleitor, executa o cálculo e exibe o gráfico.
     */
    const form = document.getElementById('formulario-vaa');
    const respostasEleitor = [];
    const ponderacoesEleitor = []; // Nova lista para guardar as ponderações

    // 1. Recolher as respostas e ponderações, e validar
    for (let i = 0; i < AFIRMACOES.length; i++) {
        const afirmacaoName = `afirmacao-${i}`;
        const ponderacaoName = `ponderacao-${i}`; // Nome do campo de ponderação

        const radioSelecionado = form.querySelector(`input[name="${afirmacaoName}"]:checked`);
        const ponderacaoSelecionada = form.querySelector(`input[name="${ponderacaoName}"]:checked`);

        if (!radioSelecionado || !ponderacaoSelecionada) {
            alert(`Por favor, responda e defina a importância da afirmação ${i + 1} antes de calcular.`);
            document.getElementById(`afirmacao-${i}`).scrollIntoView({ behavior: 'smooth' });
            return; 
        }
        
        respostasEleitor.push(parseInt(radioSelecionado.value, 10));
        // Guarda o valor da ponderação (0 a 3)
        ponderacoesEleitor.push(parseInt(ponderacaoSelecionada.value, 10)); 
    }
    
    // 2. Definir a nova função de cálculo ponderado
    const calcularAlinhamentoPonderado = (respostas, posicoes, ponderacoes) => {
        // Diferença máxima por pergunta continua a ser 4 (|2 - (-2)|)
        const MAX_DIFERENCA_BASE = 4; 
        
        let diferencaAcumuladaPonderada = 0;
        let maxDiferencaTotalPonderada = 0; // O máximo agora depende das ponderações
        
        for (let i = 0; i < respostas.length; i++) {
            const diferencaPergunta = Math.abs(respostas[i] - posicoes[i]);
            const peso = ponderacoes[i];

            // A diferença real é multiplicada pelo peso
            diferencaAcumuladaPonderada += diferencaPergunta * peso; 

            // O máximo possível também é multiplicado pelo peso
            maxDiferencaTotalPonderada += MAX_DIFERENCA_BASE * peso;
        }

        // Se o eleitor marcou 'Não Importa' em todas as perguntas (peso total 0), evitamos a divisão por zero
        if (maxDiferencaTotalPonderada === 0) {
             return 'N/A'; // Não Avaliável
        }

        const alinhamento = ((maxDiferencaTotalPonderada - diferencaAcumuladaPonderada) / maxDiferencaTotalPonderada) * 100;
        
        return alinhamento.toFixed(2);
    };

    // 3. Executar o cálculo ponderado para cada partido
    const resultados = {};
    for (const partido in POSICOES_PARTIDOS) {
        const percentagem = calcularAlinhamentoPonderado(respostasEleitor, POSICOES_PARTIDOS[partido], ponderacoesEleitor);
        resultados[partido] = (percentagem === 'N/A') ? 0 : parseFloat(percentagem);
    }
    
    // 4. Ordenar e Exibir os resultados (o restante do código de exibição permanece igual)
    const resultadosOrdenados = Object.entries(resultados).sort(([, a], [, b]) => b - a);
    
    const listaResultadosDiv = document.getElementById('lista-resultados');
    listaResultadosDiv.innerHTML = ''; 
    
    resultadosOrdenados.forEach(([partido, percentagem]) => {
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

    document.getElementById('resultado').style.display = 'block';
    document.getElementById('resultado').scrollIntoView({ behavior: 'smooth' });
}

function resetFormulario() {
    /**
     * Limpa as seleções do formulário e esconde os resultados.
     * Chamada pelo botão 'Recomeçar'.
     */
    document.getElementById('formulario-vaa').reset();
    document.getElementById('resultado').style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Volta para o topo da página
}


// Início da aplicação: gerar as afirmações quando a página estiver carregada
window.onload = gerarAfirmacoes;