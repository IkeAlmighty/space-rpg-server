// actionHandlers.js
// each action signature should have the parameters of (args, callback)
// where args an object of string arguments, and callback contains json data
// to send back to the client.

// Global state object
const state = {
  entities: {},
};

const getPosition = ({entityId}, callback) => {
  state.entities[entityId].updatePosition();
  callback({position: state.entities[entityId].position});
};

const sendResource = (
  {entityId, resourceType, amount, destinationEntityId},
  callback
) => {
  // if the entitie are not in close proximity to one another,
  // then return and let the client know that the trade cannot
  // happen without proximity
  state.entities[entityId].updatePosition();
  state.entities[destinationEntityId].updatePosition();
  const {x1, y1, z1} = state.entities[entityId].position;
  const {x2, y2, z2} = state.entities[destinationEntityId].position;
  const distance = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2 + (z1 - z2) ** 2);
  if (distance > 2000) {
    callback({
      distanceError:
        "Entities must be less than 2000 units apart to send resources to one another.",
    });
    return;
  }

  //attempt to transfer the amount specified
  if (state.entities[entityId].resources[resourceType] < amount) {
    callback({
      notEnoughResourcesError: `Entity of id ${entityId} does not have enough ${resourceType} for this transaction`,
    });
  }

  state.entities[destinationEntityId].resources[resourceType] += amount;
  state.entities[destinationEntityId].resources[resourceType] -= amount;

  callback({[resourceType]: state.entities[entityId].resources[resourceType]});
};

module.exports = {
  getPosition,
  sendResource,
  // Add more action handlers as needed
};
