
class Utils {
    // headers
    headerInfoRaid(timers, states, startTime, endTime, capitalTotal, totalAttacks, attackLog, players) {
        return `--------- 〘 _MENOS DE 5 ATAQUES_ 〙 ---------\n\n \`\`\`[${timers}]\`\`\` - *Raids ${states !== 'ongoing' ? 'fechada' : 'em andamento'}*\n ⏳ *Início: ${this.resolveDate(startTime)}*\n 🕗 *Fim: ${this.resolveDate(endTime)}* \n ➜ *${capitalTotal} Capital Total*\n ➜ *${totalAttacks} Ataques totais*\n\n${players.length === 0 ? '> ❗ Nenhum ataque para informar no momento, tente depois ❗' : attackLog}`
    }
    headerRanking(timers, clanName, names) {
        return `--------- 〘 _Ranking - 10 melhores_ 〙 ---------\n\n \`\`\`[${timers}]\`\`\`➣ *${clanName}* \n\n${names}`
    }

    // body
    sendInfoAttacks(name, attacks, attackLimit, bonusAttackLimit) {
        return `*${name}*\n     _Ataques:_ ${attacks}\n     _Ataques Limites_: ${attackLimit}\n     _Bônus ataque_: ${bonusAttackLimit}\n-----------------------------\n\n`
    }
    sendRanking(i, names) {
        return `${i}º ${names}\n`
    }
    resolveDate(date) {
        if (date.length !== 20) return;
        let ano = date.slice(0, 4)
        let mes = date.slice(4, 6)
        let dia = date.slice(6, 8)
        let hour = date.slice(9, 11)
        let min = date.slice(11, 13)
        let time = new Date(ano + '-' + mes + '-' + dia + ':' + hour + ':' + min)
        return time.toLocaleString('pt-br').slice(0, -3).replace(',', ' -') + 'h'
    }
}

exports.Utils = Utils;