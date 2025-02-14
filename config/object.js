const create = {
    sessionId: "BOT",
    multiDevice: true, //required to enable multiDevice support
    authTimeout: 60, //wait only 60 seconds to get a connection with the host account device
    blockCrashLogs: true,
    disableSpins: true,
    headless: true,
    hostNotificationLang: 'PT_BR',
    logConsole: false,
    popup: true,
    useChrome: true,
    qrTimeout: 0,
    messagePreprocessor: "AUTO_DECRYPT_SAVE",
    preprocFilter: "m => m.caption === `!scan` && m.type===`image`",
}
exports.create = create;