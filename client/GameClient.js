import nengi from 'nengi'
import nengiConfig from '../common/nengiConfig'
import MoveCommand from '../common/command/MoveCommand'

import { gridSheet } from 'pxcan';

const charaSrc = 'https://opengameart.org/sites/default/files/rpg_16x16_0.png';
const playerSheet = gridSheet(charaSrc, 16, 16);

export default function makeClient() {
    const client = new nengi.Client(nengiConfig)
    const stuff = {};
    let myId = null;

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
        // const input = this.input.frameState

        let rotation = 0
        // const worldCoord = this.renderer.toWorldCoordinates(, (touches[0] || {x:0}).y)

        if (myId) {
            // calculate the direction our character is facing
            const dx = (touches[0] || {x:0}).x - 72;
            const dy = (touches[0] || {y:0}).y - 72;
            rotation = Math.atan2(dy, dx)
        }

        client.addCommand(new MoveCommand(
            buttons.up.pressed, buttons.left.pressed,
            buttons.down.pressed, buttons.right.pressed,
            rotation, delta
        ))

        // this.input.releaseKeys()
        client.update()
        /* * */

        return Object.values(stuff)
            .map(g => playerSheet.sprite(0).at(g.x, g.y));
    }
}
