import nengi from 'nengi'
import nengiConfig from '../common/nengiConfig'
import { default as MoveCommand, UP, DOWN, LEFT, RIGHT, STOP } from '../common/command/MoveCommand'

import { gridSheet } from 'pxcan';

const charaSrc = 'https://opengameart.org/sites/default/files/rpg_16x16_0.png';
const playerSheet = gridSheet(charaSrc, 16, 16);

export default function makeClient() {
    const client = new nengi.Client(nengiConfig)
    const stuff = {};
    let myId = null;
    let lastMove = null;

    client.onConnect(res => {
        console.log('onConnect response:', res)
    })

    client.onClose(() => {
        console.log('connection closed')
    })

    client.connect('ws://localhost:8079')  

    return function update(delta, { touches, buttons }) {
        /* receiving */
        const network = client.readNetwork()

        network.entities.forEach(snapshot => {
            snapshot.createEntities.forEach(entity => {
                stuff[entity.nid] = entity;
            })

            snapshot.updateEntities.forEach(update => {
                stuff[update.nid][update.prop] = update.value;
            })

            snapshot.deleteEntities.forEach(nid => {
                delete stuff[nid];
            })
        })

        network.messages.forEach(message => {
            if (message.protocol.name === 'Identity') {
                myId = message.entityId
                console.log('identified as', myId)
            }
        })

        network.localMessages.forEach(localMessage => {
            // if (localMessage.protocol.name === 'WeaponFired') {
                // console.log('bang');
                // this.drawHitscan(message.x, message.y, message.tx, message.ty, 0xff0000)
            // }
        })
        /* * */

        /* sending */
        const me = stuff[myId];
        
        if (me) {
            const dir =
                buttons.up.pressed ? UP :
                buttons.down.pressed ? DOWN :
                buttons.left.pressed ? LEFT :
                buttons.right.pressed ? RIGHT :
                STOP;

            const args = [me.x, me.y, dir];
            if (JSON.stringify(args) !== lastMove) {
                lastMove = JSON.stringify(args);
                client.addCommand(new MoveCommand(me.x, me.y, dir));
            }
        }

        client.update()
        /* * */

        return Object.values(stuff)
            .map(g => playerSheet.sprite(0).at(g.x*16, g.y*16));
    }
}
