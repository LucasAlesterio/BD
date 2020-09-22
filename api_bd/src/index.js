const express = require('express');
const bodyParser = require('body-parser');
const dados = require('./csvjson.json');
const { json } = require('body-parser');
const app = express();
//cd C:\Program Files\PostgreSQL\12\bin
//.\pg_ctl -D "C:\Program Files\PostgreSQL\12\data" start
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

var knex = require('knex')({
    client: 'pg',
    version: '7.2',
    connection: {
    host : 'localhost',
    user : 'postgres',
    password : '220199',
    database : 'postgres'
    }
});
const tamanho = dados.length;
async function preencher_tabela(){
    for(var index = 0;index<tamanho;index++){
        //var index = 0;
        dado = dados[index];
        var resposta = null;
        if(porcentagem != parseInt((index * 100)/tamanho)){
            var porcentagem = parseInt((index * 100)/tamanho);
            console.clear();
            console.log(`inserindo dados:${porcentagem}%`);
        }

        resposta = await knex.select('*').from('correio.estado').where({estado:`${dado.Estado}`});
        if(resposta.length < 1){
            await knex("correio.estado").insert({estado:`${dado.Estado}`})
        }

        resposta = await knex.select('*').from('correio.cidade').where({cidade:`${dado.Cidade}`});
        if(resposta.length < 1){
            resposta = await knex.select('id').from('correio.estado').where({estado:`${dado.Estado}`});
            await knex("correio.cidade").insert({estado:`${resposta[0].id}`,cidade:`${dado.Cidade}`})
        }

        resposta = await knex.select('*').from('correio.bairro').where({nome:`${dado.Bairro}`});
        if(resposta.length < 1){
            await knex("correio.bairro").insert({nome:`${dado.Bairro}`})
        }

        resposta = await  knex.select('*').from('correio.cep').where({numero:`${dado.CEP}`});
        if(resposta.length < 1){
            resposta = await knex.select('id').from('correio.bairro').where({nome:`${dado.Bairro}`});
            var cidade = await knex.select('id').from('correio.cidade').where({cidade:`${dado.Cidade}`});
            await knex("correio.cep").insert({numero:`${dado.CEP}`,cidade:`${cidade[0].id}`,endereco:`${dado.Endereço}`,bairro:`${resposta[0].id}`})
        }
    }
}
//preencher_tabela();
var resposta = null;
async function ruasSP(){
    //console.log('Todas as ruas do estado de São Paulo:');
    resposta = await knex.select('*').from('ruassp');
    if(resposta){
        return resposta;
    }else{
        return 'Nada encontrado!'
    }
}
//ruasSP();
async function cidadesMG(){
    //console.log('Todas as cidades do estado de Minas Gerais:');
    resposta = await knex.select('*').from('cidadesmg');
    if(resposta){
        return resposta;
    }else{
        return 'Nada encontrado!'
    }
}
//cidadesMG();
async function grupo(){
    //console.log('Todos os bairros por cidade:');
    resposta = await knex.select('*').from('grupo').orderBy('cidade');
    var cidade = await knex.select('*').from('correio.cidade');
    var bairro = await knex.select('*').from('correio.bairro');
    await resposta.map((i)=>{
        i.bairro = bairro[i.bairro-1].nome;
        i.cidade = cidade[i.cidade-1].cidade;
    })
    if(resposta){
        return resposta;
    }else{
        return 'Nada encontrado!'
    }
}
//grupo();
app.get('/ruassp', async function (req, res) {
    res.send(await ruasSP());
})
app.get('/cidadesmg', async function (req, res) {
    res.send(await cidadesMG());
})
app.get('/grupo', async function (req, res) {
    res.send(await grupo());
})
app.listen(3000);