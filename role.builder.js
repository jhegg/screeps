var roleBuilder = {
  run: function(creep, constructionSites, droppedResources) {

    if (creep.memory.building && creep.carry.energy === 0) {
      creep.memory.building = false;
      creep.say('harvesting');
    }
    if (!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
      creep.memory.building = true;
      creep.say('building');
    }

    if (creep.memory.building) {
      var constructionSiteWithMostProgress = constructionSites.sort(function(a, b) {
        return b.progress - a.progress;
      })[0];
      if (creep.build(constructionSiteWithMostProgress) == ERR_NOT_IN_RANGE) {
        creep.moveTo(constructionSiteWithMostProgress);
      }
    } else {
      if (droppedResources.length > 0) {
        if (creep.pickup(droppedResources[0]) == ERR_NOT_IN_RANGE) {
          creep.moveTo(droppedResources[0]);
        }
        return;
      }

      const source = Game.getObjectById(creep.memory.sourceId);
      if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
        creep.moveTo(source);
      }
    }
  }
};

module.exports = roleBuilder;
