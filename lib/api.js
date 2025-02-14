const { decryptMedia } = require('@open-wa/wa-automate')
const fs = require('fs').promises
const gTTS = require('gtts');
const os = require('os')
const path = require('path')

// paths
const pathOwner = path.resolve(__dirname, '../data/owner/owner.json')
const pathBlockDm = path.resolve(__dirname, '../data/users/dm_block.json')
const pathRegister = path.resolve(__dirname, '../data/users/register.json')
const pathVoice = path.resolve(__dirname, '../src/voice')
const pathLog = path.resolve(__dirname, '../logs/logfile.log')
const pathCmd = path.resolve(__dirname, '../data/cmd_block/command_block.json')
const pathReact = path.resolve(__dirname, '../flags/on_react.json')

class BotApiUtils {
    constructor() {
        this.timeLog = this.hourLog()
    }

    async isBlock(contact) {
        let readfile = await fs.readFile(pathCmd)
        const isBlock = JSON.parse(readfile)
        for (let conct of isBlock) {
            if (contact === conct.contact) return true
        }
        return false
    }

    async sendVoice(text, lang, message, bot) {
        if (os.platform() !== 'linux') return;
        if (lang.length === 0 && (text.length < 4 || text.length > 60)) return;
        try {
            let gtts = new gTTS(text, lang)
            gtts.save(`${pathVoice}/voice.mp3`, async function (isError, _) {
                if (isError) {
                    return '❌ Erro ao converter áudio, tente novamente ❌'
                }
                await bot.sendPtt(message.from, `${pathVoice}/voice.mp3`, message.id)
                return;
            });
        } catch (err) {
            await this.saveLogError(this.timeLog, err, message.chat.name, 'sendVoice()')
            return `❌ Lingua não reconhecida, tente: \n›• !audio --pt frase ou \`\`\`!lang \`\`\``
        }
    }

    async sendResolveSticker(mimetype, quotedMsg, type, timer, message, bot) {
        try {
            await bot.sendReplyWithMentions(message.from, this.sendRequestSticker(timer, message.notifyName), message.id)
            let decryp = quotedMsg === undefined ? message : quotedMsg
            const decrypt = await decryptMedia(decryp)
            return `data:${mimetype};base64,${decrypt.toString('base64')}`
        } catch (err) {
            await this.saveLogError(this.timeLog, err, message.chat.name, 'sendResolveSticker()')
            throw `Erro ao converter ${type} em sticker, tente novamente.`
        }
    }

    async saveLogInfo(timerlog, doing) {
        let infoLog = `${timerlog}: INFO - [log] ➜ ${doing}`
        await fs.writeFile(pathLog, infoLog + '\n', { flag: 'a' })
        return;
    }

    async saveLogError(timerlog, erroLog, group, method) {
        let args = `${timerlog}: ERROR - [> ${erroLog} <] "${group}" ➜ ${method}`
        await fs.writeFile(pathLog, args + '\n', { flag: 'a' })
    }

    async mentionsAll(nameGroup, countGroup, timer, message, bot) {
        let users = []
        const participants = message.chat.groupMetadata.participants
        for (let i = 0; i < participants.length; i++) {
            const admin = participants[i]['isAdmin']
            if (message.author === participants[i]['id']) {
                if (admin) {
                    for (let j = 0; j < participants.length; j++) {
                        let members = participants[j]['id']
                        let newMembers = members.replace('@c.us', '')
                        users.push(`› *@${newMembers}*\n`)
                    }
                    users = users.toString()
                    await bot.sendReplyWithMentions(message.from, this.sendMetionAll(timer, nameGroup, countGroup, users))
                    return;

                }
                return '❗ Apenas administradores são autorizados a usar este comando. ❗';
            }
        }
    }

    async deteleInappropriate(inappropriate, message, bot) {
        let isDeleted;
        for (let impr of inappropriate) {
            const isImpropes = message.body.includes(impr)
            if (isImpropes) {
                const participant = message.chat.groupMetadata.participants
                for (let i = 0; i < participant.length; i++) {
                    const isAdmin = participant[i]['isAdmin']
                    if (message.to === participant[i]['id']) {
                        if (isAdmin) {
                            await bot.deleteMessage(message.from, message.id)
                                .then(isDelet => {
                                    if (isDelet) {
                                        isDeleted = '✅ - Mensagem deletada'
                                    }
                                })
                            return isDeleted
                        }
                    }
                }
            }
        }
    }


    async getOwner() {
        let readfile = await fs.readFile(pathOwner)
        const owner = JSON.parse(readfile)
        return owner[0];
    }

    async isOwner(author) {
        let readfile = await fs.readFile(pathOwner)
        const isOwner = JSON.parse(readfile)
        for (let owner of isOwner) {
            if (owner === author) return true
            return false
        }
    }

    async isReact() {
        let readfile = await fs.readFile(pathReact)
        let outlet = JSON.parse(readfile)
        return outlet.includes(true)
    }

    async reactOnOf(outlet) {
        let _flag = outlet === 'disabled' ? false : true
        let _msgReact;
        try {
            let readfile = await fs.readFile(pathReact)
            let onReact = JSON.parse(readfile)
            onReact.filter(async (value, index, array) => {
                if (_flag === value) {
                    _msgReact = `* ➜ As Reações já estão ${value ? 'Ativadas' : 'Desativadas'}❗`
                    return;
                }
                array.splice(index, 1)
                array.push(_flag)
                await fs.writeFile(pathReact, JSON.stringify(array))
                return;
            });
            return _msgReact !== undefined ? _msgReact : _flag ? '* Reações ativadas! ✅' : '* Reações desativadas! ❌'
        } catch (err) {
            throw err
        }
    }

    async registerUsers(name, number, photo) {
        let readfile = await fs.readFile(pathRegister)
        const register = JSON.parse(readfile)
        for (let conct of register) {
            if (conct.contact === number) {
                return 'Você ja está cadastrado!'
            }
        }
        register.push(
            {
                name: name,
                contact: number,
                photo: photo,
            }
        )
        await fs.writeFile(pathRegister, JSON.stringify(register))
        return `• ${name} Registrado com sucesso ✅`
    }

    async isRegister(contact) {
        let readfile = await fs.readFile(pathRegister)
        const isRegister = JSON.parse(readfile)
        for (let user of isRegister) {
            if (contact === user.contact) return false;
        }
        return true;
    }

    async blockDm(author) {
        let readFile = await fs.readFile(pathBlockDm)
        const dm = JSON.parse(readFile)
        if (dm.includes(author)) return true
        dm.push(author)
        await fs.writeFile(pathBlockDm, JSON.stringify(dm))
        return;
    }

    async getHour() {
        const getDate = new Date()
        return `${String(getDate.getHours()).padStart(2, '0')}:${String(getDate.getMinutes()).padStart(2, '0')}`;
    }
    sendAdminsMentions(timers, nameGroup, getAdmins, getListAdmins) {
        return `------〘 _ADMINS MENCIONADOS_ 〙 ------\n\n \`\`\`[${timers}]\`\`\` ➣ *${nameGroup}*\n ➣ *${getAdmins.length} Admins*\n\n${getListAdmins.replace(/,/g, '')}`
    }
    sendRequestSticker(timers, notifyName) {
        return `\`\`\`[${timers}] - Solicitado por ${notifyName}\`\`\` \n\nAguarde...⌛`;
    }
    sendMetionAll(timers, grupo, total, listString) {
        return `------〘 _TODOS MENCIONADOS_ 〙 ------\n\n \`\`\`[${timers}]\`\`\` ➣ *${grupo}*\n ➣ *${total} Membros*\n\n${listString.replace(/,/g, '')}`
    }
    async hourLog() {
        const getDate = new Date()
        return `${getDate.getFullYear()}.${getDate.getMonth() >= 10 ? getDate.getMonth() + 1 : `0${getDate.getMonth() + 1}`}.${getDate.getDate() >= 10 ? getDate.getDate() : `0${getDate.getDate()}`} ${getDate.getHours() >= 10 ? getDate.getHours() : `0${getDate.getHours()}`}.${getDate.getMinutes() >= 10 ? getDate.getMinutes() : `0${getDate.getMinutes()}`}.${getDate.getSeconds() >= 10 ? getDate.getSeconds() : `0${getDate.getSeconds()}`}`
    }
}

exports.BotApiUtils = BotApiUtils