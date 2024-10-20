const { Pool } = require('pg');
const fetch = require('node-fetch');
const pool = new Pool({ connectionString: "postgresql://hackaton_owner:jlcp2VWgmy4O@ep-divine-bread-a5g0rfdz.us-east-2.aws.neon.tech/hackaton?sslmode=require" });

exports.interpretMessage = async (message) => {
    const text = message.caption || message.text;

    const lines = text.split('\n');
    let local, dataHora, nivelRio, ultimas5;

    lines.forEach(line => {
        if (line.startsWith('📍 Local:')) {
            local = line.replace('📍 Local: ', '').trim();
        } else if (line.startsWith('📆 Data/Hora:')) {
            dataHora = line.replace('📆 Data/Hora: ', '').trim();
        } else if (line.startsWith('- Nível do Rio:')) {
            nivelRio = parseFloat(line.replace('- Nível do Rio: ', '').replace('m.', '').trim());
        } else if (line.startsWith('- Últimas 5:')) {
            ultimas5 = line.replace('- Últimas 5: [\'', '').replace('\']', '').split('\', \'').map(parseFloat);
        }
    });
    
    console.log(local, dataHora, nivelRio, ultimas5);
    if (local && dataHora && nivelRio && ultimas5) {
        const nivelAtual = nivelRio;
        const aumentoUltimas5 = nivelAtual - Math.min(...ultimas5);
        const cidades = ['Parobé', 'Taquara', 'Igrejinha', 'Três Coroas'];
        const today = new Date().toISOString().split('T')[0];

        for (const cidade of cidades) {
            const alertExists = await pool.query(`
                SELECT 1 
                FROM alerts 
                WHERE cidade = $1 AND DATE(data_envio) = $2 AND tipo_alerta IN ('nível do rio alto', 'risco de enchente', 'nível do rio subindo rápido', 'nível do rio subindo muito rápido') AND enviado_por = 'bot'
            `, [cidade, today]);

            if (alertExists.rowCount === 0) {
                let tipoAlerta = null;

                // Separate conditions for flood risk and river level rise
                if (nivelAtual > 3) {
                    tipoAlerta = 'risco de enchente';
                } else if (nivelAtual > 1.5) {
                    tipoAlerta = 'nível do rio alto';
                }

                // Conditions for river level rise
                if (aumentoUltimas5 > 1) {
                    tipoAlerta = 'nível do rio subindo muito rápido';
                } else if (aumentoUltimas5 > 0.5) {
                    tipoAlerta = 'nível do rio subindo rápido';
                }

                if (tipoAlerta) {
                    const result = await fetch('http://localhost:3000/alerts', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            cidade: cidade,
                            tipo_alerta: tipoAlerta,
                            enviado_por: 'bot',
                            data_envio: today,
                            mensagem: text // Add the message text here
                        })
                    });
                    console.log(`Alerta de ${tipoAlerta} enviado para ${cidade}`);
                }
            }
        
        }
    } else {
        console.log("Mensagem no formato inesperado.");
        return null;
    }
}
