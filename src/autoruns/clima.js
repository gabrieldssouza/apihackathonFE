const { Pool } = require('pg');
const fetch = require('node-fetch');
const pool = new Pool({ connectionString: "postgresql://hackaton_owner:jlcp2VWgmy4O@ep-divine-bread-a5g0rfdz.us-east-2.aws.neon.tech/hackaton?sslmode=require" });

exports.verificarClima = async function() {
    const result = await pool.query(`
        SELECT DISTINCT cidade 
        FROM users
    `);
    const cidades = result.rows;

    cidades.push({ cidade: 'Melchor de Mencos' });

    for (const cidade of cidades) {
        const cidadeNome = cidade.cidade;
        console.log(`Verificando clima de ${cidadeNome}`);
        const response = await fetch(`http://api.weatherapi.com/v1/forecast.json?key=d826eda9e2bd4079874221833241910&q=${cidadeNome}&lang=pt&days=3`);
        const data = await response.json();

        let totalPrecipitation = 0;
        let strongWinds = false;
        let strongWindsDays = [];

        data.forecast.forecastday.forEach(day => {
            console.log(`Total de precipitação: ${day.day.totalprecip_mm}mm`);
            totalPrecipitation += day.day.totalprecip_mm;
            if (day.day.maxwind_kph > 50) { // Consider wind stronger than 50 kph as strong wind
                strongWinds = true;
                strongWindsDays.push(day.date);
            }
        });

        const today = new Date().toISOString().split('T')[0];

        if (totalPrecipitation > 60) {
            const chuvaAlertExists = await pool.query(`
                SELECT 1 
                FROM alerts 
                WHERE cidade = $1 AND tipo_alerta = 'chuva' AND enviado_por = 'previsao' AND DATE(data_envio) = $2
            `, [cidadeNome, today]);
            console.log(chuvaAlertExists.rowCount);
            if (chuvaAlertExists.rowCount === 0) {
                const res = await fetch('http://localhost:3000/alerts', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        cidade: cidadeNome,
                        tipo_alerta: 'chuva',
                        mensagem: `Previsão de chuva forte para os próximos dias`,
                        enviado_por: 'previsao'
                    })
                });
                console.log(`Alerta de chuva forte enviado para ${cidadeNome}`);
                console.log(await res.json());
            } else {
                console.log(`Alerta de chuva forte já enviado para ${cidadeNome} hoje`);
            }
        }

        if (strongWinds) {
            const ventosAlertExists = await pool.query(`
                SELECT 1 
                FROM alerts 
                WHERE cidade = $1 AND tipo_alerta = 'ventos fortes' AND enviado_por = 'previsao' AND DATE(data_envio) = $2
            `, [cidadeNome, today]);

            if (ventosAlertExists.rowCount === 0) {
                const res = await fetch('http://localhost:3000/alerts', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        cidade: cidadeNome,
                        tipo_alerta: 'ventos fortes',
                        mensagem: `Previsão de ventos fortes para os dias ${strongWindsDays.join(', ')}`,
                        enviado_por: 'previsao'
                    })
                });
                console.log(`Alerta de ventos fortes enviado para ${cidadeNome}`);
            } else {
                console.log(`Alerta de ventos fortes já enviado para ${cidadeNome} hoje`);
            }
        }
    }
}

