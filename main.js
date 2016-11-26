var creepsMaintainer = require('creeps.maintainer');
var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');

module.exports.loop = function () {
    creepsMaintainer.run();

    const constructionSites = Game.spawns.Spawn1.room.find(FIND_CONSTRUCTION_SITES);

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if(creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
        if(creep.memory.role == 'builder') {
          if (constructionSites.length) {
            roleBuilder.run(creep);
          } else {
            roleUpgrader.run(creep);
          }
        }
    }
};
