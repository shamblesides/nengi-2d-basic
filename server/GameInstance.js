import nengi from 'nengi'
import nengiConfig from '../common/nengiConfig.js'
import PlayerCharacter from '../common/entity/PlayerCharacter.js'
import Identity from '../common/message/Identity.js'

export default function createInstance() {
    const entities = new Map()
    const instance = new nengi.Instance(nengiConfig, { port: 8079 })

    instance.onConnect((client, clientData, callback) => {
        //callback({ accepted: false, text: 'Connection denied.'})

        // create a entity for this client
        const entity = new PlayerCharacter()
        instance.addEntity(entity) // adding an entity to a nengi instance assigns it an id
        entities.set(entity.nid, entity)

        // tell the client which entity it controls (the client will use this to follow it with the camera)
        instance.message(new Identity(entity.nid), client)

        entity.x = Math.random() * 9 | 0,
        entity.y = Math.random() * 9 | 0,

        // establish a relation between this entity and the client
        client.entity = entity

        // define the view (the area of the game visible to this client, all else is culled)
        client.view = {
            x: entity.x,
            y: entity.y,
            halfWidth: 4,
            halfHeight: 4,
        }

        callback({ accepted: true, text: 'Welcome!' })
    })

    instance.onDisconnect(client => {
        entities.delete(client.entity.nid)
        instance.removeEntity(client.entity)
    })

    return function update(delta) {
        //console.log('stats', this.entities.size, this.instance.clients.toArray().length, this.instance.entities.toArray().length)

        let cmd = null
        while (cmd = instance.getNextCommand()) {
            const tick = cmd.tick
            const client = cmd.client

            for (let i = 0; i < cmd.commands.length; i++) {
                const command = cmd.commands[i]
                const entity = client.entity
                //console.log('command', command)
                if (command.protocol.name === 'MoveCommand') {
                    entity.processMove(command)                    
                }
            }
        }

        instance.clients.forEach(client => {
            client.entity.tick(delta)
            client.view.x = client.entity.x
            client.view.y = client.entity.y
        })

        // when instance.updates, nengi sends out snapshots to every client
        instance.update()
    }
}
