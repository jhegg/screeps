/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('notes.creeps');
 * mod.thing == 'a thing'; // true
 */

module.exports = {
    // manual spawn
    // Game.spawns['Spawn1'].createCreep( [WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE], 'HarvesterBig', { role: 'harvester' } );
    

    // safe mode
    // Game.spawns['Spawn1'].room.controller.activateSafeMode();
    
    
    
    // towers and repair
    // Game.spawns['Spawn1'].room.createConstructionSite( 23, 22, STRUCTURE_TOWER );
    // var tower = Game.getObjectById('2bc5295601ff82adb5498446');
    // if(tower) {
    //     var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
    //         filter: (structure) => structure.hits < structure.hitsMax
    //     });
    //     if(closestDamagedStructure) {
    //         tower.repair(closestDamagedStructure);
    //     }
    //     var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    //     if(closestHostile) {
    //         tower.attack(closestHostile);
    //     }
    // }
};