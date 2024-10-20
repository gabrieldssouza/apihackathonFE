const { Pool } = require('pg');
const axios = require('axios').default;
const { parseStringPromise } = require('xml2js');
const { find } = require('xml2js-xpath');
const pool = new Pool({ connectionString: "postgresql://hackaton_owner:jlcp2VWgmy4O@ep-divine-bread-a5g0rfdz.us-east-2.aws.neon.tech/hackaton?sslmode=require" });

const URL_API = 'https://telemetriaws1.ana.gov.br/ServiceANA.asmx/DadosHidrometeorologicos?codEstacao=CODIGO&dataInicio=INICIO&dataFim=FIM';

const getFormattedDate = (date) => {
    return date.toISOString().split('T')[0];
};

const dataEhValida = data => /^\d{2}\/\d{2}\/\d{4}$/.test(data);

const coletarDados = async (codigo, inicio, fim) => {
    let leituras = [];

    const url = URL_API
        .replace('CODIGO', codigo)
        .replace('INICIO', inicio)
        .replace('FIM', fim);

    console.log(url);

    const resposta = await axios.get(url);
    const valorJson = await parseStringPromise(resposta.data);
    const resultados = find(valorJson, '//DadosHidrometereologicos');
    if (resultados) {
        leituras = resultados.map(resultado => {
            const dataHora = resultado.DataHora[0].trim();
            const nivel = resultado.Nivel[0];
            const vazao = resultado.Vazao[0];
            const chuva = resultado.Chuva[0];
            console.log(`Data: ${dataHora} - Nível: ${nivel} - Vazão: ${vazao} - Chuva: ${chuva}`);
            return {
                dataHora,
                nivel,
                vazao,
                chuva
            };
        });
    } else {
        console.log('Nenhum resultado retornado');
    }

    return leituras;
};

exports.checkRiverLevel = async () => {
    try {
        const now = new Date();
        const dataInicio = getFormattedDate(now);
        const dataFim = getFormattedDate(now);
        console.log(`Data de início: ${dataInicio} - Data de fim: ${dataFim}`);
        const codigoEstacao = '87444000';

        const dados = await coletarDados(codigoEstacao, dataInicio, dataFim);

        if (!Array.isArray(dados) || dados.length === 0) {
            console.log("No data available or unexpected data structure.");
            return;
        }

        dados.sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora));

        // Get the levels
        const levels = dados.map(d => parseFloat(d.nivel)).filter(level => !isNaN(level));

        if (levels.length < 4) {
            console.log("Not enough data to determine alerts.");
            return;
        }

        const currentLevel = levels[0];
        const lastThreeLevels = levels.slice(1, 4);
        const increaseLastHour = currentLevel - levels[1];

        let alertType = null;

        if (currentLevel > 350) {
            alertType = 'risco de enchente';
        } else if (currentLevel > 250) {
            alertType = 'nível do rio alto';
        }

        if (increaseLastHour > 0) {
            alertType = alertType ? `${alertType} e nível subindo rápido` : 'nível subindo rápido';
        }

        if (alertType) {
            const cidade = 'Porto Alegre';
            const today = getFormattedDate(now);

            const alertExists = await pool.query(`
                SELECT 1 
                FROM alerts 
                WHERE cidade = $1 AND DATE(data_envio) = $2 AND tipo_alerta = $3 AND enviado_por = 'bot'
            `, [cidade, today, alertType]);

            if (alertExists.rows.length === 0) {
                const result = await axios.post('http://localhost:3000/alerts', {
                    cidade: cidade,
                    tipo_alerta: alertType,
                    enviado_por: 'bot',
                    data_envio: today,
                    mensagem: `Alerta: ${alertType} - Nível atual: ${currentLevel}m`
                });
                console.log(`Alerta de ${alertType} enviado para ${cidade}`);
            }
        }
    } catch (error) {
        console.error("Error fetching river level data:", error);
        console.error(error.stack);
    }
};
