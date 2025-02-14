const wa = require('@open-wa/wa-automate');
const msg = require('./constants/constants').msg
const lib = require('./lib/api');

const lib2 = require('./lib/gnose_group');
const lang = require('./menus/langs').langs
const config = require('./config/object').create;
const hashSapo = require('./constants/gnose_constants').hashWebpSapo
const sendXing = require('./constants/gnose_constants').xing

const { decryptMedia } = require('@open-wa/wa-automate')

let api = new lib.BotApiUtils();
let gnose = new lib2.GnoseGroup('557488059907-1620062542@g.us')

wa.create(config).then(bot => start(bot));

async function start(bot) {
    bot.onMessage(async message => {
        //console.log(message);
        if (await api.isBlock(message.author)) return;

        let timer, timeLog;

        await api.getHour().then(T => timer = T);
        await api.hourLog().then(T => timeLog = T);

        if (message.body === '$debug') {
            try {
                await api.isOwner(message.author)
                    .then(async event => {
                        if (event) {
                            await bot.reply(message.from, msg.sendOk, message.id)
                            await api.saveLogInfo(timeLog, `Debuging Solicitado...`)
                            return;
                        }
                    });
            } catch (err) {
                await api.saveLogError(timeLog, err, message.chat.name, '$debug')
                return;
            }
        }

        if (message.mediaData.type === 'sticker') {
            if (message.mediaData.filehash === hashSapo) {
                try {
                    await bot.deleteMessage(message.from, message.id)
                        .then(async sapo => {
                            if (sapo) {
                                await bot.sendText(message.from, 'Sapo sendo estuprado deletado 👍')
                                await api.saveLogInfo(timeLog, `Deletando sapo...`)
                                return;
                            }
                        }).catch(async err => {
                            await api.saveLogError(timeLog, err, message.chat.name, 'Delete Sticker')
                            return;
                        });
                    return;
                } catch (err) {
                    await api.saveLogError(timeLog, err, message.chat.name, 'Delete Sticker')
                    return;
                }
            }
        }

        await gnose.interrogation(message.body, message.from)
            .then(async interr => {
                if (interr !== undefined) {
                    await bot.reply(message.from, interr, message.id)
                    await api.saveLogInfo(timeLog, `O bot enviou uma resposta a => (?)...`)
                    return;
                }
            });

        await gnose.policeSendMsg(message.body.toLowerCase(), message.from)
            .then(async plcmsg => {
                if (plcmsg != undefined) {
                    await bot.reply(message.from, plcmsg, message.id)
                    await api.saveLogInfo(timeLog, `policeSendMsg...`)
                    return;
                }
            });

        await gnose.sendMentionGnose(message.body, message.from)
            .then(async mention => {
                if (mention !== undefined) {
                    await bot.reply(message.from, mention, message.id)
                    await api.saveLogInfo(timeLog, `O bot chamou alguém de corno...`)
                    return;
                }
            })

        await gnose.sendWebp(message.body.toLowerCase(), message)
            .then(async webp => {
                if (webp !== undefined) {
                    if (typeof webp !== 'object') {
                        await bot.sendImageAsSticker(message.from, webp)
                        return;
                    }
                    let getMsg = webp[Math.floor((Math.random() * webp.length))];
                    await bot.reply(message.from, getMsg, message.id)
                    return;
                }
            }).catch(async err => {
                await api.saveLogError(timeLog, err, message.chat.name, 'sendWebp - gnose')
                return;
            });

        if (message.type === 'image' || message.type === 'video') {
            if (message.chat.groupMetadata === null) return;
            let typeFile = message.type
            if (message.caption === '!sticker') {
                await api.sendResolveSticker(message.mimetype, undefined, typeFile, timer, message, bot)
                    .then(async sticker => {
                        if (sticker !== null) {
                            if (typeFile === 'image') {
                                await bot.sendImageAsSticker(message.from, sticker, {
                                    author: `${message.notifyName}`,
                                    keepScale: true,
                                    pack: 'hubberBot',
                                })
                                await api.saveLogInfo(timeLog, `${message.notifyName} gerou uma figurinha com imagem...`)
                                return;
                            }
                            await bot.sendMp4AsSticker(message.from, sticker, { endTime: '00:00:07.0' }, {
                                author: `${message.notifyName}`,
                                pack: 'hubberBot',
                            });
                            await api.saveLogInfo(timeLog, `${message.notifyName} gerou uma figurinha com vídeo...`)
                            return;
                        }
                    }).catch(async err => {
                        await bot.reply(message.from, err, message.id)
                        await api.saveLogError(timeLog, err, message.chat.name, '!sticker: video/image')
                        return;
                    });
            }
        }

        // message.quotedMsg.mimetype
        if (message.body === '!sticker') {
            if (message.chat.groupMetadata === null) return;
            try {
                let typeFile = message.quotedMsg.type
                if (message.quotedMsg.type === 'image' || message.quotedMsg.type === 'video') {
                    await api.sendResolveSticker(message.quotedMsg.mimetype, message.quotedMsg, typeFile, timer, message, bot)
                        .then(async sticker => {
                            if (sticker !== null) {
                                if (typeFile !== 'video') {
                                    await bot.sendImageAsSticker(message.chat.id, sticker, {
                                        author: `${message.notifyName}`,
                                        keepScale: true,
                                        pack: 'hubberBot',
                                    });
                                    await api.saveLogInfo(timeLog, `${message.notifyName} gerou uma figurinha com imagem...`)
                                    return;
                                }
                                await bot.sendMp4AsSticker(message.chat.id, sticker, { endTime: '00:00:07.0', }, {
                                    author: `${message.notifyName}`,
                                    pack: 'hubberBot'
                                });
                                await api.saveLogInfo(timeLog, `${message.notifyName} gerou uma figurinha com video...`)
                                return;
                            }
                        }).catch(async err => {
                            await bot.reply(message.from, err, message.id)
                            await api.saveLogError(timeLog, err, message.chat.name, '!sticker: quotedMsg')
                            return;
                        });
                }
            } catch (err) {
                await api.saveLogError(timeLog, err, message.chat.name, '!sticker: quotedMsg 2')
                await bot.reply(message.from, ' > Este comando precisa de uma imagem ou vídeo!', message.id)
                return;
            }
        }

        if (msg.inappropriate.length !== 0) {
            if (!message.chat.isGroup) return;
            await api.deteleInappropriate(msg.inappropriate, message, bot)
                .then(async msg => {
                    if (msg !== undefined) {
                        await bot.sendText(message.from, msg)
                        return;
                    }
                })
        }

        if (message.body.startsWith('!lang')) {
            if (message.chat.isGroup) {
                await bot.reply(message.from, lang, message.id)
                    .then(async _ => {
                        await api.saveLogInfo(timeLog, `${message.notifyName} Solicitou as linguagens...`)
                        return;
                    })
                return;
            };
        }

        if (message.body.startsWith('!all')) {
            if (message.chat.groupMetadata === null) return;
            await api.mentionsAll(message.chat.name, message.chat.participantsCount, timer, message, bot)
                .then(async msg => {
                    if (msg !== undefined) {
                        await bot.reply(message.from, msg, message.id)
                            .then(async _ => {
                                await api.saveLogInfo(timeLog, `${message.notifyName} Marcou todos do grupo...`)
                                return;
                            })
                        return;
                    }
                });
        }

        if (message.body.startsWith('!getlog')) {
            await api.isOwner(message.author).then(async isOwner => {
                if (isOwner) {
                    await bot.sendFile(message.from, 'logs/logfile.log', 'logfile.log', '• Arquivo de logs de eventos do bot!')
                        .then(async _ => {
                            await api.saveLogInfo(timeLog, `${message.notifyName} Solicitou o arquivo de log...`)
                            return;
                        })
                    return;
                }
            });
        }

        if (message.body.startsWith('!register')) {
            if (!message.chat.isGroup) return;
            try {
                await api.registerUsers(message.notifyName,
                    message.author, message.sender.profilePicThumbObj.eurl)
                    .then(async msg => {
                        await bot.reply(message.from, msg, message.id)
                            .then(async _ => {
                                await api.saveLogInfo(timeLog, `${message.notifyName} Registrado...`)
                                return;
                            })
                        return;
                    })
            } catch (err) {
                await api.saveLogError(timeLog, err, message.chat.name, '!register')
                return;
            }
        }

        if (message.body.startsWith('!voice')) {
            if (!message.chat.isGroup) return;
            await api.sendVoice(message.body.slice(10), message.body.slice(7, 9), message, bot)
                .then(async msg => {
                    if (msg !== undefined) {
                        await bot.reply(message.from, msg, message.id);
                        await api.saveLogInfo(timeLog, `${message.notifyName} tentou gerar um audio-voice...`)
                        return;
                    }
                    await api.saveLogInfo(timeLog, `${message.notifyName} tentou gerar um audio-voice...`)
                    return;
                });
        }

        if (message.body.startsWith('!react')) {
            if (message.chat.groupMetadata === null) return
            if (await api.isRegister(message.author)) return;
            let flag = message.body.slice(7)
            await api.reactOnOf(flag)
                .then(async msgReact => {
                    await bot.reply(message.from, msgReact, message.id)
                        .then(async _ => {
                            await api.saveLogInfo(timeLog, `${message.notifyName} Mudou a flag para ${flag}...`)
                            return;
                        });
                }).catch(async err => {
                    await api.saveLogError(timeLog, err, message.chat.name, '!react')
                    return;
                });
        }

        if (message.chat.groupMetadata == null) {
            try {
                await api.isOwner(message.author).then(async isAuthor => {
                    if (!isAuthor) {
                        await api.blockDm(message.author)
                            .then(async isBlock => {
                                if (!isBlock) {
                                    await bot.sendText(message.chat.id, msg.programmer_msg)
                                    await api.saveLogInfo(timeLog, `${message.notifyName} bloqueado da DM...`)
                                    return;
                                }
                            });
                    }
                })
            } catch (err) {
                await api.saveLogError(timeLog, err, message.chat.name, 'DM-block')
                return;
            }
        }

        await gnose.reactGnose(message.author, message).then(async emoji => {
            await api.isReact()
                .then(async isOnOf => {
                    if (!isOnOf) return;
                    if (emoji !== undefined) {
                        await bot.react(message.id, emoji)
                        return;
                    }
                });
        });
    });

    // welcome
    const grouID = '120363040678895413@g.us'
    await bot.onParticipantsChanged(grouID, async changeEvent => {
        if (changeEvent.action === 'add') {
            await bot.sendTextWithMentions(grouID, `Bem vindo, *@${changeEvent.who.replace('@c.us', '')}*`)
                .then(async _ => {
                    await bot.getGroupInfo(grouID)
                        .then(async desc => {
                            if (desc !== undefined) {
                                await bot.sendText('120363040678895413@g.us', desc['description']);
                                return;
                            }
                        }).catch(async err => {
                            await api.saveLogError(timeLog, err, message.chat.name, 'getGroupInfo() - welcome')
                            return;
                        });
                }).catch(async err => {
                    await api.saveLogError(timeLog, err, message.chat.name, 'sendTextWithMentions() - welcome')
                    return;
                });
            return;
        }
        await bot.sendText(grouID, '👋 Menos um')
        return;
    });
}