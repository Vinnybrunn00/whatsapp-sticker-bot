const gnoseWebp = require('../constants/gnose_constants').gnoseWebpObj
const gnoseReact = require('../constants/gnose_constants').objReact
const msgMentGnose = require('../constants/gnose_constants').msgMentionsGnose
const msgPolice = require('../constants/gnose_constants').msgPolice
const interrog = require('../constants/gnose_constants').interrog

class GnoseGroup {
    constructor(groupId) {
        this.groupId = groupId;
    }

    async reactGnose(contact, message) {
        if (message.from !== this.groupId) return;
        let _react;
        gnoseReact.forEach(async element => {
            for (let i = 0; i < element.user.length; i++) {
                let user = element.user[i]
                if (contact === user[0]) {
                    _react = user[1]
                }
            }
        });
        return _react
    }

    async policeSendMsg(body, groupId) {
        if (groupId === this.groupId) {
            if (body.includes('estupro')) {
                return msgPolice
            }
        }
    }

    async sendWebp(prompt, message) {
        if (message.from === this.groupId) {
            try {
                let _gnoseWebp;
                const keys = Object.keys(gnoseWebp)
                keys.forEach(element => {
                    if (prompt.includes(element)) {
                        _gnoseWebp = gnoseWebp[element];
                    }
                })
                return _gnoseWebp
            } catch (err) {
                throw err
            }
        }
    }

    async interrogation(body, from) {
        if (from != this.groupId) return;
        if (body.slice(0, 2).includes('?')) {
            let _gen = Math.floor((Math.random() * interrog.length))
            return interrog[_gen]
        }
    }

    async sendMentionGnose(body, from) {
        if (from !== this.groupId) return;
        let _mentionGonose;
        if (body.includes('@55')) {
            let _gen = Math.floor((Math.random() * msgMentGnose.length))
            _mentionGonose = msgMentGnose[_gen]
        }
        return _mentionGonose
    }
}

exports.GnoseGroup = GnoseGroup;