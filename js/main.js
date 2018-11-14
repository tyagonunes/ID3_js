
// Matriz de elementos para treinamento
var ce = [
    { numero: '1', Historico: 'Ruim', Divida: 'Alta', Garantia: 'Nenhuma', Renda: '$0 a $15 mil', Risco: 'Alto' },
    { numero: '2', Historico: 'Desconhecido', Divida: 'Alta', Garantia: 'Nenhuma', Renda: '$15 a $35 mil', Risco: 'Alto' },
    { numero: '3', Historico: 'Desconhecido', Divida: 'Baixa', Garantia: 'Nenhuma', Renda: '$15 a $35 mil', Risco: 'Moderado' },
    { numero: '4', Historico: 'Desconhecido', Divida: 'Baixa', Garantia: 'Nenhuma', Renda: '$0 a $15 mil', Risco: 'Alto' },
    { numero: '5', Historico: 'Desconhecido', Divida: 'Baixa', Garantia: 'Nenhuma', Renda: 'Acima de $35 mil', Risco: 'Baixo' },
    { numero: '6', Historico: 'Desconhecido', Divida: 'Baixa', Garantia: 'Adequada', Renda: 'Acima de $35 mil', Risco: 'Baixo' },
    { numero: '7', Historico: 'Ruim', Divida: 'Baixa', Garantia: 'Nenhuma', Renda: '$0 a $15 mil', Risco: 'Alto' },
    { numero: '8', Historico: 'Ruim', Divida: 'Baixa', Garantia: 'Adequada', Renda: 'Acima de $35 mil', Risco: 'Moderado' },
    { numero: '9', Historico: 'Bom', Divida: 'Baixa', Garantia: 'Nenhuma', Renda: 'Acima de $35 mil', Risco: 'Baixo' },
    { numero: '10', Historico: 'Bom', Divida: 'Alta', Garantia: 'Adequada', Renda: 'Acima de $35 mil', Risco: 'Baixo' },
    { numero: '11', Historico: 'Bom', Divida: 'Alta', Garantia: 'Nenhuma', Renda: '$0 a $15 mil', Risco: 'Alto' },
    { numero: '12', Historico: 'Bom', Divida: 'Alta', Garantia: 'Nenhuma', Renda: '$15 a $35 mil', Risco: 'Moderado' },
    { numero: '13', Historico: 'Bom', Divida: 'Alta', Garantia: 'Nenhuma', Renda: 'Acima de $35 mil', Risco: 'Baixo' },
    { numero: '14', Historico: 'Ruim', Divida: 'Alta', Garantia: 'Nenhuma', Renda: '$15 a $35 mil', Risco: 'Alto' }
];

// Propriedades a serem avaliadas
var pr = ['Historico', 'Garantia', 'Divida', 'Renda'];
//var pr = ['Renda', 'Historico', 'Divida', 'Garantia'];
var modelo;

$(document).ready(function () {
    modelo = induzir_arvore(ce, "Risco", pr)
    console.log(modelo)
})

function buscar() {

    $hc = $('#hc').val()
    $divida = $('#divida').val()
    $garantia = $('#garantia').val()
    $renda = $('#renda').val()
    $risco_resultado = $('#risco')

    var amostra = { Historico: $hc, Divida: $divida, Garantia: $garantia, Renda: $renda }
    var pred = predicao(modelo, amostra)

    $risco_resultado.text('?')

    setTimeout(function () {
        $risco_resultado.text(pred)
    }, 1000)
}

// Função induzir arvore do livro
var induzir_arvore = function (ce, alvo, pr) {

    let targets = unicos(filtrarPorPropriedade(ce, alvo))

    if (targets.length == 1) {
        // Todos elementos de CE são da mesma classe
        return { tipo: "resultado", valor: targets[0], rotulo: targets[0] }
    }
    else if (pr.length == 0) {
        // retornar nó folha rotulado com a disjunção de todas as classes de CE

        // Pega as classes restantes (sem repetição) e tras em forma de array
        var classesRestantes = unicos( filtrarPorPropriedade(ce, alvo) )

        // // Cria o texto trocando as virgulas por "OU"
        var disjuncao = classesRestantes.toString().replace(/[,]/g, ' ou ')

        return {tipo: "resultado", valor: disjuncao, rotulo: disjuncao}

    }
    else {

        // retira uma propriedade p das propriedades ( por ordem da fila )
        var p = pr.shift()
        
        // evita passar a referencia para a proxima chamada
        var copiadePr = null
        
        // cria um nó rotulado com p
        var nodo = { tipo: "propriedade", rotulo: p }
        
        // Pega os valores da coluna de propriedade p
        var valoresDeP = unicos(filtrarPorPropriedade(ce, p))
        
        nodo.valores = valoresDeP.map(function (v) {
            
            copiadePr = copia(pr)
            
            // Pega todas as linhas que tem o valor de P do momento
            var particao = ce.filter(function (x) { return x[p] == v })
            
            var nodo_filho = { rotulo: v, tipo: "propriedade_valor" }
            
            nodo_filho.filho = induzir_arvore(particao, alvo, copiadePr)
            
            return nodo_filho
        })
        
        return nodo
    }
}


var filtrarPorPropriedade = function (ce, prop) {
    // Filtra o conjunto de exemplos pela propriedade alvo
    return ce.map(function (obj) { return obj[prop] })
}

// recebe um array e o retorna sem elementos repetidos
var unicos = function (array) {
    return array.filter(function (obj, index) {
        return array.indexOf(obj) == index;
    })
}


// Função que prediz o risco com base no modelo aprendido e numa amostra de entrada do usuário
var predicao = function (modelo, amostra) {
    // Arvore de valores aprendidos
    var root = modelo;

    // Enquanto não for noh resultado (folha do ramo)
    while (root.tipo != "resultado") {

        var amostraVal = amostra[root.rotulo];

        // Encontrar entre os ramos do noh um ramo que tenha um noh rotulado com o valor da amostra
        var nodo_filho = _.find(root.valores, function (nodo) { return nodo.rotulo == amostraVal });

        root = nodo_filho.filho;
    }
    return root.valor;
}

function copia(estado) {	// retorna uma copia do estado
    var retorno = [];
    for (var i = 0; i < estado.length; i++) {	// copia elementos do array
        retorno[i] = estado[i].slice(0);		// necessario para evitar a copia por referencia
    }
    return retorno;
}

