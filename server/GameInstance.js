import nengi from 'nengi'
import nengiConfig from '../common/nengiConfig'
import PlayerCharacter from '../common/entity/PlayerCharacter'
import Identity from '../common/message/Identity'

export default function createInstance() {
    const entities = new Map()
    // this.collisionSystem = new CollisionSystem()
    const instance = new nengi.Instance(nengiConfig, { port: 8079 })
    instance.onConnect((client, clientData, callback) => {
        //callback({ accepted: false, text: 'Connection denied.'})

        // create a entity for this client
        const entity = new PlayerCharacter()
        instance.addEntity(entity) // adding an entity to a nengi instance assigns it an id

        // tell the client which entity it controls (the client will use this to follow it with the camera)
        instance.message(new Identity(entity.nid), client)

        entity.x = Math.random() * 100 | 0,
        entity.y = Math.random() * 100 | 0,
        // establish a relation between this entity and the client
        entity.client = client
        client.entity = entity

        // define the view (the area of the game visible to this client, all else is culled)
        client.view = {
            x: entity.x,
            y: entity.y,
            halfWidth: 1000,
            halfHeight: 1000
        }

        entities.set(entity.nid, entity)

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

        // this.entities.forEach(entity => {
        //     if (entity instanceof GreenCircle) {
        //         if (!entity.isAlive) {
        //             // Order matters for the next 2 lines
        //             this.entities.delete(entity.nid)
        //             this.instance.removeEntity(entity)
        //             // respawn after one second
        //             setTimeout(() => { this.spawnGreenCircle() }, 1000)
        //         }
        //     }
        // })

        // TODO: the rest of the game logic
        instance.clients.forEach(client => {
            client.view.x = client.entity.x
            client.view.y = client.entity.y

            client.entity.move(delta)
            // client.entity.weaponSystem.update(delta)
        })

        // when instance.updates, nengi sends out snapshots to every client
        instance.update()
    }
}
