var roleClaimer = {
  run: function(creep) {
    if (creep.memory.claimFlag === undefined) {
      const claimedFlagNames = _.map(Game.creeps, function(creep) {
        return creep.memory.claimFlag;
      });

      const unclaimedFlags = _.filter(Game.flags, (flag) =>
        flag.name.startsWith('ClaimFlag') &&
        !_.any(claimedFlagNames, function (name) {
          return name === flag.name;
        })
      );

      if (unclaimedFlags.length) {
        creep.memory.claimFlag = unclaimedFlags[0].name;
      } else {
        return;
      }
    }

    const flag = Game.flags[creep.memory.claimFlag];
    if (flag.pos.roomName === creep.room.name) {
      const roomController = creep.room.controller;
      if (roomController && roomController.my === false || roomController.my === undefined) {
        if (roomController.level > 0) {
          // TODO: if creep has less than 5 CLAIM parts, can't attack.
          if (creep.attackController(roomController) === ERR_NOT_IN_RANGE) {
            creep.moveTo(roomController);
            creep.attackController(roomController);
          }
          return;
        } else {
          if (creep.memory.claimFailed === undefined) {
            const claimResult = creep.claimController(roomController);
            switch (claimResult) {
              case OK:
                console.log(`${creep.memory.role} ${creep} successfully claimed ${roomController} in ${creep.room.name}!`);
                Game.notify(`${creep.memory.role} ${creep} successfully claimed ${roomController} in ${creep.room.name}!`);
                flag.remove();
                // TODO add NewSpawnFlag# ?
                break;
              case ERR_NOT_IN_RANGE:
                creep.moveTo(roomController);
                creep.claimController(roomController);
                break;
              case ERR_FULL:
                console.log(`${creep.memory.role} ${creep} unable to claim ${roomController} due to Novice Area limit.`);
                creep.memory.claimFailed = true;
                break;
              case ERR_GCL_NOT_ENOUGH:
                console.log(`${creep.memory.role} ${creep} unable to claim ${roomController} due to GCL too low.`);
                creep.memory.claimFailed = true;
                break;
              default:
                console.log(`${creep.memory.role} ${creep} unable to claim ${roomController} due to error: ${claimResult}`);
                break;
            }
          } else {
            if (creep.reserveController(roomController) === ERR_NOT_IN_RANGE) {
              creep.moveTo(roomController);
              creep.reserveController(roomController);
            }
          }
        }
      }
    } else {
      creep.moveTo(flag);
    }
  }
};

module.exports = roleClaimer;
